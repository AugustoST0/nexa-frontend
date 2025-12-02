import { User } from "../model/User.model";

export interface UserUpdateResponseDTO {
    user: User;
    accessToken: string;
    refreshToken: string;
}