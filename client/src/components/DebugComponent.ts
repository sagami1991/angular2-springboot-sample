import {Component} from "@angular/core";
import {Http} from "@angular/http";
import {NumberFormatPipe} from "../util/Util";

const numeral = require("numeral");

@Component({
	selector: ".main-container",
	template:`
	<div class="header">
		<div class="title">サーバー情報</div>
	</div>
	<table class="table">
		<tr *ngFor="let item of debugPrefix">
			<td>{{item.label}}</td>
			<td>{{item.value | numberFormat:item.format}}  {{item.suffix}}</td>
		</tr>
	</table>
	`,
	pipes: [NumberFormatPipe]
})
export class DebugComponent {
	private debug; //: DebugInfo;
	private debugPrefix = [
		{
			prop: "version",
			label: "更新日時",
			suffix: "",
			value: VERSION
		},
		{
			prop: "osName",
			label: "OS",
			suffix: "",
			value: null
		},
		{
			prop: "totalMem",
			label: "合計メモリ",
			suffix: "MB",
			format: "0,0",
			value: null
		},
		{
			prop: "useMem",
			label: "使用メモリ",
			suffix: "MB",
			format: "0,0",
			value: null
		},
		{
			prop: "perMem",
			label: "メモリ使用率",
			suffix: "%",
			value: null
		},
		{
			prop: "totalSpace",
			label: "合計容量",
			suffix: "GB",
			value: null
		},
		{
			prop: "freeSpace",
			label: "空き容量",
			suffix: "GB",
			value: null
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
			_.each(this.debugPrefix, (obj) => {
				if (!obj.value) obj.value = data[obj.prop];
			});
		});
	}
}
