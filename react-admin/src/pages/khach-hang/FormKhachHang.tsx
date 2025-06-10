/* eslint-disable @typescript-eslint/no-unused-vars */
import { Row, Col, Form, Input, InputNumber, type FormInstance } from "antd";
import { formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { phonePattern } from "../../utils/patterns";

const FormKhachHang = ({ form }: { form: FormInstance }) => {
    return (
        <Row gutter={[10, 10]}>
            <Col span={12}>
                <Form.Item
                    name="ten_khach_hang"
                    label="Tên khách hàng"
                    rules={[
                        {
                            required: true,
                            message: "Tên khách hàng không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên khách hàng" />
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
                        {
                            type: "email",
                            message: "Email không hợp lệ!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập email" />
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
                        {
                            pattern: phonePattern,
                            message: "Số điện thoại không hợp lệ!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập số điện thoại" />
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
                    <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default FormKhachHang;
