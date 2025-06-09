/* eslint-disable @typescript-eslint/no-unused-vars */
import { Row, Col, Form, Input, type FormInstance, Select } from "antd";
import { trangThaiSelect } from "../../configs/select-config";

const FormNhaCungCap = ({ form }: { form: FormInstance }) => {
    return (
        <Row gutter={[10, 10]}>
            <Col span={12}>
                <Form.Item
                    name="ma_nha_cung_cap"
                    label="Mã nhà cung cấp"
                    rules={[
                        {
                            required: true,
                            message: "Mã nhà cung cấp không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập mã nhà cung cấp" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="ten_nha_cung_cap"
                    label="Tên nhà cung cấp"
                    rules={[
                        {
                            required: true,
                            message: "Tên nhà cung cấp không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên nhà cung cấp" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="so_dien_thoai"
                    label="Số điện thoại"
                    rules={[
                        {
                            required: true,
                            message: "Số điện thoại không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        {
                            required: true,
                            message: "Email không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập email" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item
                    name="dia_chi"
                    label="Địa chỉ"
                    rules={[
                        {
                            required: true,
                            message: "Địa chỉ không được bỏ trống!",
                        },
                    ]}
                >
                    <Input.TextArea placeholder="Nhập địa chỉ" />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    name="ma_so_thue"
                    label="Mã số thuế"
                    rules={[
                        {
                            required: true,
                            message: "Mã số thuế không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập mã số thuế" />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    name="ngan_hang"
                    label="Ngân hàng"
                    rules={[
                        {
                            required: true,
                            message: "Ngân hàng không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập ngân hàng" />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    name="so_tai_khoan"
                    label="Số tài khoản"
                    rules={[
                        {
                            required: true,
                            message: "Số tài khoản không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập số tài khoản" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea placeholder="Nhập ghi chú" />
                </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={24} hidden>
                <Form.Item
                    name="trang_thai"
                    label="Trạng thái"
                    initialValue={1}
                >
                    <Select options={trangThaiSelect} />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default FormNhaCungCap;
