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
    Menu,
    Warehouse,
    Boxes,
    Layers2,
    Container,
    SquareMenu,
    NotepadText,
    Package2,
    Wallet,
    PanelBottomOpen,
    HandCoins,
    PanelTopOpen,
    Factory,
    Waypoints,
    PackagePlus,
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
                {
                    key: "khach-hang",
                    label: "Danh sách khách hàng",
                    icon: React.createElement(User, { style: iconStyle }),
                    onClick: () => navigate(URL_CONSTANTS.KHACH_HANG),
                },
            ],
        },
        {
            key: "quan-ly-san-pham",
            label: "Quản lý sản phẩm",
            icon: React.createElement(Boxes, {
                style: iconStyle,
            }),
            children: [
                {
                    key: "nha-cung-cap",
                    label: "Nhà cung cấp",
                    icon: React.createElement(Warehouse, { style: iconStyle }),
                    onClick: () => navigate(URL_CONSTANTS.NHA_CUNG_CAP),
                },
                {
                    key: "danh-muc-san-pham",
                    label: "Danh mục sản phẩm",
                    icon: React.createElement(Layers2, { style: iconStyle }),
                    onClick: () => navigate(URL_CONSTANTS.DANH_MUC_SAN_PHAM),
                },
                {
                    key: "don-vi-tinh",
                    label: "Đơn vị tính",
                    icon: React.createElement(Container, { style: iconStyle }),
                    onClick: () => navigate(URL_CONSTANTS.DON_VI_TINH),
                },
                {
                    key: "san-pham",
                    label: "Sản phẩm/Nguyên liệu",
                    icon: React.createElement(SquareMenu, { style: iconStyle }),
                    onClick: () => navigate(URL_CONSTANTS.SAN_PHAM),
                },
            ],
        },

        {
            key: "quan-ly-kho",
            label: "Quản lý kho",
            icon: React.createElement(Warehouse, { style: iconStyle }),
            children: [
                {
                    key: "phieu-nhap-kho",
                    label: "Phiếu nhập kho",
                    icon: React.createElement(NotepadText, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.PHIEU_NHAP_KHO),
                },
                {
                    key: "phieu-xuat-kho",
                    label: "Phiếu xuất kho",
                    icon: React.createElement(NotepadText, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.PHIEU_XUAT_KHO),
                },
                {
                    key: "quan-ly-ton-kho",
                    label: "Quản lý tồn kho",
                    icon: React.createElement(Package2, { style: iconStyle }),
                    onClick: () => navigate(URL_CONSTANTS.QUAN_LY_TON_KHO),
                },
            ],
        },
        {
            key: "quan-ly-thu-chi",
            label: "Quản lý thu chi",
            icon: React.createElement(Wallet, { style: iconStyle }),
            children: [
                {
                    key: "phieu-thu",
                    label: "Phiếu thu",
                    icon: React.createElement(PanelTopOpen, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.PHIEU_THU),
                },
                {
                    key: "phieu-chi",
                    label: "Phiếu chi",
                    icon: React.createElement(PanelBottomOpen, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.PHIEU_CHI),
                },
            ],
        },
        {
            key: "quan-ly-ban-hang",
            label: "Quản lý bán hàng",
            icon: React.createElement(HandCoins, { style: iconStyle }),
            onClick: () => navigate(URL_CONSTANTS.QUAN_LY_BAN_HANG),
        },
        {
            key: "quan-ly-san-xuat",
            label: "Quản lý sản xuất",
            icon: React.createElement(Factory, { style: iconStyle }),
            children: [
                {
                    key: "cong-thuc-san-xuat",
                    label: "Công thức sản xuất",
                    icon: React.createElement(Waypoints, { style: iconStyle }),
                    onClick: () => navigate(URL_CONSTANTS.CONG_THUC_SAN_XUAT),
                },
                {
                    key: "san-xuat",
                    label: "Sản xuất",
                    icon: React.createElement(PackagePlus, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.SAN_XUAT),
                },
            ],
        },
    ];
};
