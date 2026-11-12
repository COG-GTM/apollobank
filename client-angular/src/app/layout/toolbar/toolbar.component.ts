import { AsyncPipe } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { DrawerToggleButtonComponent } from '../drawer-toggle-button/drawer-toggle-button.component';

@Component({
    selector: 'app-toolbar',
    imports: [AsyncPipe, RouterLink, DrawerToggleButtonComponent],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    readonly session = inject(SessionService);
    readonly drawerToggle = output<void>();
}
