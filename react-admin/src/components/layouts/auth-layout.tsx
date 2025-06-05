import { Card, Flex, Tag, Typography } from "antd";

const AuthLayout = ({
    children,
    title,
}: {
    children: React.ReactNode;
    title: string;
}) => {
    return (
        <Flex
            style={{
                width: "100vw",
                height: "100vh",
            }}
            justify="center"
            align="center"
        >
            <Card
                style={{
                    width: 400,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                }}
            >
                <Flex
                    vertical
                    align="center"
                    gap="middle"
                    style={{ marginBottom: 30 }}
                >
                    {/* Logo - Thay đường dẫn bằng logo thực tế */}
                    {/* <img
                        src="/logo.png"
                        alt="Logo"
                        style={{
                            width: 80,
                            height: 80,
                            objectFit: "contain",
                        }}
                    /> */}
                    <Typography.Title level={1} style={{ margin: 0 }}>
                        BOILERPLATE
                    </Typography.Title>
                    <Tag
                        style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            padding: "6px 15px",
                        }}
                    >
                        TRANG QUẢN TRỊ
                    </Tag>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        {title}
                    </Typography.Title>
                </Flex>
                {children}
            </Card>
        </Flex>
    );
};

export default AuthLayout;
