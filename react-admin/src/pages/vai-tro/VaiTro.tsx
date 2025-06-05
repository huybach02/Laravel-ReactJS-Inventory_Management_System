import { Col, Flex, Row } from "antd";
import Heading from "../../components/heading";
import DanhSachVaiTro from "./DanhSachVaiTro";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import ThemVaiTro from "./ThemVaiTro";
import { useResponsive } from "../../hooks/useReponsive";
import usePermission from "../../hooks/usePermission";

const path = API_ROUTE_CONFIG.VAI_TRO;

const VaiTro = () => {
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
                <Heading title="Vai trò" />
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
                    {permission.create && <ThemVaiTro path={path} />}
                </Col>
            </Flex>
            <Row>
                <Col span={24}>
                    {permission.index && (
                        <DanhSachVaiTro path={path} permission={permission} />
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default VaiTro;
