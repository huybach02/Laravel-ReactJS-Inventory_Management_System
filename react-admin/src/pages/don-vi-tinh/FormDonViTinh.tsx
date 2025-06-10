/* eslint-disable @typescript-eslint/no-unused-vars */
import { Row, Col, Form, Input, type FormInstance, Select } from "antd";
import { trangThaiSelect } from "../../configs/select-config";

const FormDonViTinh = ({ form }: { form: FormInstance }) => {
    return (
        <Row gutter={[10, 10]}>
            <Col span={12}>
                <Form.Item
                    name="ten_don_vi"
                    label="Tên đơn vị"
                    rules={[
                        {
                            required: true,
                            message: "Tên đơn vị không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên đơn vị" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="ky_hieu" label="Ký hiệu (không bắt buộc)">
                    <Input placeholder="Nhập ký hiệu" />
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

export default FormDonViTinh;
