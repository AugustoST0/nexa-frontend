export interface JwtPayload {
    sub: string; // email
    userId: number; // id
    userName: string; // nome
    groups: string[]; // roles ("USER" ou "ADMIN")
    exp: number; // timestamp de expiração
    iat: number; // timestamp de emissão
}