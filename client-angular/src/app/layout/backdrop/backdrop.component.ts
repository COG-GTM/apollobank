import { Component, output } from '@angular/core';

@Component({
    selector: 'app-backdrop',
    template: `<div class="backdrop" (click)="clicked.emit()"></div>`,
    styles: `.backdrop { position: fixed; width: 100%; height: 100%; top: 0; left: 0; background: rgba(0, 0, 0, 0.3); z-index: 100; }`,
})
export class BackdropComponent {
    readonly clicked = output<void>();
}
