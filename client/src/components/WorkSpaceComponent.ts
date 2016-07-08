import {Component, ElementRef, HostListener, Injectable} from "@angular/core";
import {ROUTER_DIRECTIVES, Router} from "@angular/router";
import {WorkSpaceService, Safe, WorkSure} from "../util/Util";

@Component({
	selector:".workspace",
	template:`
	<div class="work-title">最近開いたスレ</div>
	<ul class="work-wrapper">
		<li  *ngFor="let sure of sureList; let i=index"
			class="li-item tooltip"
			[class.active]="sure.isActive"
			[attr.data-tooltip]= "sure.title"
		>
			<i (click)="delete(i)" class="material-icons md-12">clear</i>
			<a class="li-item-link"
				[routerLink]="[sure.url]"
				[innerHtml]="sure.trustTitle | safe"
			>
			</a>	
		</li>
	</ul>
	`,
	styles: [require("./workspace.scss")],
	pipes: [Safe],
	directives: [ROUTER_DIRECTIVES]
})
export class WorkSpaceComponent {
	private sureList: WorkSure[] = this.service.sureList;

	constructor(private service: WorkSpaceService) {}

	private delete(i: number) {
		this.service.delete(i);
	}

}

