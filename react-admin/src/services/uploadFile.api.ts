/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponseSuccess } from "../types/index.type";
import axios from "../configs/axios";
import { toast } from "../utils/toast";
import { handleAxiosError } from "../helpers/axiosHelper";
import { API_ROUTE_CONFIG } from "../configs/api-route-config";

export const uploadSingle = async (data: any) => {
    try {
        const res: ApiResponseSuccess<any> = await axios.post(
            API_ROUTE_CONFIG.UPLOAD_SINGLE,
            data
        );
        if (res.success) {
            toast.success(res.message);
            return res.data;
        } else {
            toast.error(res.message);
        }
    } catch (error: any) {
        handleAxiosError(error);
    }
};

export const uploadMultiple = async (data: any) => {
    try {
        const res: ApiResponseSuccess<any> = await axios.post(
            API_ROUTE_CONFIG.UPLOAD_MULTIPLE,
            data
        );
        if (res.success) {
            toast.success(res.message);
            return res.data;
        } else {
            toast.error(res.message);
        }
    } catch (error: any) {
        handleAxiosError(error);
    }
};
