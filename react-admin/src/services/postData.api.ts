/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ApiResponseSuccess } from "../types/index.type";
import axios from "../configs/axios";
import { toast } from "../utils/toast";
import { handleAxiosError } from "../helpers/axiosHelper";

export const postData = async (
    path: string,
    data: any,
    closeModal: () => void
) => {
    try {
        const res: ApiResponseSuccess<any> = await axios.post(path, data);
        if (res.success) {
            toast.success(res.message);
            closeModal();
            return res.data;
        } else {
            toast.error(res.message);
        }
    } catch (error: any) {
        handleAxiosError(error);
    }
};
