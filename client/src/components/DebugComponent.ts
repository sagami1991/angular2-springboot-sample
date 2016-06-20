import {Component} from "@angular/core";
import {Http} from "@angular/http";
import {NumberFormatPipe} from "../util/Util";

const numeral = require("numeral");

@Component({
	template:`
	<div class="header">
		<div class="title">サーバー情報</div>
	</div>
	<table *ngIf="debug" class="table">
		<tr *ngFor="let item of debugPrefix">
			<td>{{item.label}}</td>
			<td>{{debug[item.prop] | numberFormat:item.format}}  {{item.suffix}}</td>
		</tr>
	</table>
	`,
	pipes: [NumberFormatPipe]
})
export class DebugComponent {
	private debug; //: DebugInfo;
	private debugPrefix = [
		{
			prop: "osName",
			label: "OS",
			suffix: ""
		},
		{
			prop: "totalMem",
			label: "合計メモリ",
			suffix: "MB",
			format: "0,0"
		},
		{
			prop: "useMem",
			label: "使用メモリ",
			suffix: "MB",
			format: "0,0"
		},
		{
			prop: "perMem",
			label: "メモリ使用率",
			suffix: "%"
		},
		{
			prop: "totalSpace",
			label: "合計容量",
			suffix: "GB"
		},
		{
			prop: "freeSpace",
			label: "空き容量",
			suffix: "GB"
		}
	];
	constructor(private http: Http) {};
	private format(value: number | string) {
		return typeof value === "number" ? numeral(value).format("0,0") : value;
	}
	private ngOnInit() {
		this.http.get(`api/setting/debug`)
		.map(res => res.json())
		.subscribe(data => {
			this.debug = data;
		});
	}
}
