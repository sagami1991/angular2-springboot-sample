import {SafeHtml} from '@angular/platform-browser';

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
	//ここから後付
	date: Date;
	ikioi: number;
	ikioiColor: string;
}

export interface Res {
	name: string;
	mail: string;
	postDate: string;
	id: string;
	honbun: string;
	//ここから後付
	trustHonbun: SafeHtml;
	/** フィルターされても残るようにindex */
	index: number;
	/** アンカーされてる先 */
	fromAnkers: number[];
	/** サムネイル */
	thumbs: Thumb[];
	/** IDの色 */
	idColor: string;
	/** (4/5)のようなIDの数 */
	idCount: string;
	/** レス番の色 */
	noColor: string;
	/** (2)のようなアンカーされている数 */
	ankerCount: string;

}

export interface Dat {
	/** スレッドID */
	id: string;
	byteLength: number;
	lastModified: string;
	title: string;
	trustTitle: string; // 絵文字化後 todo safehtml型に
	/** デフォルトの名前 */
	name: string;
	/** 最後の更新日 */
	lastUpdate: Date;
	otiteru: boolean;
	resList: Res[];
	tokkaList: Tokka[];
}

export interface Thumb {
	type: string;
	isOpen: boolean;
	info: Tokka | ThumbImg;
}

export interface ThumbImg {
	imgUrl: string;
}
export interface Tokka {
	id: string;
	title?: string;
	price?: number;
	siteName?: string;
	imgUrl?: string;
}


/** デバッグ情報 */
export interface DebugInfo {
	totalMem: number;
	useMem: number;
	perMem: number;
	totalSpace: number;
	freeSpace: number;
	osName: string;
}
