import { environment } from '../../../environments/environment';

const BASE_URL = environment.baseApiUrl;

export const API_ROUTES = {
    USERS: `${BASE_URL}/users`,
    AUTH: `${BASE_URL}/auth`,
} as const;

export const USER_ENDPOINTS = {
    GET_ALL: API_ROUTES.USERS,
    GET_BY_ID: (id: number) => `${API_ROUTES.USERS}/${id}`,
    REGISTER: `${API_ROUTES.USERS}/register`,
    UPDATE: (id: number) => `${API_ROUTES.USERS}/${id}`,
    DELETE: (id: number) => `${API_ROUTES.USERS}/${id}`,
} as const;

export const AUTH_ENDPOINTS = {
    LOGIN: `${API_ROUTES.AUTH}/login`,
    REFRESH: `${API_ROUTES.AUTH}/refresh`,
} as const;