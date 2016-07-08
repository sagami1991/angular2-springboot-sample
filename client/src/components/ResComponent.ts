import {Component, Input, Output, EventEmitter} from "@angular/core";
import {Res, Tokka} from "../interfaces";
import {Http} from "@angular/http";
import {errorHandler, NumberFormatPipe, createParam} from "../util/Util";
import {HumanId} from "./SureComponent";

@Component({
	selector: ".res-wrapper",
	template:`
		<div class="res-header">
			<a class="res-no {{res.noColor}}"
			(click)="showResByIndexes(res.index)">
				{{res.index + 1}}{{res.ankerCount}}
			</a>
			<span class="res-name">名前: {{res.name}}</span>
			<span class="res-postdate">{{res.postDate}}</span>
			<a *ngIf="res.id" class="res-id {{res.idColor}}"
			(click)="showResById(res.id)">
				ID:{{res.id}} {{res.idCount}}
			</a>
		</div>
		<div class="res-body"
			[innerHTML]="res.trustHonbun"
			(click)="showAnkerTo($event, res.index, res)">
		</div>
		<div class="thumbs-wrapper" *ngIf="res.thumbs">
			<a *ngFor="let thumb of res.thumbs; let j=index" 
			class="thumb-box" 
			[class.opened]="thumb.isOpen"
			(click)="fetchTokka(res, j, $event)">
				<img src="{{ thumb.isOpen? thumb.info.imgUrl : null}}" />
				<ul class="thumb-tooltip" *ngIf="thumb.isOpen && thumb.type === 'tokka'">
					<li class="thumb-title">{{thumb.info.title}}</li>
					<li class="thumb-price">￥ {{thumb.info.price | numberFormat:'0,0'}}</li>
				</ul>
			</a>
		</div>
		`,
	styles: [require("./sure.scss")],
	directives: [ResComponent],
	pipes: [NumberFormatPipe]
})
export class ResComponent {
	@Input() res: Res;
	@Input() humanIds: HumanId;
	@Output() popup = new EventEmitter();

	constructor(private http: Http) {
	};

	/** レス番クリックすると再帰的に表示 */
	private showResByIndexes(index: number) {
		this.popup.emit({idxArr:[index], isSaiki: true});
	}
	
	/** IDクリックすると */
	private showResById(id: string) {
		this.popup.emit({idxArr:this.humanIds[id].resIdxes});
	}

	/** アンカークリックすると表示 */
	private showAnkerTo(event:MouseEvent, nowIdx:number, res) {
		const elem = <HTMLElement> event.target;
		const ankerToStr = elem.getAttribute("data-to");
		const ankerToNum = Number(ankerToStr);
		//未来にあんかーされている場合飛ばす
		if (!ankerToStr || ankerToNum > nowIdx) return;
		this.popup.emit({idxArr:[ankerToNum]});
	}

	/** 通販情報を取得 */
	private fetchTokka(res: Res, j:number, event: MouseEvent) {
		let thumb = res.thumbs[j];
		if (thumb.isOpen) {
			if (thumb.type === "img") window.open(thumb.info.imgUrl);
			return;
		}
			thumb.isOpen = true;
			event.preventDefault();
		if (thumb.type === "img") {
		} else if (thumb.type === "tokka") {
			let tokka: Tokka = <Tokka> thumb.info;
			this.http.get(`api/dat/tokka`, createParam({"id": tokka.id, "site": tokka.siteName}))
			.map(res => res.json())
			.subscribe(data => {
				if (!data.imgUrl) {
					data.imgUrl = PABLICPATH + "init/tokka-404.gif";
				}
				thumb.info = data;
			},
				e => errorHandler(e)
			);			
		}
	}
}


export interface PopupEvent {
	idxArr: number[];
	isSaiki?: boolean;
}