import {Component} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {DebugInfo} from "../interfaces";
import {Http, URLSearchParams} from "@angular/http";
import {EmojiPipe} from "../util/Util";


@Component({
	template:`
	<div class="header">
		<div class="title">サーバー情報</div>
	</div>
	<table *ngIf="debug" class="table">
		<tr *ngFor="let item of debugPrefix">
			<td>{{item.label}}</td>
			<td>{{debug[item.prop]}}  {{item.suffix}}</td>
		</tr>
	</table>

	`,
	// styles: [require("./board.scss")],
	// directives: [ROUTER_DIRECTIVES],
	// pipes: [EmojiPipe]
})
export class DebugComponent {
	private debug: DebugInfo;
	private debugPrefix = [
		{
			prop: "totalMem",
			label: "合計メモリ",
			suffix: "MB"
		},
		{
			prop: "useMem",
			label: "使用メモリ",
			suffix: "MB"
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

	private ngOnInit() {
		this.http.get(`api/setting/debug`)
		.map(res => res.json())
		.subscribe(data => this.debug = data);
	}
}
