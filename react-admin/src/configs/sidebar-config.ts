import type { NavigateFunction } from "react-router-dom";
import React from "react";
import { URL_CONSTANTS } from "./api-route-config";
import {
    Clock,
    Cog,
    LayoutDashboard,
    Settings,
    ShieldUser,
    User,
    UsersRound,
    FileUp,
} from "lucide-react";

const iconStyle = {
    fontSize: "18px",
};

export const sidebarConfig = (navigate: NavigateFunction) => {
    return [
        {
            key: "dashboard",
            label: "Thống kê",
            icon: React.createElement(LayoutDashboard, { style: iconStyle }),
            onClick: () => navigate(URL_CONSTANTS.DASHBOARD),
        },
        {
            key: "quan-ly-nguoi-dung",
            label: "Quản lý người dùng",
            icon: React.createElement(UsersRound, { style: iconStyle }),
            children: [
                {
                    key: "nguoi-dung",
                    label: "Danh sách người dùng",
                    icon: React.createElement(User, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.NGUOI_DUNG),
                },
                {
                    key: "vai-tro",
                    label: "Danh sách vai trò",
                    icon: React.createElement(ShieldUser, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.VAI_TRO),
                },
            ],
        },
        {
            key: "thiet-lap-he-thong",
            label: "Thiết lập hệ thống",
            icon: React.createElement(Settings, { style: iconStyle }),
            children: [
                {
                    key: "cau-hinh-chung",
                    label: "Cấu hình chung",
                    icon: React.createElement(Cog, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.CAU_HINH_CHUNG),
                },
                {
                    key: "thoi-gian-lam-viec",
                    label: "Thời gian làm việc",
                    icon: React.createElement(Clock, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.THOI_GIAN_LAM_VIEC),
                },
            ],
        },
        {
            key: "lich-su-import",
            label: "Lịch sử import",
            icon: React.createElement(FileUp, { style: iconStyle }),
            onClick: () => navigate(URL_CONSTANTS.LICH_SU_IMPORT),
        },
        {
            key: "quan-ly-khach-hang",
            label: "Quản lý khách hàng",
            icon: React.createElement(UsersRound, {
                style: iconStyle,
            }),
            children: [
                {
                    key: "loai-khach-hang",
                    label: "Loại khách hàng",
                    icon: React.createElement(User, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.LOAI_KHACH_HANG),
                },
            ],
        },
    ];
};
