import {Component} from "@angular/core";
import {RouteParams} from "@angular/router-deprecated";
import {LeagueInfo, TeamRank, Tyokin} from "../interfaces";
import {Http, Headers} from "@angular/http";
import {NumberPipe, DateFormatPipe} from "../util/Util";

export class LeagueConfig {
	public static leagueConfig: LeagueInfo[] = [
		{
			name: "ce",
			param: ["", "ce"],
			title: "セリーグ"
		}, {
			name: "pa",
			param: ["pa"],
			title: "パリーグ"
		}
	];
	
	public static getLeagueObj(str: string) {
		return this.leagueConfig.find((league => league.param.indexOf(str) !== -1 ));
	}
}

@Component({
	template:`
	<h2>
		{{leagueInfo.title}}ランキング
	</h2>
	<div *ngIf="teamRank">
		<div *ngFor="let team of teamRank.teams; let i = index" class="rank-row">
			<div class="juni">{{i + 1}}位</div>
			<div class="syakkin-row">
				<div class="icon-m kuroboshi" *ngFor="let hoge of team.tyokin * -1 | number"></div>
			</div>
			<div class="team-icon-wraper">
				<div class="icon-m team-{{team.name.toLowerCase()}}"></div>
			</div>
			<div class="tyokin-row">
				<div class="icon-m siroboshi" *ngFor="let hoge of team.tyokin | number"></div>
			</div>
		</div>
		更新日時 {{teamRank.updated | dateToString }}
	</div>
	`,
	styles: [require("./home.scss")],
	pipes:[NumberPipe, DateFormatPipe]
})
export class Home {
	private leagueInfo: LeagueInfo;
	private teamRank: TeamRank;
	constructor(private params: RouteParams,
							private http: Http) {};
	private ngOnInit() {
		this.leagueInfo = LeagueConfig.getLeagueObj(this.params.get("league"));
		this.http.get(`api/rank/${this.leagueInfo.name}`)
		.map(res => res.json())
		.subscribe(data => this.teamRank = data);
	}
}
