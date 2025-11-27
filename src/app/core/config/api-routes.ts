import { environment } from '../../../environments/environment';

const BASE_URL = environment.baseApiUrl;

export const API_ROUTES = {
    USERS: `${BASE_URL}/users`,
    AUTH: `${BASE_URL}/auth`,
    GRUPOS: `${BASE_URL}/grupos`,
    TAGS: `${BASE_URL}/tags`,
    COLABORADORES: `${BASE_URL}/colaboradores`,
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

export const GRUPO_ENDPOINTS = {
    GET_ALL: API_ROUTES.GRUPOS,
    GET_BY_ID: (id: number) => `${API_ROUTES.GRUPOS}/${id}`,
    CREATE: API_ROUTES.GRUPOS,
    UPDATE: (id: number) => `${API_ROUTES.GRUPOS}/${id}`,
    DELETE: (id: number) => `${API_ROUTES.GRUPOS}/${id}`,
} as const;

export const TAG_ENDPOINTS = {
    GET_ALL: API_ROUTES.TAGS,
    GET_BY_ID: (id: number) => `${API_ROUTES.TAGS}/${id}`,
    CREATE: API_ROUTES.TAGS,
    UPDATE: (id: number) => `${API_ROUTES.TAGS}/${id}`,
    DELETE: (id: number) => `${API_ROUTES.TAGS}/${id}`,
    GET_BY_GRUPO: (grupoId: number) => `${API_ROUTES.TAGS}/grupo/${grupoId}`,
    GET_NOT_IN_GRUPO: (grupoId: number) => `${API_ROUTES.TAGS}/not-in-grupo/${grupoId}`,
    LINK_TO_GRUPO: (tagId: number, grupoId: number) => `${API_ROUTES.TAGS}/${tagId}/grupo/${grupoId}`,
    UNLINK_FROM_GRUPO: (tagId: number, grupoId: number) => `${API_ROUTES.TAGS}/${tagId}/grupo/${grupoId}`,
} as const;

export const COLABORADOR_ENDPOINTS = {
    GET_ALL: API_ROUTES.COLABORADORES,
    GET_BY_ID: (id: number) => `${API_ROUTES.COLABORADORES}/${id}`,
    GET_SUPERVISORES: `${API_ROUTES.COLABORADORES}/supervisores`,
    GET_BY_TAG: (idTag: number) => `${API_ROUTES.COLABORADORES}/tag/${idTag}`,
    SEARCH_BY_NAME: (nome: string) => `${API_ROUTES.COLABORADORES}/search?nome=${nome}`,
    CREATE: API_ROUTES.COLABORADORES,
    UPDATE: (id: number) => `${API_ROUTES.COLABORADORES}/${id}`,
    DELETE: (id: number) => `${API_ROUTES.COLABORADORES}/${id}`,
} as const;