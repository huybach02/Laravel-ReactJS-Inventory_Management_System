/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { Navigate, useLocation } from "react-router-dom";
import { KEY_URL_VALID } from "../utils/constant";
import { toast } from "../utils/toast";
import { URL_CONSTANTS } from "../configs/api-route-config";

const PermissionMiddleware = ({ children }: { children: React.ReactNode }) => {
    const { pathname } = useLocation();

    const { user } = useSelector((state: RootState) => state.auth);

    const checkPermission = () => {
        for (const key of KEY_URL_VALID) {
            if (pathname.includes(key)) {
                return <>{children}</>;
            }
        }

        if (user?.vai_tro?.trang_thai != 1) {
            toast.error("Không xác định được vai trò");
            return <Navigate to={URL_CONSTANTS.DASHBOARD} />;
        }

        const phanQuyen = JSON.parse(user?.vai_tro?.phan_quyen || "[]");
        const pathNameArr = pathname.split("/");
        const lastPathName = pathNameArr.pop() || "";

        const checkPermission = phanQuyen.find((item: any) => {
            if (pathNameArr.length > 0 && lastPathName.includes(item.name)) {
                return item;
            }

            return false;
        });

        if (checkPermission?.actions?.index) {
            return <>{children}</>;
        } else {
            toast.error("Bạn không có quyền truy cập vào trang này");
            return <Navigate to={URL_CONSTANTS.DASHBOARD} />;
        }
    };

    return <>{checkPermission()}</>;
};

export default PermissionMiddleware;
