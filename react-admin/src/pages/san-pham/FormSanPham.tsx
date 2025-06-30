/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Row,
    Col,
    Form,
    Input,
    InputNumber,
    type FormInstance,
    Select,
    Tooltip,
    Image,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { createFilterQuery, formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";
import ImageUploadSingle from "../../components/upload/ImageUploadSingle";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { OPTIONS_LOAI_SAN_PHAM } from "../../utils/constant";

const FormSanPham = ({
    form,
    isDetail = false,
}: {
    form: FormInstance;
    isDetail?: boolean;
}) => {
    const loaiSanPham = Form.useWatch("loai_san_pham", form);

    return (
        <Row gutter={[10, 10]}>
            <Col span={24}>
                {!isDetail ? (
                    <Form.Item name="image" label="Ảnh sản phẩm">
                        <ImageUploadSingle />
                    </Form.Item>
                ) : (
                    <Form.Item name="image" label="Ảnh sản phẩm">
                        <Image
                            src={form.getFieldValue("image")}
                            width={100}
                            height={100}
                        />
                    </Form.Item>
                )}
            </Col>
            <Col span={12}>
                <Form.Item
                    name="ma_san_pham"
                    label="Mã sản phẩm"
                    rules={[
                        {
                            required: true,
                            message: "Mã sản phẩm không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập mã sản phẩm" disabled={isDetail} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="ten_san_pham"
                    label="Tên sản phẩm"
                    rules={[
                        {
                            required: true,
                            message: "Tên sản phẩm không được bỏ trống!",
                        },
                    ]}
                >
                    <Input
                        placeholder="Nhập tên sản phẩm"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <SelectFormApi
                    name="danh_muc_id"
                    label="Danh mục sản phẩm"
                    path={API_ROUTE_CONFIG.DANH_MUC_SAN_PHAM + "/options"}
                    placeholder="Chọn danh mục sản phẩm"
                    filter={createFilterQuery(1, "trang_thai", "equal", 1)}
                    rules={[
                        {
                            required: true,
                            message: "Danh mục sản phẩm không được bỏ trống!",
                        },
                    ]}
                    disabled={isDetail}
                />
            </Col>
            <Col span={12}>
                <Form.Item
                    name="loai_san_pham"
                    label="Loại sản phẩm"
                    rules={[
                        {
                            required: true,
                            message: "Loại sản phẩm không được bỏ trống!",
                        },
                    ]}
                >
                    <Select
                        options={OPTIONS_LOAI_SAN_PHAM}
                        disabled={isDetail}
                        placeholder="Chọn loại sản phẩm"
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <SelectFormApi
                    mode="multiple"
                    name="don_vi_tinh_id"
                    label="Đơn vị tính"
                    path={API_ROUTE_CONFIG.DON_VI_TINH + "/options"}
                    placeholder="Chọn đơn vị tính"
                    filter={createFilterQuery(1, "trang_thai", "equal", 1)}
                    rules={[
                        {
                            required: true,
                            message: "Đơn vị tính không được bỏ trống!",
                        },
                    ]}
                    disabled={isDetail}
                />
            </Col>
            {(loaiSanPham === "SP_NHA_CUNG_CAP" ||
                loaiSanPham === "NGUYEN_LIEU") && (
                <Col span={24}>
                    <SelectFormApi
                        mode="multiple"
                        name="nha_cung_cap_id"
                        label="Nhà cung cấp"
                        path={API_ROUTE_CONFIG.NHA_CUNG_CAP + "/options"}
                        placeholder="Chọn nhà cung cấp"
                        filter={createFilterQuery(1, "trang_thai", "equal", 1)}
                        rules={[
                            {
                                required:
                                    loaiSanPham === "SP_NHA_CUNG_CAP" ||
                                    loaiSanPham === "NGUYEN_LIEU",
                                message: "Nhà cung cấp không được bỏ trống!",
                            },
                        ]}
                        disabled={isDetail}
                    />
                </Col>
            )}
            <Col span={12}>
                <Form.Item
                    name="gia_nhap_mac_dinh"
                    label="Giá nhập mặc định"
                    rules={[
                        {
                            required: true,
                            message: "Giá nhập mặc định không được bỏ trống!",
                        },
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập giá nhập mặc định"
                        addonAfter="VNĐ"
                        style={{ width: "100%" }}
                        formatter={formatter}
                        parser={parser}
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            {(loaiSanPham === "SP_SAN_XUAT" ||
                loaiSanPham === "SP_NHA_CUNG_CAP") && (
                <Col span={12}>
                    <Form.Item
                        name="ty_le_chiet_khau"
                        label={
                            <span>
                                Tỷ lệ chiết khấu{" "}
                                <Tooltip title="Tỷ lệ chiết khấu từ nhà cung cấp cho sản phẩm này.">
                                    <QuestionCircleOutlined
                                        style={{ color: "#1890ff" }}
                                    />
                                </Tooltip>
                            </span>
                        }
                        rules={[
                            {
                                required: true,
                                message:
                                    "Tỷ lệ chiết khấu không được bỏ trống!",
                            },
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập tỷ lệ chiết khấu"
                            addonAfter="%"
                            style={{ width: "100%" }}
                            min={0}
                            max={100}
                            disabled={isDetail}
                        />
                    </Form.Item>
                </Col>
            )}
            {(loaiSanPham === "SP_SAN_XUAT" ||
                loaiSanPham === "SP_NHA_CUNG_CAP") && (
                <Col span={12}>
                    <Form.Item
                        name="muc_loi_nhuan"
                        label={
                            <span>
                                Mức lợi nhuận{" "}
                                <Tooltip title="Mức lợi nhuận khi bán lẻ sản phẩm này.">
                                    <QuestionCircleOutlined
                                        style={{ color: "#1890ff" }}
                                    />
                                </Tooltip>
                            </span>
                        }
                        rules={[
                            {
                                required: true,
                                message: "Mức lợi nhuận không được bỏ trống!",
                            },
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập mức lợi nhuận"
                            addonAfter="%"
                            style={{ width: "100%" }}
                            min={0}
                            max={100}
                            disabled={isDetail}
                        />
                    </Form.Item>
                </Col>
            )}
            <Col span={12}>
                <Form.Item
                    name="so_luong_canh_bao"
                    label={
                        <span>
                            Số lượng cảnh báo{" "}
                            <Tooltip title="Số lượng cảnh báo khi sản phẩm này còn lại ít hơn số lượng này.">
                                <QuestionCircleOutlined
                                    style={{ color: "#1890ff" }}
                                />
                            </Tooltip>
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Số lượng cảnh báo không được bỏ trống!",
                        },
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập số lượng cảnh báo"
                        addonAfter="sản phẩm"
                        style={{ width: "100%" }}
                        min={0}
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea
                        placeholder="Nhập ghi chú"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={24} hidden>
                <Form.Item
                    name="trang_thai"
                    label="Trạng thái"
                    initialValue={1}
                >
                    <Select options={trangThaiSelect} disabled={isDetail} />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default FormSanPham;
