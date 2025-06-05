import dayjs from "dayjs";
import type { IImage } from "./main.type";

export type UserResponse = {
    user: User;
};

export interface VaiTro {
    id?: number;
    ma_vai_tro: string;
    ten_vai_tro: string;
    phan_quyen: string;
    trang_thai: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    province_id: string;
    district_id: string;
    ward_id: string;
    address: string;
    birthday: string;
    images: IImage[];
    description: string;
    email_verified_at: string;
    is_ngoai_gio: number;
    status: number;
    vai_tro: VaiTro;
    created_at: string;
    updated_at: string;
}

export interface INguoiDungFormValues {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
    birthday: dayjs.Dayjs;
    gender: number;
    province_id: number;
    district_id: number;
    ward_id: number;
    address: string;
    status: number;
}
