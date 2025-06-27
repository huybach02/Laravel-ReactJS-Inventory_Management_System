import { Avatar, type MenuProps } from "antd";
import { Space } from "antd";
import { Button, Dropdown } from "antd";
import { Header } from "antd/es/layout/layout";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { useResponsive } from "../../hooks/useReponsive";
import { Flex, theme } from "antd";
import {
    DownOutlined,
    BellOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
} from "@ant-design/icons";

const HeaderMain = ({
    collapsed,
    setCollapsed,
    sidebarWidth,
    itemsNotification,
    items,
}: {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    sidebarWidth: number;
    itemsNotification: MenuProps["items"];
    items: MenuProps["items"];
}) => {
    const { user } = useSelector((state: RootState) => state.auth);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const { mobileOnly, isDesktop } = useResponsive();

    return (
        <Header
            style={{
                padding: "0 24px",
                background: colorBgContainer,
                boxShadow: "0 1px 4px rgba(0,21,41,.08)",
                position: "fixed",
                top: 0,
                right: 0,
                width: mobileOnly
                    ? "100%"
                    : collapsed
                    ? "100%"
                    : `calc(100% - ${sidebarWidth}px)`,
                zIndex: 999,
                transition: "width 0.2s",
                height: "64px",
            }}
        >
            <Flex
                justify={isDesktop ? "space-between" : "flex-end"}
                align="center"
                style={{ height: "100%" }}
                gap={20}
            >
                {isDesktop && (
                    <Button
                        type="default"
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )
                        }
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: "16px",
                            width: 64,
                            height: 64,
                            border: "none",
                        }}
                    />
                )}
                <Flex align="center" gap={20}>
                    <Dropdown
                        menu={{ items: itemsNotification }}
                        placement="bottom"
                        trigger={["click"]}
                        overlayStyle={{
                            maxHeight: 400,
                            maxWidth: 280,
                            overflow: "auto",
                            boxShadow: "0 2px 8px rgba(0,20,41,.25)",
                        }}
                    >
                        <Button
                            type="default"
                            shape="circle"
                            icon={<BellOutlined />}
                            size="large"
                        />
                    </Dropdown>
                    <Dropdown
                        menu={{ items }}
                        placement="bottom"
                        trigger={["click"]}
                    >
                        <Space style={{ cursor: "pointer" }}>
                            <Avatar
                                size="large"
                                src={user?.images[0]?.path}
                                shape="circle"
                            />
                            <span style={{ fontWeight: 500 }}>
                                {user?.name}
                            </span>
                            <DownOutlined style={{ fontSize: "12px" }} />
                        </Space>
                    </Dropdown>
                </Flex>
            </Flex>
        </Header>
    );
};

export default HeaderMain;
