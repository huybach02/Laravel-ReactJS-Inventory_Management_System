/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Card,
    Col,
    Form,
    InputNumber,
    Row,
    Typography,
    type FormInstance,
} from "antd";
import { useCallback } from "react";
import SelectFormApi from "../../../components/select/SelectFormApi";
import { API_ROUTE_CONFIG } from "../../../configs/api-route-config";
import { formatter, parser } from "../../../utils/utils";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { getDataSelect } from "../../../services/getData.api";

const DanhSachSanPham = ({
    form,
    isDetail,
}: {
    form: FormInstance;
    isDetail: boolean;
}) => {
    // Watch tất cả giá trị trong danh sách sản phẩm
    const danhSachSanPham = Form.useWatch("danh_sach_san_pham", form) || [];

    const handleChangeSanPham = useCallback(
        (name: number) => {
            form.setFieldValue(
                ["danh_sach_san_pham", name, "don_vi_tinh_id"],
                undefined
            );

            // Reset giá nhập và tổng tiền
            form.setFieldValue(
                ["danh_sach_san_pham", name, "so_luong"],
                undefined
            );
            form.setFieldValue(
                ["danh_sach_san_pham", name, "don_gia"],
                undefined
            );
            form.setFieldValue(
                ["danh_sach_san_pham", name, "tong_tien"],
                undefined
            );
        },
        [form]
    );

    const handleGetGiaBanSanPham = useCallback(
        async (name: number, sanPhamId: number, donViTinhId: number) => {
            form.setFieldValue(
                ["danh_sach_san_pham", name, "don_gia"],
                undefined
            );

            const response = await getDataSelect(
                API_ROUTE_CONFIG.QUAN_LY_BAN_HANG + `/get-gia-ban-san-pham`,
                {
                    san_pham_id: sanPhamId,
                    don_vi_tinh_id: donViTinhId,
                }
            );

            if (response) {
                form.setFieldValue(
                    ["danh_sach_san_pham", name, "don_gia"],
                    response
                );
            }
        },
        [form]
    );

    return (
        <>
            <Card>
                <Typography.Title level={4}>
                    Danh sách sản phẩm
                </Typography.Title>
                <div
                    className="product-list-container"
                    style={{
                        overflowX: "auto",
                        overflowY: "visible",
                    }}
                >
                    <Form.List name="danh_sach_san_pham">
                        {(fields, { add, remove }) => (
                            <>
                                <Row
                                    gutter={[8, 8]}
                                    className="product-row"
                                    style={{
                                        marginBottom: 16,
                                    }}
                                >
                                    <Col span={8}>
                                        <Typography.Text strong>
                                            Tên SP/NVL
                                        </Typography.Text>
                                    </Col>
                                    <Col span={3}>
                                        <Typography.Text strong>
                                            Đơn vị tính
                                        </Typography.Text>
                                    </Col>
                                    <Col span={4}>
                                        <Typography.Text strong>
                                            Giá bán
                                        </Typography.Text>
                                    </Col>
                                    <Col span={3}>
                                        <Typography.Text strong>
                                            Số lượng
                                        </Typography.Text>
                                    </Col>
                                    <Col span={4}>
                                        <Typography.Text strong>
                                            Tổng tiền
                                        </Typography.Text>
                                    </Col>
                                    <Col span={2}>
                                        <Typography.Text strong>
                                            Thao tác
                                        </Typography.Text>
                                    </Col>
                                </Row>

                                {fields.map(({ key, name, ...restField }) => {
                                    // Lấy giá trị san_pham_id cho item hiện tại
                                    const sanPhamId =
                                        danhSachSanPham[name]?.san_pham_id;

                                    return (
                                        <Row
                                            key={key}
                                            gutter={[8, 8]}
                                            className="product-row"
                                            style={{
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "san_pham_id"]}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Vui lòng chọn sản phẩm!",
                                                        },
                                                    ]}
                                                >
                                                    <SelectFormApi
                                                        path={
                                                            API_ROUTE_CONFIG.SAN_PHAM +
                                                            `/options`
                                                        }
                                                        placeholder="Chọn sản phẩm"
                                                        showSearch
                                                        onChange={() => {
                                                            handleChangeSanPham(
                                                                name
                                                            );
                                                        }}
                                                        disabled={isDetail}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={3}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[
                                                        name,
                                                        "don_vi_tinh_id",
                                                    ]}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Vui lòng chọn đơn vị tính!",
                                                        },
                                                    ]}
                                                    dependencies={[
                                                        "san_pham_id",
                                                    ]}
                                                >
                                                    <SelectFormApi
                                                        path={
                                                            sanPhamId
                                                                ? API_ROUTE_CONFIG.DON_VI_TINH +
                                                                  `/options-by-san-pham/${sanPhamId}`
                                                                : ""
                                                        }
                                                        reload={sanPhamId}
                                                        placeholder="Chọn đơn vị tính"
                                                        showSearch
                                                        disabled={
                                                            isDetail ||
                                                            !sanPhamId
                                                        }
                                                        onChange={(value) => {
                                                            handleGetGiaBanSanPham(
                                                                name,
                                                                danhSachSanPham[
                                                                    name
                                                                ]?.san_pham_id,
                                                                value
                                                            );
                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "don_gia"]}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Vui lòng nhập giá bán!",
                                                        },
                                                    ]}
                                                >
                                                    <InputNumber
                                                        min={0}
                                                        placeholder="Giá bán"
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        formatter={formatter}
                                                        parser={parser}
                                                        addonAfter="đ"
                                                        disabled
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={3}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "so_luong"]}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Vui lòng nhập số lượng!",
                                                        },
                                                    ]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        placeholder="Số lượng"
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        disabled={isDetail}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "tong_tien"]}
                                                    dependencies={[
                                                        [name, "so_luong"],
                                                        [name, "gia_ban"],
                                                        [name, "chiet_khau"],
                                                    ]}
                                                >
                                                    <InputNumber
                                                        placeholder="Tổng tiền"
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        formatter={formatter}
                                                        parser={parser}
                                                        disabled
                                                        addonAfter="đ"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2}>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={
                                                        <MinusCircleOutlined />
                                                    }
                                                    onClick={() => remove(name)}
                                                    disabled={isDetail}
                                                />
                                            </Col>
                                        </Row>
                                    );
                                })}

                                {!isDetail && (
                                    <Row>
                                        <Col span={24}>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm sản phẩm
                                            </Button>
                                        </Col>
                                    </Row>
                                )}
                            </>
                        )}
                    </Form.List>
                </div>
            </Card>
        </>
    );
};

export default DanhSachSanPham;
