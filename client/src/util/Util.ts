import {Pipe, PipeTransform} from '@angular/core';
const dateFormat = require('dateformat');
const toastr = require('toastr/toastr');
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

/**  転載禁止削除 */
@Pipe({name: 'delTensai'})
export class DeleteTensaiPipe implements PipeTransform {
	transform(str: string, args:string[]) : any {
		return str.replace(" [無断転載禁止]&#169;2ch.net", "");
	}
}

/**
 * &#****; みたいな文字を絵文字画像タグに変換する
 * タグを返すので{{}}ではなくinnerHtmlを使用
 */
@Pipe({name: 'toEmoji'})
export class EmojiPipe implements PipeTransform {
	transform(text: string, args:string[]) : any {
		return emojione.unicodeToImage(this.conv(text));
	}
	//#&～～～みたいな文字を無理やり絵文字にする
	private conv(str: string) {
		//エスケープはしない
		return str.replace(/&#([0-9]{1,7});/g, (matchstr, parens) => this.decode(Number(parens))); 
	}

	private decode ( n: number ) {
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
export function stopLoading(stop: boolean) {
	document.querySelector("#router").setAttribute("class", stop ? "" : "loading");
};


//エラーハンドラ
export function errorHandler(error) {
		let body;
	try {
		body = JSON.parse(error._body);
	} catch (error) {}
		switch (error.status) {
			case 500:
				toastr.error(`原因不明のエラー${body.exception}<br>${body.message}`);
				break;
			case 304:
				toastr.warning('新着なし');
				break;
			case 501:
				toastr.error('dat落ち');
				break;
		}
	}