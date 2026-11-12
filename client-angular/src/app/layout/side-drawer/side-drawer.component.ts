import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';

@Component({
    selector: 'app-side-drawer',
    imports: [AsyncPipe, RouterLink],
    template: `<nav class="side-drawer" [class.open]="show()">
        <ul>
            @if (session.isAuthenticated$ | async) {
                <li><a routerLink="/dashboard">Dashboard</a></li>
                <li><a routerLink="/settings">Settings</a></li>
                <li><a href="#" (click)="$event.preventDefault(); session.logout()">Logout</a></li>
            } @else {
                <li><a routerLink="/login">Login</a></li>
                <li><a routerLink="/register">Sign Up</a></li>
            }
        </ul>
    </nav>`,
    styles: `
        .side-drawer { height: 100%; background: #FFFEF9; box-shadow: 1px 0 7px rgba(0, 0, 0, 0.5); position: fixed; top: 0; left: 0;
            width: 70%; max-width: 280px; z-index: 200; transform: translateX(-100%); transition: transform 0.3s ease-out; }
        .side-drawer ul { height: 100%; list-style: none; display: flex; flex-direction: column; justify-content: center; }
        .side-drawer li { margin: 0.5rem 0; }
        .side-drawer a { color: #222B2D; text-decoration: none; font-size: 1.2rem; }
        .side-drawer a:hover, .side-drawer a:active { color: #F15742; }
        .open { transform: translateX(0); }
        @media (min-width: 769px) { .side-drawer { display: none; } }
    `,
})
export class SideDrawerComponent {
    readonly session = inject(SessionService);
    readonly show = input<boolean>(false);
}
