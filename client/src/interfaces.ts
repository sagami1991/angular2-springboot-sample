export interface LeagueInfo {
	name: string;
	param: string[];
	title: string;
}

export interface TeamRank {
	type: string;
	updated: Date;
	teams: Tyokin[];
}

export interface Tyokin {
	name: string;
	tyokin: number;
}
