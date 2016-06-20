import {Component} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Sure, Board, Dat, Res, Tokka} from "../interfaces";
import {Http, URLSearchParams} from "@angular/http";
import {Pipe, PipeTransform} from '@angular/core';
import {EmojiPipe, errorHandler, stopLoading, NumberFormatPipe} from "../util/Util";
const toastr = require('toastr/toastr');

@Pipe({name: "resFilter"})
class ResFilter implements PipeTransform {
	transform(resList: Res[], filterType:string) : Res[] {
		switch (filterType) {
			case "shop":
				return resList.filter(res => res.thumbs.length > 0);
			case "image":
				return resList.filter(res => 
					new RegExp("\h?ttps?:\/\/[^\s]+\.(png|gif|jpg|jpeg)", "i").exec(res.honbun) !== null
				);
			case "popular":
				return resList.filter(res => res.fromAnkers.length > 2);
			default:
				return resList;
		}
	}
}


@Component({
	template:require("./sure.html"),
	styles: [require("./sure.scss")],
	directives: [ROUTER_DIRECTIVES],
	pipes: [EmojiPipe, NumberFormatPipe, ResFilter]
})
export class SureComponent {
	private board: Board;
	private sure: Sure;
	private dat: Dat;
	private humanIds: {[key:string]:HumanId};
	private filterType: string;
	private filters: MyFilter[] = [
		{
			label: "人気",
			type: "popular",
			enable: false
		},
		{
			label: "画像",
			type: "image",
			enable: false
		}, {
			label: "特価",
			type: "shop",
			enable: false
		}
	];
	constructor(private params: RouteParams,
							private http: Http) {};

	private ngOnInit() {
		this.humanIds = {};
		this.filterType = "";

		stopLoading(false);
		this.http.get(`api/dat/sid/${this.params.get("id")}`)
		.map(res => res.json())
		.finally(() => stopLoading(true))
		.subscribe(data => {
			this.board = (<any>data).board;
			this.sure = (<any>data).sure;
			this.dat = (<any>data).dat;
			if (this.dat.otiteru) toastr.error("dat落ち");
			const name = this.board.defaultName;
			this.board.defaultName = name ? name.replace("＠無断転載禁止", "") : "";
			this.convertRes(this.dat.resList, 0);
		}, e => errorHandler(e));
	}

	/** フィルターを切り替える */
	private toggleFilter(argfilter: MyFilter) {
		_.each(this.filters, (filter) => {
			filter.enable = filter.type === argfilter.type ? !argfilter.enable : false;
		});
		this.filterType = argfilter.enable ? argfilter.type : "";
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
	}

	private getIdColor(id: string) {
		const idResCount = this.humanIds[id].resIdxes.length;
		if (idResCount >= 5) return "red";
		else if (idResCount >= 2) return "blue";
		else 	return "normal";
	}
	private getIdstate(id:string, index:number) {
		if (this.humanIds[id].resIdxes.length === 1) return "";
		return `(${this.humanIds[id].resIdxes.indexOf(index) + 1}/${this.humanIds[id].resIdxes.length})`
	}

	private getResNoState(ankeredIdxes: number[]) {
		return ankeredIdxes.length === 0 ? "" : `(${ankeredIdxes.length})`;
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

	private getResColor(ankeredIdxes: number[]) {
		const ankeredCount = ankeredIdxes.length;
		if (ankeredCount >= 3) return "ankered red";
		else if (ankeredCount >= 1) return "ankered blue";
		else return ""; 
		
	}


}

interface HumanId {
	resIdxes: number[]; //そのIDのレス番号を入れる
}

interface MyFilter {
	label: string;
	type: string;
	enable: boolean;
}
