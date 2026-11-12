import { Component } from '@angular/core';

@Component({
    selector: 'app-loading',
    template: `<div class="root"><img class="image" src="loading.svg" alt="Loading..." /></div>`,
    styles: `.root { display: flex; justify-content: center; } .image { height: 124px; }`,
})
export class LoadingComponent {}
