
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
//emoji-one
require('expose?emojione!emojione/lib/js/emojione');
require("!style!css!emojione/assets/css/emojione.css");
emojione.imageType = 'svg';
emojione.imagePathSVG = PABLICPATH + "emojione/assets/svg/";
//jqueryを$とjQueryでgrobal変数に
// require("expose?$!expose?jQuery!jquery");
// bootstrap
// require('bootstrap-loader');
require('!style!css!toastr/build/toastr.css');
// css scssローダーでcssへ→cssローダー→styleローダーでstyleタグへ
require("!style!css!sass!./main.scss");

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
import {DebugComponent} from "./components/DebugComponent";
import {YakiuComponent} from "./components/YakiuComponent";

if (ENV === "prod") {
	enableProdMode();
} else {
//	require('zone.js/dist/long-stack-trace-zone');
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
	{path: '/yakiu', name:"Yakiu", component: YakiuComponent},
	{path: '/debug', name:"Debug", component: DebugComponent},
])
export class RootComponent {
	private ngOnInit() {
		document.querySelector(".loading").removeAttribute("class");
	}

}

/** 描写？ */
bootstrap(RootComponent, [
	ROUTER_PROVIDERS,
	HTTP_PROVIDERS
]);
