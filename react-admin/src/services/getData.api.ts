/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponseSuccess } from "../types/index.type";
import axios from "../configs/axios";
import { handleAxiosError } from "../helpers/axiosHelper";
import { toast } from "../utils/toast";
import { API_ROUTE_CONFIG } from "../configs/api-route-config";

export const getDataById = async (id: number | undefined, path: string) => {
    try {
        if (id === undefined) {
            return;
        }
        const resp: ApiResponseSuccess<any> = await axios.get(`${path}/${id}`);
        if (resp.success) {
            return resp.data;
        }
    } catch (error: any) {
        handleAxiosError(error);
    }
};

export const getDataSelect = async (path: string, params = {}) => {
    try {
        const respSelect: ApiResponseSuccess<any> = await axios.get(path, {
            params,
        });
        if (respSelect.success) {
            return respSelect.data;
        } else {
            toast.error(respSelect.message);
        }
    } catch (error: any) {
        handleAxiosError(error);
    }
};

export const getListData = async (path: string, params = {}) => {
    try {
        const resp: ApiResponseSuccess<any> = await axios.get(path, { params });
        if (resp.success) {
            if (resp.data?.collection) {
                return { data: resp.data.collection, total: resp.data.total };
            } else {
                return resp.data;
            }
        } else {
            toast.error(resp.message);
        }
    } catch (error: any) {
        handleAxiosError(error);
    }
};

export const getListPhanQuyenMacDinh = async () => {
    try {
        const resp: ApiResponseSuccess<any> = await axios.get(
            API_ROUTE_CONFIG.DANH_SACH_PHAN_QUYEN
        );
        if (resp.success) {
            return resp.data;
        }
    } catch (error: any) {
        handleAxiosError(error);
    }
};
