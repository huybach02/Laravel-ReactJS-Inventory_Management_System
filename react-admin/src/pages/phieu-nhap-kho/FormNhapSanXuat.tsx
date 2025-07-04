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

const FormNhapSanXuat = ({ form }: { form: FormInstance }) => {
    return (
        <Row gutter={[10, 10]}>
            <Col span={12}>
                <Form.Item
                    name="ma"
                    label="Mã"
                    rules={[
                        { required: true, message: "Mã không được bỏ trống!" },
                    ]}
                >
                    <Input placeholder="Nhập mã" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="ten"
                    label="Tên"
                    rules={[
                        { required: true, message: "Tên không được bỏ trống!" },
                    ]}
                >
                    <Input placeholder="Nhập tên" />
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
            <Col span={12}>
                <SelectFormApi
                    name="ten_select"
                    label="select"
                    path={""}
                    placeholder="Chọn select"
                    //filter={createFilterQuery(0, 'SELECT', 'equal', 0)}
                    rules={[
                        {
                            required: true,
                            message: "select không được bỏ trống!",
                        },
                    ]}
                />
            </Col>
        </Row>
    );
};

export default FormNhapSanXuat;
