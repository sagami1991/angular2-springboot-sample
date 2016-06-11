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


export interface Board {
	genre: string;
	name: string;
	domain: string;
	server: string;
	board: string;
}

export interface Sure {
	id: string;
	/** 板ID */
	bid: string;
	datNo: string;
	suretai: string;
	length: number;
	otiteru:boolean;
}
