import {Component} from "@angular/core";
import {RouteParams} from "@angular/router-deprecated";
import {TeamRank} from "../interfaces";
import {Http} from "@angular/http";
import {NumberPipe, DateFormatPipe} from "../util/Util";


@Component({
	template: require("./yakiu.html"),
	styles: [require("./yakiu.scss")],
	pipes:[NumberPipe, DateFormatPipe]
})
export class YakiuComponent {
	private teamRanks: TeamRank[];
	constructor(private params: RouteParams,
							private http: Http) {};
	private ngOnInit() {
		this.http.get(`api/setting/yakiu`)
		.map(res => res.json())
		.subscribe(data => this.teamRanks = data);
	}
}
