import {Component} from "@angular/core";
import {ActivatedRoute, ROUTER_DIRECTIVES} from "@angular/router";
import {Sure, Board} from "../interfaces";
import {Http} from "@angular/http";
import {stopLoading, errorHandler, DateFormatPipe, NumberFormatPipe, ConvertUtil, Safe}
	from "../util/Util";

@Component({
	selector: ".main-container",
	template:`
	<div class="header">
		<div class="title">{{board?.name}} - {{board?.domain}}</div>
		<div class="func-area" *ngIf="sures">
			<button (click)="fetch()" class="cercle-button tooltip" data-tooltip="更新">
				<i class="material-icons md-36">refresh</i>
			</button>
		</div>
	</div>
	<div class="sort-area">
		<button class="btn btn-default tooltip"
			[class.active]="sort[0].attr"
			data-tooltip="勢い順でソートする"
			(click)="doSort('ikioi')">勢い</button>
		<button class="btn btn-default tooltip"
			[class.active]="sort[1].attr"
			data-tooltip="スレッドの立った日が新しい順でソートする"
			(click)="doSort('date')">新しい</button>
	</div>
	<ul *ngIf="sures">
		<li *ngFor="let sure of sures" class="sure-row">
			<div class="suretai" face="symbol">
				<a [routerLink]="['/sure', sure.id]"
					[innerHTML]="sure.suretai | safe"
				></a>
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
	pipes: [DateFormatPipe, NumberFormatPipe, Safe]
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
	constructor(private route: ActivatedRoute,
				private http: Http) {};

	private ngOnInit() {
		this.fetch();
	}

	private fetch() {
		stopLoading(false);
		this.http.get(`api/sureran/bid/${this.route.snapshot.params["id"]}`)
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
			sure.suretai = ConvertUtil.emoji(ConvertUtil.delTensai(sure.suretai));
			sure.date = new Date(Number(sure.datNo) * 1000);
			let deltaTime = new Date().getTime() - sure.date.getTime();
			deltaTime = deltaTime < 1000 ? 1000 : deltaTime;
			sure.ikioi = sure.length / deltaTime * 1000 * 3600 * 24;
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
