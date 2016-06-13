import {Component} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Sure, Board} from "../interfaces";
import {Http, URLSearchParams} from "@angular/http";
import {EmojiPipe} from "../util/Util";


@Component({
	template:`
	<div class="header">
		<div class="title">スレ一覧</div>
	</div>
	<h2 *ngIf="board">
		{{board.name}}
	</h2>
	<table *ngIf="sures" class="table">
		<thead>
		<tr>
			<th class="suretai">スレタイ</th>
			<th>レス数</th>
		</tr>
		</thead>
		<tr *ngFor="let sure of sures">
			<td class="suretai" face="symbol">
				<a [routerLink]="['/Sure', {id: sure.id}]" [innerHTML]="sure.suretai | toEmoji"></a>
			</td>
			<td>{{sure.length}}</td>
		</tr>
	</table>

	`,
	styles: [require("./board.scss")],
	directives: [ROUTER_DIRECTIVES],
	pipes: [EmojiPipe]
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
