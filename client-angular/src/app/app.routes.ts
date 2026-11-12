import { Routes } from '@angular/router';
import { authGuard, loggedInGuard } from './core/auth.guards';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { AccountComponent } from './pages/account/account.component';
import { ByeComponent } from './pages/bye/bye.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: HomeComponent },
    { path: 'register', component: RegisterComponent, canActivate: [loggedInGuard] },
    { path: 'login', component: LoginComponent, canActivate: [loggedInGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'accounts/:id', component: AccountComponent, canActivate: [authGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
    { path: 'bye', component: ByeComponent },
    { path: '**', component: NotFoundComponent },
];
