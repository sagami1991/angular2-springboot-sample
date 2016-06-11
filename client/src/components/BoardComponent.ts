import {Component} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Sure, Board} from "../interfaces";
import {Http, URLSearchParams} from "@angular/http";
import {NumberPipe, DateFormatPipe} from "../util/Util";


@Component({
	template:`
	<h2 *ngIf="board">
		{{board.name}}
	</h2>
	<table *ngIf="sures">
		<thead>
		<tr>
			<td class="suretai">スレタイ</td>
			<td>レス数</td>
		</tr>
		</thead>
		<tr *ngFor="let sure of sures">
			<td class="suretai" face="symbol">
				<a [routerLink]="['/Sure', {id: sure.id}]">{{sure.suretai}}</a>
			</td>
			<td>{{sure.length}}</td>
		</tr>
	</table>

	`,
	styles: [require("./board.scss")],
	directives: [ROUTER_DIRECTIVES],
})
export class BoardComponent {
	private board: Board;
	private sures: Sure[];
	constructor(private params: RouteParams,
							private http: Http) {};

	private ngOnInit() {
		this.http.get(`api/sureran/bid/${this.params.get("id")}`)
		.map(res => res.json())
		.subscribe(data => {
			this.sures = data.sures;
			this.board = data.board;
		});
	}
}
