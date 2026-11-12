import { Component, output } from '@angular/core';

@Component({
    selector: 'app-drawer-toggle-button',
    template: `<button class="toggle-button" aria-label="Toggle navigation" (click)="toggle.emit()">
        <div class="line"></div><div class="line"></div><div class="line"></div>
    </button>`,
    styles: `
        .toggle-button { display: flex; flex-direction: column; justify-content: space-around; height: 24px; width: 28px;
            background: transparent; cursor: pointer; padding: 0; border: none; box-sizing: border-box; }
        .toggle-button:focus { outline: none; }
        .line { width: 30px; height: 2px; background: white; }
    `,
})
export class DrawerToggleButtonComponent {
    readonly toggle = output<void>();
}
