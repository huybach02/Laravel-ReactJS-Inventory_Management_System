/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Col, Row, Table, Typography, type FormInstance } from "antd";
import SelectFormApi from "../../../components/select/SelectFormApi";
import { API_ROUTE_CONFIG } from "../../../configs/api-route-config";
import { formatter } from "../../../utils/utils";
import { useCallback, useEffect, useState } from "react";
import { getDataById } from "../../../services/getData.api";

const ThongTinNhaCungCap = ({
    form,
    isDetail,
}: {
    form: FormInstance;
    isDetail: boolean;
}) => {
    const columns = [
        {
            title: "Tên nhà cung cấp",
            dataIndex: "ten_nha_cung_cap",
            key: "ten_nha_cung_cap",
        },
        {
            title: "Mã nhà cung cấp",
            dataIndex: "ma_nha_cung_cap",
            key: "ma_nha_cung_cap",
        },
        {
            title: "Số điện thoại",
            dataIndex: "so_dien_thoai",
            key: "so_dien_thoai",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Mã số thuế",
            dataIndex: "ma_so_thue",
            key: "ma_so_thue",
        },
        {
            title: "Ngân hàng",
            dataIndex: "ngan_hang",
            key: "ngan_hang",
        },
        {
            title: "Số tài khoản",
            dataIndex: "so_tai_khoan",
            key: "so_tai_khoan",
        },
        {
            title: "Địa chỉ",
            dataIndex: "dia_chi",
            key: "dia_chi",
        },
        {
            title: "Công nợ",
            dataIndex: "cong_no",
            key: "cong_no",
            render: (value: number) => {
                return (
                    <Typography.Text>
                        {formatter(value) || 0 + " đ"}
                    </Typography.Text>
                );
            },
        },
    ];

    const [infoNhaCungCap, setInfoNhaCungCap] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchInfoNhaCungCap = useCallback(
        async (value: string) => {
            setIsLoading(true);
            try {
                const response = await getDataById(
                    Number(value),
                    API_ROUTE_CONFIG.NHA_CUNG_CAP
                );
                setInfoNhaCungCap(response);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [form]
    );

    useEffect(() => {
        if (!form.getFieldValue("nha_cung_cap_id")) {
            setInfoNhaCungCap(null);
        } else {
            fetchInfoNhaCungCap(form.getFieldValue("nha_cung_cap_id"));
        }
    }, [form.getFieldValue("nha_cung_cap_id"), fetchInfoNhaCungCap]);

    return (
        <>
            <Card>
                <Row>
                    <Col span={24}>
                        <SelectFormApi
                            name="nha_cung_cap_id"
                            label="Nhà cung cấp"
                            path={API_ROUTE_CONFIG.NHA_CUNG_CAP + "/options"}
                            placeholder="Chọn nhà cung cấp"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Nhà cung cấp không được bỏ trống!",
                                },
                            ]}
                            onChange={(value) => {
                                if (value) {
                                    fetchInfoNhaCungCap(value);
                                    form.setFieldValue(
                                        "danh_sach_san_pham",
                                        []
                                    );
                                }
                            }}
                            disabled={isDetail}
                        />
                    </Col>
                    <Col span={24}>
                        <Typography.Title level={4}>
                            Thông tin nhà cung cấp
                        </Typography.Title>
                        <Table
                            key={infoNhaCungCap?.id}
                            columns={columns}
                            dataSource={[
                                {
                                    ...infoNhaCungCap,
                                },
                            ]}
                            pagination={false}
                            loading={isLoading}
                            scroll={{ x: "max-content" }}
                        />
                    </Col>
                </Row>
            </Card>
        </>
    );
};

export default ThongTinNhaCungCap;
