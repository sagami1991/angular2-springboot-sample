import {Component} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Sure, Board, Dat, Res} from "../interfaces";
import {Http, URLSearchParams} from "@angular/http";
import {EmojiPipe} from "../util/Util";
const toastr = require('toastr/toastr');

@Component({
	template:`
	<div class="header">
		<div class="title">スレ</div>
		<div class="func-area" *ngIf="board">
			<a [routerLink]="['/Board', {id: board.id}]" class="glyphicon glyphicon-arrow-left"></a>
			<a (click)="getSabun()" class="glyphicon glyphicon-refresh"></a>
		</div>
	</div>
	<div *ngIf="board">
		<h3 [innerHTML]="dat.title + '(' + dat.resList.length + ')' | toEmoji"></h3>
		<div *ngFor="let res of dat.resList; let i = index" class="res-wrapper">
			<div class="res-header">
				<span class="res-no">{{i + 1}}</span>
				<span class="res-name">名前: {{board.defaultName}}</span>
				<span class="res-postdate">{{res.postDate}}</span>
				<span class="res-id">ID: {{res.id}}</span>
			</div>
			<div class="res-body" [innerHTML]="res.honbun | toEmoji">
			</div>
		</div>
	</div>
	`,
	styles: [require("./sure.scss")],
	directives: [ROUTER_DIRECTIVES],
	pipes: [EmojiPipe]
})
export class SureComponent {
	private board: Board;
	private sure: Sure;
	private dat: Dat;
	private ResList: any[];
	constructor(private params: RouteParams,
							private http: Http) {};

	private ngOnInit() {
		this.http.get(`api/dat/sid/${this.params.get("id")}`)
		.map(res => res.json())
		.subscribe(data => {
			this.board = data.board;
			this.sure = data.sure;
			this.dat = data.dat;
			if (this.dat.otiteru) {
				toastr.error("dat落ち");
			}
		},
			this.errorHandler
		);
	}

	private getSabun() {
		let params = new URLSearchParams();
		params.set("length", this.dat.resList.length.toString());
		this.http.get(`api/dat/sabun/${this.params.get("id")}`, {search:params})
		.map(res => res.json())
		.subscribe(data => {
			//concatだと全部入れ替えなきゃいけない
			_.each((<Res[]> data), res => {this.dat.resList.push(res); });
			toastr.success(`${data.length}件差分取得`);
		},
			this.errorHandler
		);
	}

	private errorHandler(error) {
			switch (error.status) {
				case 500:
					toastr.warning('原因不明のエラー' + error.error);
					break;
				case 304:
					toastr.warning('新着なし');
					break;
				case 501:
					toastr.error('dat落ち');
					break;
			}
	}
}
