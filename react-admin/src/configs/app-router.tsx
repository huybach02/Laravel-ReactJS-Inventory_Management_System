import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import NguoiDung from "../pages/nguoi-dung/NguoiDung";
import LoginMiddleware from "../middlewares/LoginMiddleware";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import MainLayout from "../components/layouts/main-layout";
import AuthLayout from "../components/layouts/auth-layout";
import ThoiGianLamViec from "../pages/thoi-gian-lam-viec/ThoiGianLamViec";
import CauHinhChung from "../pages/cau-hinh-chung/CauHinhChung";
import VerifyOTP from "../pages/VerifyOTP";
import VaiTro from "../pages/vai-tro/VaiTro";
import Profile from "../pages/Profile";
import LoaiKhachHang from "../pages/loai-khach-hang/LoaiKhachHang";
import LichSuImport from "../pages/lich-su-import/LichSuImport";
import KhachHang from "../pages/khach-hang/KhachHang";
import NhaCungCap from "../pages/nha-cung-cap/NhaCungCap";
import DanhMucSanPham from "../pages/danh-muc-san-pham/DanhMucSanPham";
import DonViTinh from "../pages/don-vi-tinh/DonViTinh";
import SanPham from "../pages/san-pham/SanPham";
import PhieuNhapKho from "../pages/phieu-nhap-kho/PhieuNhapKho";
import QuanLyTonKho from "../pages/quan-ly-ton-kho/QuanLyTonKho";
import PhieuChi from "../pages/phieu-chi/PhieuChi";
import QuanLyBanHang from "../pages/quan-ly-ban-hang/QuanLyBanHang";
import PhieuXuatKho from "../pages/phieu-xuat-kho/PhieuXuatKho";
import PhieuThu from "../pages/phieu-thu/PhieuThu";
import CongThucSanXuat from "../pages/cong-thuc-san-xuat/CongThucSanXuat";
import SanXuat from "../pages/san-xuat/SanXuat";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/admin" />,
    },
    {
        path: "/admin",
        children: [
            {
                index: true,
                element: (
                    <LoginMiddleware>
                        <AuthLayout title="ĐĂNG NHẬP">
                            <LoginPage />
                        </AuthLayout>
                    </LoginMiddleware>
                ),
            },
            {
                path: "forgot-password",
                element: (
                    <AuthLayout title="QUÊN MẬT KHẨU">
                        <ForgotPassword />
                    </AuthLayout>
                ),
            },
            {
                path: "reset-password",
                element: (
                    <AuthLayout title="ĐẶT LẠI MẬT KHẨU">
                        <ResetPassword />
                    </AuthLayout>
                ),
            },
            {
                path: "verify-otp",
                element: (
                    <AuthLayout title="XÁC THỰC OTP">
                        <VerifyOTP />
                    </AuthLayout>
                ),
            },
            {
                path: "profile",
                element: <MainLayout />,
                children: [{ index: true, element: <Profile /> }],
            },
            {
                path: "dashboard",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <DashboardPage />,
                    },
                ],
            },
            {
                path: "lich-su-import",
                element: <MainLayout />,
                children: [{ index: true, element: <LichSuImport /> }],
            },
            {
                path: "quan-ly-nguoi-dung",
                children: [
                    {
                        path: "nguoi-dung",
                        element: <MainLayout />,
                        children: [
                            {
                                index: true,
                                element: <NguoiDung />,
                            },
                        ],
                    },
                    {
                        path: "vai-tro",
                        element: <MainLayout />,
                        children: [{ index: true, element: <VaiTro /> }],
                    },
                ],
            },
            {
                path: "thiet-lap-he-thong",
                children: [
                    {
                        path: "cau-hinh-chung",
                        element: <MainLayout />,
                        children: [
                            {
                                index: true,
                                element: <CauHinhChung />,
                            },
                        ],
                    },
                    {
                        path: "thoi-gian-lam-viec",
                        element: <MainLayout />,
                        children: [
                            { index: true, element: <ThoiGianLamViec /> },
                        ],
                    },
                ],
            },
            {
                path: "quan-ly-khach-hang",
                children: [
                    {
                        path: "loai-khach-hang",
                        element: <MainLayout />,
                        children: [{ index: true, element: <LoaiKhachHang /> }],
                    },
                    {
                        path: "khach-hang",
                        element: <MainLayout />,
                        children: [{ index: true, element: <KhachHang /> }],
                    },
                ],
            },
            {
                path: "quan-ly-san-pham",
                children: [
                    {
                        path: "nha-cung-cap",
                        element: <MainLayout />,
                        children: [{ index: true, element: <NhaCungCap /> }],
                    },
                    {
                        path: "danh-muc-san-pham",
                        element: <MainLayout />,
                        children: [
                            { index: true, element: <DanhMucSanPham /> },
                        ],
                    },
                    {
                        path: "don-vi-tinh",
                        element: <MainLayout />,
                        children: [{ index: true, element: <DonViTinh /> }],
                    },
                    {
                        path: "san-pham",
                        element: <MainLayout />,
                        children: [{ index: true, element: <SanPham /> }],
                    },
                ],
            },
            {
                path: "quan-ly-kho",
                children: [
                    {
                        path: "phieu-nhap-kho",
                        element: <MainLayout />,
                        children: [{ index: true, element: <PhieuNhapKho /> }],
                    },
                    {
                        path: "phieu-xuat-kho",
                        element: <MainLayout />,
                        children: [{ index: true, element: <PhieuXuatKho /> }],
                    },
                    {
                        path: "quan-ly-ton-kho",
                        element: <MainLayout />,
                        children: [{ index: true, element: <QuanLyTonKho /> }],
                    },
                ],
            },
            {
                path: "quan-ly-thu-chi",
                children: [
                    {
                        path: "phieu-chi",
                        element: <MainLayout />,
                        children: [{ index: true, element: <PhieuChi /> }],
                    },
                    {
                        path: "phieu-thu",
                        element: <MainLayout />,
                        children: [{ index: true, element: <PhieuThu /> }],
                    },
                ],
            },
            {
                path: "quan-ly-ban-hang",
                element: <MainLayout />,
                children: [{ index: true, element: <QuanLyBanHang /> }],
            },
            {
                path: "quan-ly-san-xuat",
                children: [
                    {
                        path: "cong-thuc-san-xuat",
                        element: <MainLayout />,
                        children: [
                            { index: true, element: <CongThucSanXuat /> },
                        ],
                    },
                    {
                        path: "san-xuat",
                        element: <MainLayout />,
                        children: [{ index: true, element: <SanXuat /> }],
                    },
                ],
            },
        ],
    },
]);
