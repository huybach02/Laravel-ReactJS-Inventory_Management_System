import axios from "../configs/axios";
import { handleAxiosError } from "../helpers/axiosHelper";
import type { ApiResponseSuccess } from "../types/index.type";
import { toast } from "../utils/toast";

export const deleteData = async (path: string, id: number) => {
    try {
        const res: ApiResponseSuccess<[]> = await axios.delete(`${path}/${id}`);
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
    } catch (error) {
        handleAxiosError(error);
    }
};
