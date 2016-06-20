import {Component} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Sure, Board} from "../interfaces";
import {Http} from "@angular/http";
import {EmojiPipe, DeleteTensaiPipe, stopLoading, errorHandler, DateFormatPipe, NumberFormatPipe}
	from "../util/Util";

@Component({
	template:`
	<div class="header">
		<div class="title">スレ一覧</div>
		<div class="func-area" *ngIf="sures">
			<a (click)="fetch()" class="glyphicon glyphicon-refresh"></a>
		</div>
	</div>
	<h2 *ngIf="board">
		{{board.name}}
	</h2>
	<div class="sort-area">
		<button class="btn btn-default" [class.btn-primary]="sort[0].attr"
			(click)="doSort('ikioi')">勢い</button>
		<button class="btn btn-default" [class.btn-primary]="sort[1].attr"
			(click)="doSort('date')">新しい</button>
	</div>
	<ul *ngIf="sures">
		<li *ngFor="let sure of sures" class="sure-row">
			<div class="suretai" face="symbol">
				<a [routerLink]="['/Sure', {id: sure.id}]" [innerHTML]="sure.suretai | delTensai | toEmoji"></a>
			</div>
			<div class="sub">
				<div class="hiduke">{{sure.date | dateToString}}</div>
				<div class="ikioi {{sure.ikioiColor}}" >{{sure.ikioi | numberFormat:'0.0'}}</div>
				<div class="length">{{sure.length}}</div>
				
			</div>
		</li>
	</ul>

	`,
	styles: [require("./board.scss")],
	directives: [ROUTER_DIRECTIVES],
	pipes: [EmojiPipe, DeleteTensaiPipe, DateFormatPipe, NumberFormatPipe]
})
export class BoardComponent {
	private sort = [
		{
			prop: "ikioi",
			attr: false
		},
		{
			prop: "date",
			attr: false
		}
	];
	private board: Board;
	private sures: Sure[];
	constructor(private params: RouteParams,
							private http: Http) {};

	private ngOnInit() {
		this.fetch();
	}

	private fetch() {
		stopLoading(false);
		this.http.get(`api/sureran/bid/${this.params.get("id")}`)
		.map(res => res.json())
		.finally(() => stopLoading(true))
		.subscribe(
			data => {
				this.sures = (<any>data).sures;
				this.board = (<any>data).board;
				this.convertSures();
			}, 
			e => errorHandler(e)
		);
	}

	private convertSures() {
		let ikioiAve = 0;
		for (let sure of this.sures) {
			sure.date = new Date(Number(sure.datNo) * 1000);
			sure.ikioi = sure.length / (new Date().getTime() - sure.date.getTime() ) * 1000 * 3600 * 24;
			ikioiAve += sure.ikioi;
		}

		ikioiAve = ikioiAve / this.sures.length;
		for (let sure of this.sures) {
			if (sure.ikioi > ikioiAve * 3 ) {
				sure.ikioiColor = "red";
			} else if (sure.ikioi > ikioiAve * 2) {
				sure.ikioiColor = "blackRed";
			} else {
				sure.ikioiColor = "";
			}
		}

		const sortObj = _.find(this.sort, {attr: true});
		if (sortObj) {
			this.sures = _.sortBy(this.sures, sure => -sure[sortObj.prop]);
		}
	}

	private doSort(prop: string) {
		let sortAttr = _.find(this.sort, {prop: prop});
		if (!sortAttr) throw "hogege";
		_.each(this.sort, sort => { sort.attr = sort.prop === prop ? !sortAttr.attr : false });
		this.sures = _.sortBy(this.sures, sure => (sortAttr.attr ? -1 : 1) * sure[sortAttr.prop]);
	}
}
