/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Row,
    Col,
    Form,
    Input,
    InputNumber,
    type FormInstance,
    Select,
} from "antd";
import { formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";

const FormLoaiKhachHang = ({ form }: { form: FormInstance }) => {
    return (
        <Row gutter={[10, 10]}>
            <Col span={12}>
                <Form.Item
                    name="ten_loai_khach_hang"
                    label="Tên loại khách hàng"
                    rules={[
                        {
                            required: true,
                            message: "Tên loại khách hàng không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên loại khách hàng" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="nguong_doanh_thu"
                    label="Ngưỡng doanh thu (VNĐ)"
                    rules={[
                        {
                            required: true,
                            message: "Ngưỡng doanh thu không được bỏ trống!",
                        },
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập ngưỡng doanh thu"
                        style={{ width: "100%" }}
                        formatter={formatter}
                        parser={parser}
                    />
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

export default FormLoaiKhachHang;
