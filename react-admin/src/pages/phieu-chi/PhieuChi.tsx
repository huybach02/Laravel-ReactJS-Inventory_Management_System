import { Col, Flex, Row } from "antd";
import Heading from "../../components/heading";
import DanhSachPhieuChi from "./DanhSachPhieuChi";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import ThemPhieuChi from "./ThemPhieuChi";
import { useResponsive } from "../../hooks/useReponsive";
import usePermission from "../../hooks/usePermission";

const path = API_ROUTE_CONFIG.PHIEU_CHI;
const title = "Phiếu chi";

const PhieuChi = () => {
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
                            <ThemPhieuChi path={path} title={title} />
                        )}
                    </Col>
                </Flex>
                <Row>
                    <Col span={24}>
                        {permission.index && (
                            <DanhSachPhieuChi
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

export default PhieuChi;
