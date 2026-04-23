import { getAccessToken, setAccessToken } from './accessToken';

describe('accessToken', () => {
    beforeEach(() => {
        setAccessToken('');
    });

    it('getAccessToken returns empty string initially', () => {
        expect(getAccessToken()).toBe('');
    });

    it('setAccessToken sets the token and getAccessToken returns it', () => {
        setAccessToken('my-token-123');
        expect(getAccessToken()).toBe('my-token-123');
    });

    it('setting token to empty string clears it', () => {
        setAccessToken('some-token');
        expect(getAccessToken()).toBe('some-token');
        setAccessToken('');
        expect(getAccessToken()).toBe('');
    });
});
