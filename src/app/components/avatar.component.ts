import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { StateService } from 'jslib/abstractions/state.service';

import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-avatar',
    template:
        '<img [src]="sanitizer.bypassSecurityTrustResourceUrl(src)" title="{{data}}" ' +
        '[ngClass]="{\'rounded-circle\': circle}">',
})
export class AvatarComponent implements OnChanges, OnInit {
    @Input() data: string;
    @Input() email: string;
    @Input() size = 45;
    @Input() charCount = 2;
    @Input() textColor = '#ffffff';
    @Input() fontSize = 20;
    @Input() fontWeight = 300;
    @Input() dynamic = false;
    @Input() circle = false;

    src: string;

    constructor(
        public sanitizer: DomSanitizer,
        private cryptoFunctionService: CryptoFunctionService,
        private stateService: StateService
    ) {}

    ngOnInit() {
        if (!this.dynamic) {
            this.generate();
        }
    }

    ngOnChanges() {
        if (this.dynamic) {
            this.generate();
        }
    }

    private async generate() {
        const enableGravatars = await this.stateService.get<boolean>('enableGravatars');
        if (enableGravatars && this.email != null) {
            const hashBytes = await this.cryptoFunctionService.hash(
                this.email.toLowerCase().trim(),
                'md5'
            );
            const hash = Utils.fromBufferToHex(hashBytes).toLowerCase();
            this.src =
                'https://www.gravatar.com/avatar/' + hash + '?s=' + this.size + '&r=pg&d=retro';
        } else {
            let chars: string = null;
            const upperData = this.data.toUpperCase();

            if (this.charCount > 1) {
                chars = this.getFirstLetters(upperData, this.charCount);
            }
            if (chars == null) {
                chars = upperData.substr(0, this.charCount);
            }

            const charObj = this.getCharText(chars);
            const color = this.stringToColor(upperData);
            const svg = this.getSvg(this.size, color);
            svg.appendChild(charObj);
            const html = window.document.createElement('div').appendChild(svg).outerHTML;
            const svgHtml = window.btoa(unescape(encodeURIComponent(html)));
            this.src = 'data:image/svg+xml;base64,' + svgHtml;
        }
    }

    private stringToColor(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            // tslint:disable-next-line
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            // tslint:disable-next-line
            const value = (hash >> (i * 8)) & 0xff;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }

    private getFirstLetters(data: string, count: number): string {
        const parts = data.split(' ');
        if (parts.length > 1) {
            let text = '';
            for (let i = 0; i < count; i++) {
                text += parts[i].substr(0, 1);
            }
            return text;
        }
        return null;
    }

    private getSvg(size: number, color: string): HTMLElement {
        const svgTag = window.document.createElement('svg');
        svgTag.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgTag.setAttribute('pointer-events', 'none');
        svgTag.setAttribute('width', size.toString());
        svgTag.setAttribute('height', size.toString());
        svgTag.style.backgroundColor = color;
        svgTag.style.width = size + 'px';
        svgTag.style.height = size + 'px';
        return svgTag;
    }

    private getCharText(character: string): HTMLElement {
        const textTag = window.document.createElement('text');
        textTag.setAttribute('text-anchor', 'middle');
        textTag.setAttribute('y', '50%');
        textTag.setAttribute('x', '50%');
        textTag.setAttribute('dy', '0.35em');
        textTag.setAttribute('pointer-events', 'auto');
        textTag.setAttribute('fill', this.textColor);
        textTag.setAttribute(
            'font-family',
            '"Open Sans","Helvetica Neue",Helvetica,Arial,' +
                'sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
        );
        textTag.textContent = character;
        textTag.style.fontWeight = this.fontWeight.toString();
        textTag.style.fontSize = this.fontSize + 'px';
        return textTag;
    }
}
