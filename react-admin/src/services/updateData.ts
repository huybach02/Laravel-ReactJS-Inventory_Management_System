/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "../configs/axios";
import { handleAxiosError } from "../helpers/axiosHelper";
import type { ApiResponseSuccess } from "../types/index.type";
import { toast } from "../utils/toast";

export const patchData = async (
    path: string,
    id: number,
    data: any,
    closeModal: () => void
) => {
    try {
        const resp: ApiResponseSuccess<any> = await axios.patch(
            `${path}/${id}`,
            data
        );
        if (resp.success) {
            toast.success(resp.message);
            closeModal();
            return resp.data;
        } else {
            toast.error(resp.message);
        }
    } catch (error: any) {
        handleAxiosError(error);
    }
};

export const putData = async (
    path: string,
    id: number,
    data: any,
    closeModal: () => void
) => {
    try {
        const resp: ApiResponseSuccess<any> = await axios.put(
            `${path}/${id}`,
            data
        );
        if (resp.success) {
            toast.success(resp.message);
            closeModal();
            return resp.data;
        } else {
            toast.error(resp.message);
        }
    } catch (error: any) {
        handleAxiosError(error);
    }
};
