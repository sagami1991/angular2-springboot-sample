//angular2に必要
import 'core-js/es6/symbol';
import 'core-js/es6/object';
import 'core-js/es6/function';
import 'core-js/es6/parse-int';
import 'core-js/es6/parse-float';
import 'core-js/es6/number';
import 'core-js/es6/math';
import 'core-js/es6/string';
import 'core-js/es6/date';
import 'core-js/es6/array';
import 'core-js/es6/regexp';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/weak-map';
import 'core-js/es6/weak-set';
import 'core-js/es6/typed';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import "rxjs/add/operator/map";
import "rxjs/add/operator/finally";
import "zone.js/dist/zone";

// lodashを_でgrobalに
require('expose?_!lodash/core');
require("expose?humane!humane-js");
require("!style!css!humane-js/themes/libnotify.css");
//絵文字用ライブラリ　ただ画像タグ化するだけの割にサイズ巨大、小さくするの検討
require('expose?emojione!emojione/lib/js/emojione');
require("!style!css!emojione/assets/css/emojione.css");
emojione.imageType = 'svg';
emojione.imagePathSVG = PABLICPATH + "emojione/assets/svg/";
//jqueryとbootstrap削除する方針
//jqueryを$とjQueryでgrobal変数に
// require("expose?$!expose?jQuery!jquery");
// bootstrap
// require('bootstrap-loader');


// css scssローダーでcssへ→cssローダー→styleローダーでstyleタグへ
require("!style!css!sass!./main.scss");

//angular2
import {Component, enableProdMode} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';
import {Title} from '@angular/platform-browser';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {provideRouter, RouterConfig, ROUTER_DIRECTIVES} from "@angular/router";

//ページ
import {Header} from "./components/Header";
import {Home} from "./components/Home";
import {BoardListComponent} from "./components/BoardListComponent";
import {BoardComponent} from "./components/BoardComponent";
import {SureComponent} from "./components/SureComponent";
import {DebugComponent} from "./components/DebugComponent";
import {YakiuComponent} from "./components/YakiuComponent";
import {WorkSpaceComponent} from "./components/WorkSpaceComponent";
import {WorkSpaceService} from "./util/Util";

if (ENV === "prod") {
	enableProdMode();
} else {
	require('zone.js/dist/long-stack-trace-zone');
}

/** 始まりのクラス */
@Component({
	selector: 'my-app',
	template: `
		<app-header
			(openWorkSpace)="onOpenWorkSpace()"
			[isOpenedWorkSpace]="isOpenedWorkSpace"
		>
		</app-header>
		<div class="container" [class.exist-workspace]="isOpenedWorkSpace">
			<div class="workspace" *ngIf="isOpenedWorkSpace">
				ここがワークスペース
			</div>
			<router-outlet id="router">
			</router-outlet>
		</div>
	`,
	directives: [ROUTER_DIRECTIVES, Header, WorkSpaceComponent],
	precompile:[Home, BoardComponent, SureComponent, YakiuComponent,
				DebugComponent, BoardListComponent],
	providers: [WorkSpaceService]
})
export class RootComponent {
	private isOpenedWorkSpace: boolean;
	private ngOnInit() {
		document.querySelector(".loading").removeAttribute("class");
		this.onOpenWorkSpace();
	}
	private onOpenWorkSpace() {
		this.isOpenedWorkSpace = !this.isOpenedWorkSpace;
	}
}
// ルート設定
const routes: RouterConfig = [
	{path: '',  component: Home},
	{path: 'sureran/:id', component: BoardComponent},
	{path: 'sure/:id', component: SureComponent},
	{path: 'yakiu', component: YakiuComponent},
	{path: 'debug', component: DebugComponent},
	{path: 'boardlist', component: BoardListComponent},
];



/** 描写？ */
bootstrap(RootComponent, [
	provideRouter(routes),
	HTTP_PROVIDERS,
	Title
]);

//GoogleAnaliticsエラーハンドラ

