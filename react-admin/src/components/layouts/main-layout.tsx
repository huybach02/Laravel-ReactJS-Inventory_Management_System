import { Outlet } from "react-router-dom";
import AuthMiddleware from "../../middlewares/AuthMiddleware";
import { Layout, theme, type MenuProps, Row, Col } from "antd";

import { useState } from "react";
import { useResponsive } from "../../hooks/useReponsive";
import {
    UserOutlined,
    LogoutOutlined,
    MessageOutlined,
} from "@ant-design/icons";
import { setAuthLogout } from "../../redux/slices/auth.slice";
import { AuthService } from "../../services/AuthService";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import SiderMain from "./sider-main";
import HeaderMain from "./header-main";
import PermissionMiddleware from "../../middlewares/PermissionMiddleware";
import { URL_CONSTANTS } from "../../configs/api-route-config";

const { Content } = Layout;

const MainLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [collapsed, setCollapsed] = useState(false);
    const { mobileOnly } = useResponsive();
    const sidebarWidth = 260;

    const handleLogout = async () => {
        await AuthService.logout();
        dispatch(setAuthLogout());
        navigate(URL_CONSTANTS.LOGIN);
    };

    const items: MenuProps["items"] = [
        {
            key: "1",
            label: "Thông tin tài khoản",
            icon: <UserOutlined />,
            onClick: () => navigate(URL_CONSTANTS.PROFILE),
        },
        {
            type: "divider",
        },

        {
            key: "2",
            label: "Đăng xuất",
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    const itemsNotification: MenuProps["items"] = [
        {
            key: "1",
            icon: <MessageOutlined />,
            label: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        },
        {
            key: "2",
            icon: <MessageOutlined />,
            label: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        },
        {
            type: "divider",
        },
        {
            key: "3",
            label: "Tất cả thông báo",
        },
    ];

    return (
        <AuthMiddleware>
            <PermissionMiddleware>
                <Layout style={{ minHeight: "100vh" }}>
                    <SiderMain
                        sidebarWidth={sidebarWidth}
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                    />
                    <Layout
                        style={{
                            marginLeft: mobileOnly
                                ? 0
                                : collapsed
                                ? 0
                                : sidebarWidth,
                            transition: "margin-left 0.2s",
                            minHeight: "100vh",
                            background: "#f0f2f5",
                        }}
                    >
                        <HeaderMain
                            collapsed={collapsed}
                            setCollapsed={setCollapsed}
                            sidebarWidth={sidebarWidth}
                            itemsNotification={itemsNotification}
                            items={items}
                        />
                        <Content
                            style={{
                                marginTop: "80px",
                                padding: "0px 14px",
                                overflow: "initial",
                            }}
                        >
                            <div
                                style={{
                                    padding: "24px",
                                    background: colorBgContainer,
                                    borderRadius: borderRadiusLG,
                                    minHeight: "calc(100vh - 136px)",
                                    boxShadow: "0 1px 4px rgba(0,21,41,.08)",
                                    overflow: "hidden",
                                    position: "relative",
                                }}
                            >
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={24} md={24} lg={24}>
                                        <Outlet />
                                    </Col>
                                </Row>
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </PermissionMiddleware>
        </AuthMiddleware>
    );
};

export default MainLayout;
