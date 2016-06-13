

export interface TeamRank {
	league: string;
	updated: Date;
	ranking: Tyokin[];
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
	defaultName: string;
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

export interface Res {
	name: string;
	mail: string;
	postDate: string;
	id: string;
	honbun: string;
}

export interface Dat {
	/** スレッドID */
	id: string;
	byteLength: number;
	lastModified: string;
	title: string;
	/** デフォルトの名前 */
	name: string;
	/** 最後の更新日 */
	lastUpdate: Date;
	otiteru: boolean;
	resList: Res[];
}


/** デバッグ情報 */
export interface DebugInfo {
	totalMem: number;
	useMem: number;
	perMem: number;
	totalSpace: number;
	freeSpace: number;
}
