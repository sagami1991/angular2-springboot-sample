import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'number'})
export class NumberPipe implements PipeTransform {
	transform(value, args:string[]) : any {
	const res = [];
	for (let i = 0; i < value; i++) {
		res.push(i);
	}
	return res;
	}
}

@Pipe({name: 'dateToString'})
export class DateFormatPipe implements PipeTransform {
	transform(timestamp: number, args:string[]) : any {
		const date = new Date(timestamp);
		return `${date.getMonth() + 1 }月${date.getDate()}日 ${date.getHours()}時 ${date.getMinutes()}分`; 
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
		//一度エスケープする
		str = _.escape(str);
		return str.replace(/&amp;#([0-9]{1,7});/g, (matchstr, parens) => this.decode(Number(parens))); 
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