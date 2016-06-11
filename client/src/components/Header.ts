import {Component, ElementRef} from "@angular/core";
import {ROUTER_DIRECTIVES, Router} from "@angular/router-deprecated";
import {Location} from '@angular/common';
import {LeagueInfo} from "../interfaces";

@Component({
	selector: "app-header",
	styles: [require("./header.scss")],
	template: require("./header.html"),
	host: {
		'(document:click)': 'onClick($event)',
	},
	directives: [ROUTER_DIRECTIVES]
})
export class Header {
	private isSideMenuActive: boolean;
	/** メニュー開いてたらtrue */
	private isMenuActive: boolean;
	/** 現在開いているリーグ */
	private leagueInfo: LeagueInfo;
	
	constructor(private router:Router,
							private eRef: ElementRef,
							private location:Location) {}
	
	private ngOnInit(): void {
	}
	/** メニュー開くボタン以外クリックされたらメニュー閉じる */
	private onClick(event : Event) {
		const openMenuElm = (<HTMLElement> this.eRef.nativeElement).getElementsByClassName("select-leagu")[0];
		if (event.target !== openMenuElm) {
			this.hideMenu();
		}
	}
	
	/** URLを元にリーグ情報更新 */
	private updateLeagueInfo() {
	}
	/** コンテキストパスを取る */
	private getCtxPath(): string {
		const path = this.location.path();
		return path === "" ? "" : path.split("/")[1]; 
	}
	/** タブメニューのページ開いていたらtrue返す */
	private isActive(path:string): boolean {
		return path === this.leagueInfo.name;
	}
	/** メニューを出したり隠したり */
	private toggleMenu(flag: boolean): void {
		this.isMenuActive = !this.isMenuActive;
	}
	/** メニューを隠す */
	private hideMenu(): void {
		this.isMenuActive = false;
	}
}
