import { Component, input } from '@angular/core';

export type AlertSeverity = 'success' | 'warning' | 'error';

/** Replaces MUI `<Alert variant="outlined">` (SuccessMessage / WarningMessage / ErrorMessage). */
@Component({
    selector: 'app-alert-message',
    template: `<div class="alert" [class]="'alert ' + severity()" role="alert">
        <span class="icon">{{ icons[severity()] }}</span>
        <span>{{ message() }}</span>
    </div>`,
    styles: `
        .alert { display: flex; align-items: center; gap: 12px; padding: 6px 16px; border-radius: 4px; border: 1px solid; font-size: 14px; line-height: 1.43; }
        .icon { font-weight: bold; }
        .success { color: rgb(30, 70, 32); border-color: #4caf50; } .success .icon { color: #4caf50; }
        .warning { color: rgb(102, 60, 0); border-color: #ff9800; } .warning .icon { color: #ff9800; }
        .error { color: rgb(97, 26, 21); border-color: #f44336; } .error .icon { color: #f44336; }
    `,
})
export class AlertMessageComponent {
    readonly message = input.required<string>();
    readonly severity = input<AlertSeverity>('success');
    readonly icons: Record<AlertSeverity, string> = { success: '✓', warning: '!', error: '✕' };
}
