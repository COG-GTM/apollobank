import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { getAccessToken, setAccessToken } from './access-token';

export const fetchRefreshToken = async (): Promise<string> => {
    const res = await fetch(`${environment.serverUrl}/refresh_token`, {
        method: 'POST',
        credentials: 'include',
    });
    const { accessToken } = await res.json();
    setAccessToken(accessToken);
    return accessToken;
};

export const isTokenValidOrUndefined = (): boolean => {
    const token = getAccessToken();
    if (!token) {
        return true;
    }
    try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        return Date.now() < exp * 1000;
    } catch {
        return false;
    }
};
