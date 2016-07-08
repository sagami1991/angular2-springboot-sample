import {Pipe, PipeTransform, Injectable} from '@angular/core';
import {Http, URLSearchParams} from "@angular/http";
import {DomSanitizationService, SafeHtml} from '@angular/platform-browser';
import {Router, NavigationEnd } from "@angular/router";
const dateFormat = require('dateformat');
const numeral = require("numeral");

@Pipe({name: 'number'})
export class NumberToArrayPipe implements PipeTransform {
	transform(value: number, args:string[]) : any {
		const res = [];
		for (let i = 0; i < value; i++) {
			res.push(i);
		}
		return res;
	}
}

/** 数字をカンマ区切りに */
@Pipe({name: 'numberFormat'})
export class NumberFormatPipe implements PipeTransform {
	transform(num: number, arg:string): string | number {
		if (arg === undefined) return num;
		return numeral(num).format(arg);
	}
}

@Pipe({name: 'dateToString'})
export class DateFormatPipe implements PipeTransform {
	transform(timestamp: number | string | Date, args:string[]) : any {
		const date = new Date(Number(timestamp));
		return dateFormat(date, "mm月dd日 HH:MM"); 
	}
}

@Pipe({name: 'safe'})
export class Safe {
	constructor(private sanitizer:DomSanitizationService){}
	transform(style) {
		return this.sanitizer.bypassSecurityTrustHtml(style);
	}
}


/** 文章渡すと$#xxxxxの文字を絵文字の画像タグに変換 */
export class ConvertUtil {
	public static delTensai(str: string) {
		return str.replace(/(\[無断転載禁止\])?&#169;2ch.net/, "");
	}
	
	public static emoji(text: string) {
		return text.replace(/&(amp;)?#([0-9]{1,7});/g, (matchstr, dammy, parens) => {
			return emojione.unicodeToImage(this.decode(Number(parens)));
		});
	}

	private static decode ( n: number ): string {
		if (n <= 0xFFFF) {
			return String.fromCharCode(n);
		}	else if (n <= 0x10FFFF) {
			n -= 0x10000;
			return String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF));
		} else { 
			return "[error:絵文字パースできない]";
		}
	}

}

//子からルーターへイベント発火させる方法わからないのでセレクタで対処
// TODO 読込み中画面はbodyではなくパネル内のみ
export function stopLoading(stop: boolean) {
	document.querySelector("#router").setAttribute("class", stop ? "" : "loading");
};

export class Notify {
	public static error(msg: string) {
		humane.spawn({addnCls: "humane-error", timeout: 5000})(msg);
	};
	public static warning(msg: string) {
		humane.spawn({addnCls: "humane-warning", timeout: 5000})(msg);
	};
	public static success(msg: string) {
		humane.spawn({addnCls: "humane-success", timeout: 5000})(msg);
	};
	/** ここ通った時に実行される */
	private static onInit = (() => document.addEventListener("click", (event) =>{
		const target = <Element> event.target;
		if (target.className.indexOf("humane") === -1) {
			humane.remove();
		}
	}))();
}

//エラーハンドラ
export function errorHandler(error) {
		let body;
	try {
		body = JSON.parse(error._body);
	} catch (error) {}
		switch (error.status) {
		case 500:
			Notify.error(`原因不明のエラー${body.exception}<br>${body.message}`);
			console.warn(`原因不明のエラー${body.exception}<br>${body.message}`);
			break;
		case 304:
			Notify.warning('新着なし');
			break;
		case 501:
			Notify.error('dat落ち');
			break;
	}
}

// param作る
export function createParam(paramArr: {[key:string]:string}) {
	let params = new URLSearchParams();
	_.each(paramArr, (param, key:string) => { params.set(key, param); });
	return {search:params};
} 

@Injectable()
export class WorkSpaceService {
	public sureList: WorkSure[];
	private key = "sureList";
	constructor(private router: Router) {
		this.refresh();
		this.falseAll();
		router.events.subscribe( navigate => {
			if (navigate instanceof NavigationEnd && !/\/sure\//.test(navigate.urlAfterRedirects)) {
				this.falseAll();
			}
		});
	}

	/** ローカルストレージから取得する */
	public refresh() {
		const localData: string = localStorage.getItem(this.key);
		this.sureList = localData ? JSON.parse(localData) : [];
	}

	/** 削除後ローカルストレージに保存 */
	public delete(idx:number) {
		this.sureList.splice(idx, 1);
		localStorage.setItem(this.key, JSON.stringify(this.sureList));
	}	

	/** スレ開いた時、ローカルストレージに追加し更新 */
	public append(sure: WorkSure) {
		this.falseAll();
		const target = _.find(this.sureList, localSure => localSure.url === sure.url);
		if (!target) {
			this.sureList.push(sure);
		} else {
			target.isActive = true;
		}
		localStorage.setItem(this.key, JSON.stringify(this.sureList));
	}

	private falseAll() {
		for (let localSure of this.sureList) {
			localSure.isActive = false;
		}
	}

}

export interface WorkSure {
	title: string;
	trustTitle: string;
	url: string;
	isActive: boolean;
}

export var CONST = {
	nowYear : new Date().getFullYear().toString()
};

