import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-dialog',
    template: `@if (isOpen()) {
        <div class="dialog" role="dialog">
            <button class="close-button" (click)="closed.emit()">x</button>
            <ng-content />
        </div>
    }`,
    styles: `
        .dialog { width: 500px; max-width: 100%; margin: 0 auto; position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
            z-index: 999; background-color: white; padding: 10px 20px 40px; border-radius: 8px; display: flex; flex-direction: column;
            box-shadow: 3px 7px 18px 0px rgba(148, 148, 148, 1); box-sizing: border-box; }
        .close-button { background-color: #222B2D; color: #FFFEF9; font-size: 16px; outline: none; margin-bottom: 15px; padding: 3px 8px;
            cursor: pointer; border-radius: 50%; border: none; width: 30px; height: 30px; font-weight: bold; align-self: flex-end; }
        .close-button:hover { background-color: #090c0c; }
    `,
})
export class DialogComponent {
    readonly isOpen = input<boolean>(false);
    readonly closed = output<void>();
}
