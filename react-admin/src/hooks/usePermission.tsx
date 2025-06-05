/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { Actions } from "../types/main.type";

const usePermission = (path: string) => {
    const { user } = useSelector((state: RootState) => state.auth);

    if (!user?.vai_tro?.phan_quyen || user?.vai_tro?.trang_thai != 1) {
        return {
            index: false,
            create: false,
            show: false,
            edit: false,
            delete: false,
            export: false,
            showMenu: false,
        };
    }

    const phanQuyen = JSON.parse(user?.vai_tro?.phan_quyen || "[]");
    const pathNameArr = path.split("/");
    const lastPathName = pathNameArr.pop() || "";

    const checkPermission: Actions = phanQuyen.find((item: any) => {
        if (pathNameArr.length > 0 && lastPathName.includes(item.name)) {
            return item;
        }
    }).actions;
    return checkPermission;
};

export default usePermission;
