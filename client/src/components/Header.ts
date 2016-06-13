import {Component, ElementRef} from "@angular/core";
import {ROUTER_DIRECTIVES, Router} from "@angular/router-deprecated";
import {Location} from '@angular/common';

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
	
	constructor(private router:Router,
							private eRef: ElementRef,
							private location:Location) {}
	
	/** メニュー開くボタン以外クリックされたらメニュー閉じる */
	private onClick(event : Event) {
		const openMenuElm = (<HTMLElement> this.eRef.nativeElement).querySelector(".toggle-button.side");
		if (event.target !== openMenuElm) {
			this.isSideMenuActive = false;
		}
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
