/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Col, Flex, Form, Input, Row, Switch, Typography } from "antd";
import Heading from "../../components/heading";
import { GrConfigure, GrLock } from "react-icons/gr";
import { useEffect, useState } from "react";
import type { ICauHinhChung } from "../../types/main.type";
import { EditOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { postData } from "../../services/postData.api";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { setLoading } from "../../redux/slices/main.slice";
import { getListData } from "../../services/getData.api";

const path = API_ROUTE_CONFIG.CAU_HINH_CHUNG;

const CauHinhChung = () => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state: RootState) => state.main);

    const [form] = Form.useForm<ICauHinhChung>();
    const [isEditing, setIsEditing] = useState(false);

    const getConfigData = async () => {
        const res = await getListData(path);
        if (res) {
            form.setFieldsValue({
                SO_LAN_DANG_NHAP_SAI_TOI_DA: Number(
                    res.SO_LAN_DANG_NHAP_SAI_TOI_DA
                ),
                THOI_GIAN_KHOA_TAI_KHOAN: Number(res.THOI_GIAN_KHOA_TAI_KHOAN),
                XAC_THUC_2_YEU_TO: res.XAC_THUC_2_YEU_TO === "1",
                THOI_GIAN_HET_HAN_OTP: Number(res.THOI_GIAN_HET_HAN_OTP),
                THOI_HAN_XAC_THUC_LAI_THIET_BI: Number(
                    res.THOI_HAN_XAC_THUC_LAI_THIET_BI
                ),
                CHECK_THOI_GIAN_LAM_VIEC: res.CHECK_THOI_GIAN_LAM_VIEC === "1",
            });
        }
    };

    // Khởi tạo giá trị mặc định cho form
    useEffect(() => {
        getConfigData();
    }, []);

    const onFinish = async (values: any) => {
        dispatch(setLoading(true));
        await postData(path, values, () => setIsEditing(false));
        dispatch(setLoading(false));
        getConfigData();
    };

    return (
        <>
            <Heading title="Cấu hình chung" />
            <div>
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    initialValues={{ XAC_THUC_2_YEU_TO: true }}
                >
                    <Flex align="center" gap={8} style={{ marginBottom: 15 }}>
                        <GrConfigure size={16} />
                        <Typography.Title level={4} style={{ margin: 0 }}>
                            Thiết lập khi đăng nhập sai thông tin
                        </Typography.Title>
                    </Flex>
                    <Row gutter={16}>
                        <Col md={8} xs={24}>
                            <Form.Item
                                name="SO_LAN_DANG_NHAP_SAI_TOI_DA"
                                label="Số lần đăng nhập sai tối đa"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Vui lòng nhập số lần đăng nhập sai tối đa!",
                                    },
                                ]}
                            >
                                <Input
                                    type="number"
                                    placeholder="Nhập số lần đăng nhập sai tối đa"
                                    disabled={!isEditing}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={8} xs={24}>
                            <Form.Item
                                name="THOI_GIAN_KHOA_TAI_KHOAN"
                                label="Thời gian tạm khóa tài khoản (phút)"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Vui lòng nhập thời gian tạm khóa tài khoản!",
                                    },
                                ]}
                            >
                                <Input
                                    type="number"
                                    placeholder="Nhập thời gian tạm khóa tài khoản"
                                    disabled={!isEditing}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Flex align="center" gap={8} style={{ marginBottom: 15 }}>
                        <GrLock size={16} />
                        <Typography.Title level={4} style={{ margin: 0 }}>
                            Xác thực 2 yếu tố
                        </Typography.Title>
                    </Flex>
                    <Row gutter={16}>
                        <Col span={8} md={8} xs={24}>
                            <Form.Item
                                name="XAC_THUC_2_YEU_TO"
                                label="Bật/tắt xác thực 2 yếu tố"
                                valuePropName="checked"
                            >
                                <Switch disabled={!isEditing} />
                            </Form.Item>
                        </Col>
                        <Col span={8} md={8} xs={24}>
                            <Form.Item
                                name="THOI_GIAN_HET_HAN_OTP"
                                label="Thời gian hết hạn OTP (phút)"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Vui lòng nhập thời gian hết hạn OTP!",
                                    },
                                ]}
                            >
                                <Input
                                    type="number"
                                    placeholder="Nhập thời gian hết hạn OTP"
                                    disabled={!isEditing}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8} md={8} xs={24}>
                            <Form.Item
                                name="THOI_HAN_XAC_THUC_LAI_THIET_BI"
                                label="Thời hạn xác thực lại thiết bị (ngày)"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Vui lòng nhập thời hạn xác thực lại thiết bị!",
                                    },
                                ]}
                            >
                                <Input
                                    type="number"
                                    placeholder="Nhập thời hạn xác thực lại thiết bị"
                                    disabled={!isEditing}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Flex align="center" gap={8} style={{ marginBottom: 15 }}>
                        <ClockCircleOutlined size={16} />
                        <Typography.Title level={4} style={{ margin: 0 }}>
                            Thời gian làm việc
                        </Typography.Title>
                    </Flex>
                    <Row gutter={16}>
                        <Col span={8} md={8} xs={24}>
                            <Form.Item
                                name="CHECK_THOI_GIAN_LAM_VIEC"
                                label="Bật/tắt kiểm tra thời gian làm việc"
                                valuePropName="checked"
                            >
                                <Switch disabled={!isEditing} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end">
                        {!isEditing && (
                            <Button
                                htmlType="submit"
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => setIsEditing(true)}
                            >
                                Chỉnh sửa
                            </Button>
                        )}
                        {isEditing && (
                            <Flex align="center" gap={8}>
                                <Button
                                    htmlType="submit"
                                    type="default"
                                    onClick={() => {
                                        setIsEditing(false);
                                        getConfigData();
                                    }}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button
                                    htmlType="submit"
                                    type="primary"
                                    loading={isLoading}
                                >
                                    Lưu cấu hình
                                </Button>
                            </Flex>
                        )}
                    </Row>
                </Form>
            </div>
        </>
    );
};

export default CauHinhChung;
