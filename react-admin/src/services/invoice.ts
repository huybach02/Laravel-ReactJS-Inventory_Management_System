/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleAxiosError } from "../helpers/axiosHelper";

export const xemTruocHoaDon = (id: number) => {
    try {
        // Mở tab mới để xem trước
        const url = `${
            import.meta.env.VITE_API_URL
        }quan-ly-ban-hang/xem-truoc-hoa-don/${id}`;
        window.open(url, "_blank");
    } catch (error: any) {
        handleAxiosError(error);
    }
};
