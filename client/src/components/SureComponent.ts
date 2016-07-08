import {Component, ElementRef, HostListener, Output, EventEmitter} from "@angular/core";
import {ActivatedRoute, ROUTER_DIRECTIVES, Router} from "@angular/router";
import {DomSanitizationService} from '@angular/platform-browser';
import {Sure, Board, Dat, Res} from "../interfaces";
import {Http, URLSearchParams} from "@angular/http";
import {Pipe, PipeTransform} from '@angular/core';
import {errorHandler, stopLoading, NumberFormatPipe, Notify,
		ConvertUtil, Safe, WorkSpaceService, WorkSure, CONST} from "../util/Util";
import {ResComponent, PopupEvent} from "./ResComponent";


@Pipe({name: "resFilter"})
class ResFilter implements PipeTransform {
	transform(resArr: Res[], fType: string):  Res[] {
		let returnArr: Res[];
		switch (fType) {
		case "shop":
			returnArr = resArr.filter(res => res.thumbs && res.thumbs.findIndex(thumb => thumb.type === "tokka") !== -1);
			break;
		case "image":
			returnArr = resArr.filter(res => res.thumbs.findIndex(thumb => thumb.type === "img") !== -1);
			break;
		case "popular":
			returnArr = resArr.filter(res => res.fromAnkers.length > 2);
			break;
		default:
			return resArr;
		}
		return returnArr;
	}
}

@Component({
	selector: ".main-container",
	template:require("./sure.html"),
	styles: [require("./sure.scss")],
	directives: [ROUTER_DIRECTIVES, ResComponent],
	pipes: [NumberFormatPipe, ResFilter, Safe]
})
export class SureComponent {
	@Output() append = new EventEmitter();
	private headerTitle: string;
	private elem: HTMLElement;
	private board: Board;
	private sure: Sure;
	private dat: Dat;
	private humanIds: {[key:string]:HumanId};
	//ポップアップレス(2次元配列)
	private popupReseses: PopupRes[][] = [];
	private nowFilterType: string;
	private isComplete: boolean;
	private filters: MyFilter[] = [
		{
			label: "人気",
			type: "popular",
			state: "", //TODO stateにはヒットしたレス数入れる予定
			enable: false,
			tooltip: "3レス以上アンカーがついたレスを抽出"
		}, {
			label: "画像",
			type: "image",
			state:"",
			enable: false,
			tooltip: "画像レスを抽出"
		}, {
			label: "特価",
			type: "shop",
			state: "",
			enable: false,
			tooltip: "amazonリンクが含まれるレスを抽出"
		}
	];
	constructor(private eRef: ElementRef,
				private route: ActivatedRoute,
				private http: Http,
				private sanitizer: DomSanitizationService,
				private workSpaceService: WorkSpaceService) {
		this.elem = <HTMLElement> this.eRef.nativeElement;
	};

	private ngOnInit() {
		this.humanIds = {};
		this.route.params.subscribe(params => {
			stopLoading(false);
			this.http.get(`api/dat/sid/${params["id"]}`)
			.map(res => res.json())
			.finally(() => {
				stopLoading(true);
				this.isComplete = true;
			})
			.subscribe(data => {
				this.board = (<any>data).board;
				this.sure = (<any>data).sure;
				this.dat = (<any>data).dat;
				if (this.dat.otiteru) Notify.error("dat落ち");
				const name = this.board.defaultName;
				this.board.defaultName = name ? name.replace("＠無断転載禁止", "") : "";
				this.dat.trustTitle = ConvertUtil.emoji(this.dat.title);
				this.convertRes(this.dat.resList, 0);
				this.headerTitle = `${this.dat.trustTitle} (${this.dat.resList.length})`;
				this.append.emit(null);
				this.workSpaceService.append({
					title: `${this.dat.title} - ${this.board.name} ${this.board.domain}`,
					trustTitle: this.dat.trustTitle,
					url: "/" + this.route.snapshot.url.join("/"),
					isActive : true
				});
			}, e => errorHandler(e));
		});
	}

	/** 絞込フィルターを切り替える */
	private toggleFilter(argfilter: MyFilter):void {
		_.each(this.filters, f => { f.enable = argfilter.type === f.type ? !f.enable : false; });
		this.nowFilterType = argfilter.enable ? argfilter.type : "";
	}

	/** 差分更新を行う（右上の更新アイコン） */
	private getSabun() {
		stopLoading(false);
		let params = new URLSearchParams();
		params.set("length", this.dat.resList.length.toString());
		this.http.get(`api/dat/sabun/${this.route.snapshot.params["id"]}`, {search:params})
		.finally(() => {stopLoading(true); })
		.map(res => <Res[]>(<any>res).json())
		.subscribe(data => {
			data = <any> data;
			Notify.success(`${data.length}件差分取得`);
			this.convertRes(data, this.dat.resList.length);
			this.headerTitle = `${this.dat.title} (${this.dat.resList.length})`;
		},
			e => errorHandler(e)
		)
	}

