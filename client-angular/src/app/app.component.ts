import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackdropComponent } from './layout/backdrop/backdrop.component';
import { SideDrawerComponent } from './layout/side-drawer/side-drawer.component';
import { ToolbarComponent } from './layout/toolbar/toolbar.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ToolbarComponent, SideDrawerComponent, BackdropComponent],
    template: `<div style="height: 100%">
        <app-toolbar (drawerToggle)="sideDrawerOpen.set(!sideDrawerOpen())" />
        <app-side-drawer [show]="sideDrawerOpen()" />
        @if (sideDrawerOpen()) {
            <app-backdrop (clicked)="sideDrawerOpen.set(false)" />
        }
        <router-outlet />
    </div>`,
})
export class AppComponent {
    readonly sideDrawerOpen = signal(false);
}
