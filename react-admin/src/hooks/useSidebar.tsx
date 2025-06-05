/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { sidebarConfig } from "../configs/sidebar-config";

const useSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [openKeys, setOpenKeys] = useState<string[]>([
        location.pathname.replace("/admin/", "").split("/")[0],
    ]);

    const items = sidebarConfig(navigate);

    // Xác định menu item nào đang active dựa trên đường dẫn hiện tại
    const getSelectedKey = () => {
        const path = location.pathname;
        const currentPath = path.replace("/admin/", ""); //thiet-lap-he-thong/cau-hinh-chung

        // Tạo một mảng mới bằng cách map qua mảng gốc
        return items.map((item) => {
            // Nếu item không có children, trả về nguyên item
            if (!item.children) {
                return {
                    ...item,
                    className:
                        currentPath === item.key
                            ? "ant-menu-item-selected"
                            : "",
                };
            }

            // Nếu có children, tạo bản sao của item với children được cập nhật
            return {
                ...item,
                children: item.children.map((child) => {
                    const pathChild = `${item.key}/${child.key}`;
                    if (currentPath === pathChild) {
                        // Trả về child với className được thêm vào
                        return {
                            ...child,
                            className: "ant-menu-item-selected",
                        };
                    }
                    // Nếu không match, trả về nguyên child
                    return child;
                }),
            };
        });
    };

    const updatedItems = getSelectedKey();

    return {
        items: updatedItems,
        openKeys: openKeys,
    };
};

export default useSidebar;