	/** レスリストを色々変換 */
	private convertRes(resArr: Res[], start: number) {
		//取得した差分分のみのデータ変換処理
		_.each(resArr, (res: Res, i:number) => {
			res.index = i + start;
			// 名前 全部の名前個々でとると転送量無駄なので板のデフォルト名に（いつか変える）
			res.name = this.board.defaultName;
			//ID連想配列生成
			if (!this.humanIds[res.id]) this.humanIds[res.id] = {resIdxes: [res.index] };
			else this.humanIds[res.id].resIdxes.push(res.index);

			//アンカーリンク作成
			
			res.fromAnkers = [];
			res.honbun = res.honbun.replace(/&gt;&gt;([0-9]{1,4})/g, (match, $1: string) => {
				const resIdx = Number($1) - 1;
				if (res.index > resIdx) this.dat.resList[resIdx].fromAnkers.push(res.index);
				return `<a class="anker-to" data-to="${Number($1) - 1}">&gt;&gt;${$1}</a>`;
			});

			// サムネイルリスト作成
			res.thumbs = [];
			let reg = new RegExp("h?ttps?:.+\.(png|gif|jpg|jpeg)", "g");
			let exeArr: RegExpExecArray;
			let j = 0;
			while (exeArr = reg.exec(res.honbun)) {
				res.thumbs.push({
					type: "img",
					isOpen: false,
					info: {
						imgUrl: exeArr[0]
					}
				});
			}
			//特価 格納
			reg = new RegExp("https?:\/\/www\.amazon\.co\.jp.+?(B0........)", "g");
			j = 0;
			while (exeArr = reg.exec(res.honbun)) {
				if (j++ > 2) break;
				const tokkaKey = `www.amazon.co.jp/dp/${exeArr[1]}`;
				res.thumbs.push({
					type: "tokka",
					isOpen: false,
					info: {
						id: tokkaKey,
						siteName:"amazon"
					}
				});
			}

			//httpリンク作成
			res.honbun = res.honbun.replace(/h?(ttps?:\/\/[^\s]+)/g, (url, $1: string) => {
				return `<a class="default" href="h${$1}" target="_blank">h${$1}</a>`;
			});

			//絵文字化
			res.honbun = ConvertUtil.emoji(res.honbun);
			res.trustHonbun = this.sanitizer.bypassSecurityTrustHtml(res.honbun);

			//年が今年の場合削除
			res.postDate = res.postDate.replace(new RegExp(`^${CONST.nowYear}/`, "i"), () => "");

			//差分取得時はレスリストに入れる
			if (start !== 0) this.dat.resList.push(res);
		});

		//全てのレスに対して処理をかける
		_.each(this.dat.resList, (res, i) => {
			const ankeredCount =  res.fromAnkers.length;
			res.ankerCount = ankeredCount ? `(${ankeredCount})` : "";
			res.noColor = 
				ankeredCount >= 3 ? "red" :
				ankeredCount >= 1 ? "blue" :
									"normal";
			const resArr = this.humanIds[res.id].resIdxes;
			res.idCount = resArr.length > 1 ? `(${resArr.indexOf(i) + 1}/${resArr.length})` : "";
			res.idColor =
				resArr.length >= 5 ? "red" :
				resArr.length >= 2 ? "blue" :
									"normal";
		});
	}
	/** 一番上or一番下に移動する機能 */
	private scroll(type:string) {
		const $sureArea = document.querySelector(".main-container");
		if (!$sureArea) {
			Notify.error("原因不明のエラー、スレエリアを取得できない");
			return;
		}
		const height = 
			type === "top" 	  ? 0 :
			type === "bottom" ? $sureArea.scrollHeight :
								0;
		$sureArea.scrollTop = height; 
	}

	/** ポップアップ外クリックされたら閉じる */
	@HostListener('document: click', ['$event.target'])
	private closePopup(target: HTMLElement) {
		if (!this.popupReseses) return;
		const $popup = this.elem.querySelectorAll(".popup-wrapper")[this.popupReseses.length - 1];
		if ($popup && !$popup.contains(target) ) {
			this.popupReseses.pop();
		}
	}

	/** ポップアップする（子コンポーネントからtriggerされる） */
	private onPopup(popupEvent: PopupEvent) {
		event.stopPropagation();
		const popups: PopupRes[] = [];
		_.each(popupEvent.idxArr, (idx) => {
			popups.push({nest: 0, res: this.dat.resList[idx]});
			if (popupEvent.isSaiki) this.searchAnker(popups, idx, 1);
		});
		this.popupReseses.push(popups);
	}
	
	/**ポップアップ用　再帰的にアンカー先のレスを探す */
	private searchAnker(popups: PopupRes[], idx:number, nestCount: number) {
		const resList = this.dat.resList;
		_.each(resList[idx].fromAnkers, (fromAnkerIdx) => {
			popups.push({nest: nestCount, res: resList[fromAnkerIdx]});
			this.searchAnker(popups, fromAnkerIdx, nestCount + 1);
		});
	}
}

export interface HumanId {
	resIdxes: number[]; //そのIDのレス番号を入れる
}

interface MyFilter {
	label: string;
	type: string;
	state: string;
	enable: boolean;
	tooltip: string;
}

interface PopupRes {
	nest: number;
	res: Res;
}
