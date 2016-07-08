//型定義ファイルの書き方よくわからない

//webpack側で置換される文字
declare var ENV: string;
declare var PABLICPATH: string;
declare var VERSION :string;

declare module emojione {
	var imageType: string;
	var imagePathSVG: string;
	function unicodeToImage(unicode: string): string;
}
declare module humane{
	function remove();
	function spawn({addnCls: string, timeout: number}) :(msg: string)=> void;
}

//googleアナリティクス
declare var ga: any;