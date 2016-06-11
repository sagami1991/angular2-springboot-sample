//angular2に必要
import "core-js/es6";
import 'core-js/es7/reflect';
import "rxjs/add/operator/map";
import "zone.js/dist/zone";

// lodashを_でgrobalに
require('expose?_!lodash/core');
//emoji-one
require('expose?emojione!emojione/lib/js/emojione.min');
require("!style!css!emojione/assets/css/emojione.min.css");
emojione.imageType = 'svg';
emojione.imagePathSVG ="//localhost:3001/node_modules/emojione/assets/svg/";
//jqueryを$とjQueryでgrobal変数に
require("expose?$!expose?jQuery!jquery");
require('bootstrap-loader');

//angular2
import {Component, enableProdMode} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';
import {bootstrap}    from '@angular/platform-browser-dynamic';
import {ROUTER_PROVIDERS, RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

//ページ
import {Header} from "./components/Header";
import {Home} from "./components/Home";
import {BoardComponent} from "./components/BoardComponent";
import {SureComponent} from "./components/SureComponent";


//css scssローダーでcssへ→cssローダー→styleローダーでstyleタグへ
require("!style!css!sass!./main.scss");

if (ENV === "prod") {
	enableProdMode();
}

/** 始まりのクラス？ */
@Component({
	selector: 'my-app',
	template: require("./main.html"),
	directives: [ROUTER_DIRECTIVES, Header],
})
// ルート設定
@RouteConfig([
	{path: '/', name:"Home", component: Home},
	{path: '/sureran/:id', name:"Board", component: BoardComponent},
	{path: '/sure/:id', name:"Sure", component: SureComponent},
])
export class RootComponent {}



/** 描写？ */
bootstrap(RootComponent, [
	ROUTER_PROVIDERS,
	HTTP_PROVIDERS
]);
