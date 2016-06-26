import {Component, ChangeDetectorRef} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Sure, Board, Dat, Res, Tokka} from "../interfaces";
import {Http, URLSearchParams} from "@angular/http";
import {Pipe, PipeTransform} from '@angular/core';
import {errorHandler, stopLoading, NumberFormatPipe, ConvertUtil} from "../util/Util";
const toastr = require('toastr/toastr');


@Pipe({name: "resFilter"})
class ResFilter implements PipeTransform {
	transform(resArr: Res[], fType: string):  Res[] {
		let returnArr: Res[];
		switch (fType) {
		case "shop":
			returnArr = resArr.filter(res => res.thumbs.length > 0);
			break;
		case "image":
			returnArr = resArr.filter(res => /\h?ttps?:\/\/[^\s]+\.(png|gif|jpg|jpeg)/.test(res.honbun));
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
	template:require("./sure.html"),
	styles: [require("./sure.scss")],
	directives: [ROUTER_DIRECTIVES],
	pipes: [NumberFormatPipe, ResFilter]
})
export class SureComponent {
	private board: Board;
	private sure: Sure;
	private dat: Dat;
	private humanIds: {[key:string]:HumanId};
	//絵文字にエンコード
	private nowFilterType: string;
	private isComplete: boolean;
	private filters: MyFilter[] = [
		{
			label: "人気",
			type: "popular",
			state:"",
			enable: false
		},
		{
			label: "画像",
			type: "image",
			state:"",
			enable: false
		}, {
			label: "特価",
			type: "shop",
			state:"",
			enable: false
		}
	];
	constructor(private ref: ChangeDetectorRef,
							private params: RouteParams,
							private http: Http) {};

	private ngOnInit() {
		this.humanIds = {};
		stopLoading(false);
		this.http.get(`api/dat/sid/${this.params.get("id")}`)
		.map(res => res.json())
		.finally(() => {
			stopLoading(true);
			this.isComplete = true;
		})
		.subscribe(data => {
			this.board = (<any>data).board;
			this.sure = (<any>data).sure;
			this.dat = (<any>data).dat;
			if (this.dat.otiteru) toastr.error("dat落ち");
			const name = this.board.defaultName;
			this.board.defaultName = name ? name.replace("＠無断転載禁止", "") : "";
			this.dat.title = ConvertUtil.emoji(this.dat.title);
			this.convertRes(this.dat.resList, 0);
		}, e => errorHandler(e));
	}

	/** フィルターを切り替える */
	private toggleFilter(argfilter: MyFilter):void {
		_.each(this.filters, f => { f.enable = argfilter.type === f.type ? !f.enable : false; });
		this.nowFilterType = argfilter.enable ? argfilter.type : "";
	}

	/** 差分更新を行う（右上の更新アイコン） */
	private getSabun() {
		let params = new URLSearchParams();
		params.set("length", this.dat.resList.length.toString());
		this.http.get(`api/dat/sabun/${this.params.get("id")}`, {search:params})
		.map(res => res.json())
		.subscribe(data => {
			toastr.success(`${data.length}件差分取得`);
			this.convertRes(data, this.dat.resList.length);
		},
			e => errorHandler(e)
		);
	}

	/** レスリストを色々変換 */
	private convertRes(resArr: Res[], start: number) {
		_.each(resArr, (res: Res, i:number) => {
			res.index = i + start;
			//ID連想配列生成
			if (!this.humanIds[res.id]) this.humanIds[res.id] = {resIdxes: [res.index] };
			else this.humanIds[res.id].resIdxes.push(res.index);

			//アンカーリンク作成
			res.fromAnkers = [];
			res.honbun = res.honbun.replace(/&gt;&gt;([0-9]{1,4})/g, (match, $1: string) => {
				const resIdx = Number($1) - 1;
				if (res.index > resIdx) this.dat.resList[resIdx].fromAnkers.push(i);
				return `<a class="anker-to" data-to="${Number($1) - 1}">&gt;&gt;${$1}</a>`;
			});

			//httpリンク作成
			res.honbun = res.honbun.replace(/h?(ttps?:\/\/[^\s]+)/g, (url, $1: string) => {
				return `<a href="h${$1}" target="_blank">h${$1}</a>`;
			});
			//絵文字化
			res.honbun = ConvertUtil.emoji(res.honbun);
			// サムネイルリスト作成
			res.thumbs = [];
			// const reg = new RegExp("https?:\/\/www\.amazon\.co\.jp.+?(B0........)", "g");
			// let exeArr: RegExpExecArray;
			// if (exeArr = reg.exec(res.honbun)) {
			// 	const tokkaKey = `www.amazon.co.jp/dp/${exeArr[1]}`;
			// 	let tokkaInfo: Tokka;
			// 	if (tokkaInfo = _.find(this.dat.tokkaList, {id:tokkaKey})) {
			// 				res.thumbs.push(tokkaInfo);
			// 	}
			// }
			if(start !== 0) this.dat.resList.push(res);
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
			res.idCount = resArr ? `(${resArr.indexOf(i) + 1}/${resArr.length})` : "";
			res.idColor =
				resArr.length >= 5 ? "red" :
				resArr.length >= 2 ? "blue" :
														"normal";
													
		});
	}


	private showResById(id: string) {
		alert(`todo このIDのレス番 ${JSON.stringify(this.humanIds[id])}`);
	}

	private showResByIndexes(indexes: number[]) {
		if (indexes.length === 0) return;
		alert(`todo アンカーされているレス番 ${JSON.stringify(indexes)}`);
	}

	private showAnkerTo(event: Event, nowIdx:number) {
		const elem = <HTMLElement> event.target;
		const ankerToStr = elem.getAttribute("data-to");
		const ankerToNum = Number(ankerToStr);
		//未来にあんかーされている場合飛ばす
		if (!ankerToStr || ankerToNum > nowIdx) return;
		alert(`todo アンカー先のレス番 ${ankerToNum}`) 
	}
}

interface HumanId {
	resIdxes: number[]; //そのIDのレス番号を入れる
}

interface MyFilter {
	label: string;
	type: string;
	state: string;
	enable: boolean;

}
