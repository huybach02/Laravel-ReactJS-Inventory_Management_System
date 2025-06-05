import { Flex, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Loading = () => {
    return (
        <Flex
            style={{
                width: "100vw",
                height: "100vh",
            }}
            justify="center"
            align="center"
            gap="middle"
            vertical
        >
            <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
            <Typography.Title level={5}>Đang tải dữ liệu...</Typography.Title>
        </Flex>
    );
};

export default Loading;
