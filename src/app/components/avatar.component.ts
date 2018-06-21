import {
    Component,
    Input,
    OnChanges,
    OnInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-avatar',
    template: '<img [src]="sanitizer.bypassSecurityTrustResourceUrl(src)" title="{{data}}">',
})
export class AvatarComponent implements OnChanges, OnInit {
    @Input() data: string;
    @Input() width = 45;
    @Input() height = 45;
    @Input() charCount = 2;
    @Input() textColor = '#ffffff';
    @Input() fontSize = 20;
    @Input() fontWeight = 300;
    @Input() dynamic = false;

    src: string;

    constructor(public sanitizer: DomSanitizer) { }

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

    private generate() {
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
        const svg = this.getSvg(this.width, this.height, color);
        svg.appendChild(charObj);
        const html = window.document.createElement('div').appendChild(svg).outerHTML;
        const svgHtml = window.btoa(unescape(encodeURIComponent(html)));
        this.src = 'data:image/svg+xml;base64,' + svgHtml;
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
            const value = (hash >> (i * 8)) & 0xFF;
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

    private getSvg(width: number, height: number, color: string): HTMLElement {
        const svgTag = window.document.createElement('svg');
        svgTag.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgTag.setAttribute('pointer-events', 'none');
        svgTag.setAttribute('width', width.toString());
        svgTag.setAttribute('height', height.toString());
        svgTag.style.backgroundColor = color;
        svgTag.style.width = width + 'px';
        svgTag.style.height = height + 'px';
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
        textTag.setAttribute('font-family', '"Open Sans","Helvetica Neue",Helvetica,Arial,' +
            'sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"');
        textTag.textContent = character;
        textTag.style.fontWeight = this.fontWeight.toString();
        textTag.style.fontSize = this.fontSize + 'px';
        return textTag;
    }
}
