import { environment } from '../../../environments/environment';

const BASE_URL = environment.baseApiUrl;

export const API_ROUTES = {
    USERS: `${BASE_URL}/users`,
    AUTH: `${BASE_URL}/auth`,
    GRUPOS: `${BASE_URL}/grupos`,
    TAGS: `${BASE_URL}/tags`,
    COLABORADORES: `${BASE_URL}/colaboradores`,
    RELATORIOS: `${BASE_URL}/relatorios`,
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
} as const;

export const COLABORADOR_ENDPOINTS = {
    GET_ALL: API_ROUTES.COLABORADORES,
    GET_BY_ID: (id: number) => `${API_ROUTES.COLABORADORES}/${id}`,
    GET_SUPERVISORES: `${API_ROUTES.COLABORADORES}/supervisores`,
    GET_BY_TAG: (idTag: number) => `${API_ROUTES.COLABORADORES}/tag/${idTag}`,
    SEARCH_BY_NAME: (nome: string) => `${API_ROUTES.COLABORADORES}/search?nome=${nome}`,
    SEARCH_COMMON: `${API_ROUTES.COLABORADORES}/search/common`,
    SEARCH_ADVANCED: `${API_ROUTES.COLABORADORES}/search/advanced`,
    CREATE: API_ROUTES.COLABORADORES,
    UPDATE: (id: number) => `${API_ROUTES.COLABORADORES}/${id}`,
    DELETE: (id: number) => `${API_ROUTES.COLABORADORES}/${id}`,
} as const;

export const RELATORIO_ENDPOINTS = {
    GET_ALL: API_ROUTES.RELATORIOS,
    GERAR: (grupoId: number) => `${API_ROUTES.RELATORIOS}/gerar/${grupoId}`,
    DOWNLOAD_CSV: (id: number) => `${API_ROUTES.RELATORIOS}/${id}/csv`,
    DOWNLOAD_PDF: (id: number) => `${API_ROUTES.RELATORIOS}/${id}/pdf`,
} as const;