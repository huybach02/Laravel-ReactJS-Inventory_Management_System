import type { NavigateFunction } from "react-router-dom";
import {
    AppstoreOutlined,
    ClockCircleOutlined,
    DashboardOutlined,
    SettingOutlined,
    UsergroupAddOutlined,
    UserOutlined,
} from "@ant-design/icons";
import React from "react";
import { URL_CONSTANTS } from "./api-route-config";

const iconStyle = {
    fontSize: "18px",
};

export const sidebarConfig = (navigate: NavigateFunction) => {
    return [
        {
            key: "dashboard",
            label: "Thống kê",
            icon: React.createElement(DashboardOutlined, { style: iconStyle }),
            onClick: () => navigate(URL_CONSTANTS.DASHBOARD),
        },
        {
            key: "quan-ly-nguoi-dung",
            label: "Quản lý người dùng",
            icon: React.createElement(UserOutlined, { style: iconStyle }),
            children: [
                {
                    key: "nguoi-dung",
                    label: "Danh sách người dùng",
                    icon: React.createElement(UsergroupAddOutlined, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.NGUOI_DUNG),
                },
                {
                    key: "vai-tro",
                    label: "Danh sách vai trò",
                    icon: React.createElement(UsergroupAddOutlined, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.VAI_TRO),
                },
            ],
        },
        {
            key: "thiet-lap-he-thong",
            label: "Thiết lập hệ thống",
            icon: React.createElement(SettingOutlined, { style: iconStyle }),
            children: [
                {
                    key: "cau-hinh-chung",
                    label: "Cấu hình chung",
                    icon: React.createElement(AppstoreOutlined, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.CAU_HINH_CHUNG),
                },
                {
                    key: "thoi-gian-lam-viec",
                    label: "Thời gian làm việc",
                    icon: React.createElement(ClockCircleOutlined, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.THOI_GIAN_LAM_VIEC),
                },
            ],
        },
    ];
};
