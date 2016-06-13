import {Component} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Board} from "../interfaces";
import {Http, URLSearchParams} from "@angular/http";

@Component({
	template:`
	<div class="header">
		<div class="title">人気の板</div>
	</div>
	<ul *ngIf="popBoards">
		<li *ngFor="let board of popBoards">
			<a [routerLink]="['/Board', {id: board.id}]">{{board.name}}</a>
		</li>
	</ul>
	`,
	styles: [require("./home.scss")],
	directives: [ROUTER_DIRECTIVES],
})
export class Home {
	private static popularBoardNames = ["なんでも実況J", "ニュー速(嫌儲)", "ニュー速VIP", "ニュース速報+", "スマホアプリ",
	"野球ch", "難民", "芸スポ速報+", "自作PC"];
	private popBoards: Board[];
	constructor(private params: RouteParams,
							private http: Http) {};
	private ngOnInit() {
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
		});
	}
}
