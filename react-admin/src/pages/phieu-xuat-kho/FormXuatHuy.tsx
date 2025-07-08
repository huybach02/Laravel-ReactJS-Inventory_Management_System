/* eslint-disable @typescript-eslint/no-explicit-any */
import { Col, DatePicker, Form, Input, Row, type FormInstance } from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { generateMaPhieu } from "../../helpers/funcHelper";
import dayjs from "dayjs";
import DanhSachSanPham from "./components/DanhSachSanPham";

const FormXuatHuy = ({
    form,
    isDetail = false,
}: {
    form: FormInstance;
    isEditing?: boolean;
    isDetail?: boolean;
}) => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <Row gutter={[10, 10]}>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="ma_phieu_xuat_kho"
                    label="Mã phiếu xuất kho"
                    rules={[
                        {
                            required: true,
                            message: "Mã phiếu xuất kho không được bỏ trống!",
                        },
                    ]}
                    initialValue={generateMaPhieu("PXK")}
                >
                    <Input
                        placeholder="Nhập mã phiếu xuất kho"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="ngay_xuat_kho"
                    label="Ngày xuất kho"
                    rules={[
                        {
                            required: true,
                            message: "Ngày xuất không được bỏ trống!",
                        },
                    ]}
                    initialValue={dayjs()}
                >
                    <DatePicker
                        placeholder="Nhập ngày xuất"
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="nguoi_tao_phieu"
                    label="Người tạo phiếu"
                    initialValue={user?.name}
                >
                    <Input disabled />
                </Form.Item>
            </Col>
            <Col span={24} xs={24} sm={24} md={24} lg={24} xl={24}>
                <Form.Item
                    name="ly_do_huy"
                    label="Lý do hủy"
                    rules={[
                        {
                            required: true,
                            message: "Lý do hủy không được bỏ trống!",
                        },
                    ]}
                >
                    <Input.TextArea
                        placeholder="Nhập lý do hủy"
                        disabled={isDetail}
                        rows={2}
                    />
                </Form.Item>
            </Col>
            <Col span={24} xs={24} sm={24} md={24} lg={24} xl={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea
                        placeholder="Nhập ghi chú"
                        disabled={isDetail}
                        rows={2}
                    />
                </Form.Item>
            </Col>
            <Col span={24} style={{ marginBottom: 20 }}>
                <DanhSachSanPham
                    form={form}
                    isDetail={isDetail}
                    isXuatHuy={true}
                />
            </Col>
        </Row>
    );
};

export default FormXuatHuy;
