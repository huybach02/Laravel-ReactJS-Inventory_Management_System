import { Col, Flex, Row } from "antd";
import Heading from "../../components/heading";
import DanhSachNguoiDung from "./DanhSachNguoiDung";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import ThemNguoiDung from "./ThemNguoiDung";
import { useResponsive } from "../../hooks/useReponsive";
import usePermission from "../../hooks/usePermission";

const path = API_ROUTE_CONFIG.NGUOI_DUNG;

const NguoiDung = () => {
    const { isMobile } = useResponsive();

    const permission = usePermission(path);

    return (
        <div>
            <Flex
                vertical={isMobile}
                justify={isMobile ? "center" : "space-between"}
                align={isMobile ? "" : "center"}
                style={{ marginBottom: isMobile ? 20 : 0 }}
            >
                <Heading title="Người dùng" />
                <Col
                    span={isMobile ? 24 : 12}
                    style={{
                        display: "flex",
                        justifyContent: isMobile ? "" : "flex-end",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    {/* {permission.export && (
                          <ExportTable
                              columns={columns}
                              path={path}
                              params={query}
                          />
                      )} */}
                    {permission.create && <ThemNguoiDung path={path} />}
                </Col>
            </Flex>
            <Row>
                <Col span={24}>
                    {permission.index && (
                        <DanhSachNguoiDung
                            path={path}
                            permission={permission}
                        />
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default NguoiDung;
