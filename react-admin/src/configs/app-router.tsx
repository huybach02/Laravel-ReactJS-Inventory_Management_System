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
                ],
            },
        ],
    },
]);
