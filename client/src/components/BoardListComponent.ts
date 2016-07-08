import {Component} from "@angular/core";
import {Http} from "@angular/http";
import {Board} from "../interfaces";
import {stopLoading, errorHandler} from "../util/Util";

@Component({
	selector: ".main-container",
	template:`
	<div class="header">
		<div class="title">板一覧</div>
	</div>
	<ul>
		<a *ngFor="let board of boardList" class="link-li">
			{{board.name}}
		</a>
	</ul>
	`,
	styles: [require("./boardlist.scss")]
})
export class BoardListComponent {
	private boardList: Board[];
	private genreList: string[];
	constructor(private http: Http) {}
	private ngOnInit() {
		stopLoading(false);
		this.http.get("api/boards")
		.map(res => res.json())
		.finally(() => stopLoading(true))
		.subscribe(
			data => this.initBoard(<Board[]> data),
			e => errorHandler(e)
		);
	}

	private initBoard(data: Board[]) {
		this.boardList = data;
		// this.boardList = _.sortBy(this.boardList, "genre");
		this.genreList = Array.from(this.boardList.map(obj => obj.genre));
		console.log(this.genreList)
	}
}