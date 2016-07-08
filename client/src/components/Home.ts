import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router";
import {Board} from "../interfaces";
import {Title}    from '@angular/platform-browser';
import {Http, URLSearchParams} from "@angular/http";
import {stopLoading} from "../util/Util";

@Component({
	selector: ".main-container",
	template:`
	<div class="header">
		<div class="title">{{headerTitle}}</div>
	</div>
	<h3>人気の板</h3>
	<ul *ngIf="popBoards">
		<li *ngFor="let board of popBoards">
			<a [routerLink]="['/sureran', board.id]">{{board.name}}</a>
		</li>
	</ul>
	`,
	styles: [require("./home.scss")],
	directives: [ROUTER_DIRECTIVES]
	
})
export class Home {
	private static popularBoardNames = ["なんでも実況J", "ニュー速(嫌儲)", "ニュー速VIP", "ニュース速報+", "スマホアプリ",
	"野球ch", "難民", "芸スポ速報+", "自作PC"];
	private headerTitle: String;
	private popBoards: Board[];
	constructor(private http: Http,
				private routeTitle: Title) {};

	private ngOnInit() {
		this.headerTitle = this.routeTitle.getTitle();
		stopLoading(false);
		let params = new URLSearchParams();
		params.set("names", Home.popularBoardNames.join(","));
		this.http.get(`api/boards/bynames`, {search: params})
		.map(res => res.json())
		.subscribe(data => {
			this.popBoards = [];
			//並び替え
			Home.popularBoardNames.forEach((name) => {
				const tmp = _.find(<Board[]>data, (board) => board.name === name);
				if (tmp) this.popBoards.push(tmp);
			});
			stopLoading(true);
		});
	}
}
