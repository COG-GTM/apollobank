import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent, ApolloTestingModule],
            providers: [provideRouter([])],
        }).compileComponents();
    });

    it('should render the toolbar with unauthenticated actions', () => {
        // Arrange
        const fixture = TestBed.createComponent(AppComponent);

        // Act
        fixture.detectChanges();

        // Assert
        const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
        expect(text).toContain('Login');
        expect(text).toContain('Sign Up');
    });
});
