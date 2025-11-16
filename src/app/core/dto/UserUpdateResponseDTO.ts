import { User } from "../model/User";

export interface UserUpdateResponseDTO {
    user: User;
    accessToken: string;
    refreshToken: string;
}