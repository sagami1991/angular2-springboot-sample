import {Component} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {LeagueInfo, TeamRank, Tyokin, Board} from "../interfaces";
import {Http, Headers, URLSearchParams} from "@angular/http";
import {EmojiPipe} from "../util/Util";


@Component({
	template:`
	<h2>
		人気の板
	</h2>
	<ul *ngIf="popBoards">
		<li *ngFor="let board of popBoards">
			<a [routerLink]="['/Board', {id: board.id}]">{{board.name}}</a>
		</li>
	</ul>
	<div [innerHTML]="emoji | toEmoji">
	</div>

	`,
	styles: [require("./home.scss")],
	directives: [ROUTER_DIRECTIVES],
	pipes: [EmojiPipe]
})
export class Home {
	private static popularBoardNames = ["なんでも実況J", "ニュー速(嫌儲)", "ニュー速VIP", "ニュース速報+", "スマホアプリ",
	"野球ch", "難民", "芸スポ速報+"];
	private popBoards: Board[];
	private emoji = "&#127918;";
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
				const tmp = (<Board[]> data).filter((board) => board.name === name)[0];
				if (tmp) {
					this.popBoards.push(tmp);
				}
			});


			});
	}
}
