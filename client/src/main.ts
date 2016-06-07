//angular2に必要
import "core-js/es6";
import 'core-js/es7/reflect';
import "rxjs/add/operator/map";
import "zone.js/dist/zone";

//angular2
import {Component, enableProdMode} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';
import {bootstrap}    from '@angular/platform-browser-dynamic';
import {ROUTER_PROVIDERS, RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

//ページ
import {Header} from "./components/Header";
import {Home} from "./components/Home";

require('bootstrap-loader');
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
	{path: '/:league', name:"Home", component: Home},
])
export class RootComponent {}



/** 描写？ */
bootstrap(RootComponent, [
	ROUTER_PROVIDERS,
	HTTP_PROVIDERS
]);
