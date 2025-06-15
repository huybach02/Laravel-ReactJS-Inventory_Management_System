import { Col, Flex, Row, Tabs } from "antd";
import Heading from "../../components/heading";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { useResponsive } from "../../hooks/useReponsive";
import usePermission from "../../hooks/usePermission";
import DanhSachQuanLyTonKhoTong from "./DanhSachQuanLyTonKhoTong";

const path = API_ROUTE_CONFIG.QUAN_LY_TON_KHO;
const title = "Quản lý tồn kho";

const QuanLyTonKho = () => {
    const { isMobile } = useResponsive();

    const permission = usePermission(path);

    const items = [
        {
            key: "tong",
            label: "Kho tổng",
            children: (
                <DanhSachQuanLyTonKhoTong
                    path={path}
                    permission={permission}
                    title={title}
                />
            ),
        },
    ];

    return (
        <>
            <div>
                <Flex
                    vertical={isMobile}
                    justify={isMobile ? "center" : "space-between"}
                    align={isMobile ? "" : "center"}
                    style={{ marginBottom: isMobile ? 20 : 0 }}
                >
                    <Heading title={title} />
                    <Col
                        span={isMobile ? 24 : 12}
                        style={{
                            display: "flex",
                            justifyContent: isMobile ? "" : "flex-end",
                            alignItems: "center",
                            gap: 10,
                        }}
                    />
                </Flex>
                <Row>
                    <Col span={24}>
                        {permission.index && <Tabs type="card" items={items} />}
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default QuanLyTonKho;
