import {Component, ElementRef, Output, Input, EventEmitter} from "@angular/core";
import {Location} from "@angular/common";
import {ROUTER_DIRECTIVES} from "@angular/router";

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
	@Input() isOpenedWorkSpace: boolean;
	@Output() openWorkSpace = new EventEmitter();
	/** メニュー開いてたらtrue */
	private isSideMenuActive: boolean;
	private elem: HTMLElement;

	constructor(private location:Location,
	private eRef: ElementRef) {
		this.elem = <HTMLElement> this.eRef.nativeElement;
	}
	private ngOnInit() {
		const openMenuElm = this.elem.querySelector(".toggle-button.side");
		openMenuElm.addEventListener("click", (event) => {
			this.toggleMenu();
			event.stopPropagation();
		});
	}

	/** メニュー開くボタン以外クリックされたらメニュー閉じる */
	private onClick(event: Event) {
		this.isSideMenuActive = false;
	}
	
	/** メニューを出したり隠したり */
	private toggleMenu(): void {
		this.isSideMenuActive = !this.isSideMenuActive;
	}
}
