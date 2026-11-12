import { Component, input } from '@angular/core';

@Component({
    selector: 'app-title',
    template: `<h2 class="title" [style.font-size.px]="fontSize()"><ng-content /></h2>`,
    styles: `.title { color: #222B2D; font-weight: bold; margin: 0; }`,
})
export class TitleComponent {
    readonly fontSize = input<number>(24);
}
