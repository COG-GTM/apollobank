import { getAccessToken, setAccessToken, accessToken } from './accessToken';

describe('accessToken', () => {
    afterEach(() => {
        setAccessToken('');
    });

    it('should have an empty string as default access token', () => {
        expect(getAccessToken()).toBe('');
    });

    it('should set and get the access token', () => {
        setAccessToken('test-token-123');
        expect(getAccessToken()).toBe('test-token-123');
    });

    it('should overwrite the access token when set again', () => {
        setAccessToken('first-token');
        setAccessToken('second-token');
        expect(getAccessToken()).toBe('second-token');
    });

    it('should allow clearing the access token', () => {
        setAccessToken('some-token');
        setAccessToken('');
        expect(getAccessToken()).toBe('');
    });
});
