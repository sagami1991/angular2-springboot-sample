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
