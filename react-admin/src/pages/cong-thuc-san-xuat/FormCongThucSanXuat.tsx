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
import { createFilterQuery, formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import DanhSachSanPham from "./components/DanhSachSanPham";

const FormCongThucSanXuat = ({ form }: { form: FormInstance }) => {
    const sanPhamId = Form.useWatch("san_pham_id", form);

    return (
        <Row gutter={[10, 10]}>
            <Col span={12} xs={24} md={12} lg={12}>
                <SelectFormApi
                    name="san_pham_id"
                    label="Sản phẩm"
                    path={API_ROUTE_CONFIG.SAN_PHAM + "/options"}
                    placeholder="Chọn sản phẩm"
                    filter={createFilterQuery(
                        0,
                        "loai_san_pham",
                        "equal",
                        "SP_SAN_XUAT"
                    )}
                    rules={[
                        {
                            required: true,
                            message: "Sản phẩm không được bỏ trống!",
                        },
                    ]}
                />
            </Col>
            <Col span={6} xs={24} md={12} lg={6}>
                <Form.Item
                    name="so_luong"
                    label="Số lượng"
                    rules={[
                        {
                            required: true,
                            message: "Số lượng không được bỏ trống!",
                        },
                    ]}
                    initialValue={1}
                >
                    <InputNumber
                        placeholder="Nhập số lượng"
                        style={{ width: "100%" }}
                        min={1}
                        max={1000000}
                    />
                </Form.Item>
            </Col>
            <Col span={6} xs={24} md={12} lg={6}>
                <SelectFormApi
                    name="don_vi_tinh_id"
                    label="Đơn vị tính"
                    path={
                        API_ROUTE_CONFIG.DON_VI_TINH +
                        "/options-by-san-pham/" +
                        sanPhamId
                    }
                    placeholder="Chọn đơn vị tính"
                    reload={sanPhamId}
                    rules={[
                        {
                            required: true,
                            message: "Đơn vị tính không được bỏ trống!",
                        },
                    ]}
                />
            </Col>
            <Col span={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea
                        placeholder="Nhập ghi chú"
                        rows={2}
                        maxLength={255}
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
            <Col span={24}>
                <DanhSachSanPham form={form} isDetail={false} />
            </Col>
        </Row>
    );
};

export default FormCongThucSanXuat;
