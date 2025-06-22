import axios from "../configs/axios";
import type {
    ForgotPasswordForm,
    LoginData,
    LoginForm,
    ResetPasswordForm,
    VerifyOTPForm,
    VerifyOTPResponse,
} from "../types/auth.type";
import { handleAxiosError } from "../helpers/axiosHelper";
import type { UserResponse } from "../types/user.type";
import { toast } from "../utils/toast";
import { API_ROUTE_CONFIG } from "../configs/api-route-config";
import type { ApiResponseSuccess } from "../types/index.type";

export const AuthService = {
    login: async (
        payload: LoginForm
    ): Promise<ApiResponseSuccess<LoginData> | undefined> => {
        try {
            const res: ApiResponseSuccess<LoginData> = await axios.post(
                API_ROUTE_CONFIG.LOGIN,
                payload
            );
            if (res.success) {
                toast.success(res.message);
                localStorage.setItem("token", res.data.access_token);
                if (res.data.refresh_token) {
                    localStorage.setItem(
                        "refresh_token",
                        res.data.refresh_token
                    );
                }
                if (res.data.device_id) {
                    localStorage.setItem("device_id", res.data.device_id);
                }
                return res;
            }
        } catch (error) {
            return handleAxiosError(error);
        }
    },
    logout: async (): Promise<ApiResponseSuccess<[]> | undefined> => {
        try {
            const res: ApiResponseSuccess<[]> = await axios.post(
                API_ROUTE_CONFIG.LOGOUT
            );
            if (res.success) {
                toast.success(res.message);
                localStorage.removeItem("token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("device_id");
                return res;
            }
        } catch (error) {
            return handleAxiosError(error);
        }
    },
    fetchUser: async (): Promise<UserResponse | undefined> => {
        try {
            const res = await axios.post(API_ROUTE_CONFIG.ME);
            return res.data;
        } catch (error) {
            return handleAxiosError(error);
        }
    },
    forgotPassword: async (
        payload: ForgotPasswordForm
    ): Promise<ApiResponseSuccess<[]> | undefined> => {
        try {
            const res: ApiResponseSuccess<[]> = await axios.post(
                API_ROUTE_CONFIG.FORGOT_PASSWORD,
                payload
            );
            if (res.success) {
                toast.success(res.message);
                return res;
            }
        } catch (error) {
            return handleAxiosError(error);
        }
    },
    resetPassword: async (
        payload: ResetPasswordForm
    ): Promise<ApiResponseSuccess<[]> | undefined> => {
        try {
            const res: ApiResponseSuccess<[]> = await axios.post(
                API_ROUTE_CONFIG.RESET_PASSWORD,
                payload
            );
            if (res.success) {
                toast.success(res.message);
                return res;
            }
        } catch (error) {
            return handleAxiosError(error);
        }
    },
    verifyOTP: async (
        payload: VerifyOTPForm
    ): Promise<VerifyOTPResponse | undefined> => {
        try {
            const res: VerifyOTPResponse = await axios.post(
                API_ROUTE_CONFIG.VERIFY_OTP,
                payload
            );
            if (res.success) {
                toast.success(res.message);
                if (res?.data?.access_token) {
                    localStorage.setItem("token", res.data.access_token);
                }
                if (res?.data?.refresh_token) {
                    localStorage.setItem(
                        "refresh_token",
                        res?.data?.refresh_token
                    );
                }
                if (res?.data?.device_id) {
                    localStorage.setItem("device_id", res?.data?.device_id);
                }
                return res;
            }
        } catch (error) {
            return handleAxiosError(error);
        }
    },
};
