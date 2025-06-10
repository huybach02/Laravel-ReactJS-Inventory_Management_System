/* eslint-disable @typescript-eslint/no-unused-vars */
import { Row, Col, Form, Input, type FormInstance, Select } from "antd";
import { trangThaiSelect } from "../../configs/select-config";
import ImageUploadSingle from "../../components/upload/ImageUploadSingle";

const FormDanhMucSanPham = ({ form }: { form: FormInstance }) => {
    return (
        <Row gutter={[10, 10]}>
            <Col span={24}>
                <Form.Item name="image" label="Ảnh danh mục">
                    <ImageUploadSingle />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="ma_danh_muc"
                    label="Mã danh mục"
                    rules={[
                        {
                            required: true,
                            message: "Mã danh mục không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập mã danh mục" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="ten_danh_muc"
                    label="Tên danh mục"
                    rules={[
                        {
                            required: true,
                            message: "Tên danh mục không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên danh mục" />
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

export default FormDanhMucSanPham;
