import type { ApiResponseError } from "./index.type";
import type { User } from "./user.type";

export interface LoginForm {
    email: string;
    password: string;
    remember_me: boolean;
}

export interface LoginData {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    user: User;
    is_2fa?: boolean;
    user_id?: string;
    device_id?: string;
}

export interface ForgotPasswordForm {
    email: string;
}

export interface VerifyOTPForm {
    user_id: string;
    otp: string;
}

export interface ResetPasswordForm {
    password: string;
    password_confirmation: string;
    token: string;
}

export type LoginResponseError = ApiResponseError & {
    errors?: {
        is_lockout?: boolean;
        time_lockout?: number;
    };
};

export type VerifyOTPResponse = ApiResponseError & {
    data?: {
        access_token: string;
        refresh_token?: string;
        device_id?: string;
        user_id?: string;
        is_2fa?: boolean;
        user?: User;
    };
    errors?: {
        is_navigate_to_login?: boolean;
    };
};
