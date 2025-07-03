import { Col, Flex, Row } from "antd";
import Heading from "../../components/heading";
import DanhSachSanXuat from "./DanhSachSanXuat";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import ThemSanXuat from "./ThemSanXuat";
import { useResponsive } from "../../hooks/useReponsive";
import usePermission from "../../hooks/usePermission";

const path = API_ROUTE_CONFIG.SAN_XUAT;
const title = "Sản xuất";

const SanXuat = () => {
    const { isMobile } = useResponsive();

    const permission = usePermission(path);

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
                    >
                        {/* {permission.export && (
                          <ExportTable
                              columns={columns}
                              path={path}
                              params={query}
                          />
                      )} */}
                        {permission.create && (
                            <ThemSanXuat path={path} title={title} />
                        )}
                    </Col>
                </Flex>
                <Row>
                    <Col span={24}>
                        {permission.index && (
                            <DanhSachSanXuat
                                path={path}
                                permission={permission}
                                title={title}
                            />
                        )}
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default SanXuat;
