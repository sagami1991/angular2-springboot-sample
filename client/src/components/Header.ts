import {Component, ElementRef} from "@angular/core";
import {Location} from "@angular/common";
import {ROUTER_DIRECTIVES} from "@angular/router-deprecated";

@Component({
	selector: "app-header",
	styles: [require("./header.scss")],
	template: require("./header.html"),
	host: {
		'(document:click)': 'onClick(event)',
	},
	directives: [ROUTER_DIRECTIVES]
})
export class Header {
	/** メニュー開いてたらtrue */
	private isSideMenuActive: boolean;
	
	constructor(private location:Location,
	private eRef: ElementRef) {}
	private ngOnInit() {
		const openMenuElm = (<HTMLElement> this.eRef.nativeElement).querySelector(".toggle-button.side");
		openMenuElm.addEventListener("click", (event) => {
			this.toggleMenu();
			event.stopPropagation();
		});
	}

	/** メニュー開くボタン以外クリックされたらメニュー閉じる */
	private onClick(event : Event) {
			this.isSideMenuActive = false;
	}
	
	/** メニューを出したり隠したり */
	private toggleMenu(): void {
		this.isSideMenuActive = !this.isSideMenuActive;
	}

}
