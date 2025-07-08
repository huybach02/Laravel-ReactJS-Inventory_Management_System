/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    InputNumber,
    Row,
    Typography,
    type FormInstance,
} from "antd";
import { useCallback } from "react";
import SelectFormApi from "../../../components/select/SelectFormApi";
import { API_ROUTE_CONFIG } from "../../../configs/api-route-config";
import { getDataById } from "../../../services/getData.api";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const DanhSachSanPham = ({
    form,
    isDetail,
    isXuatHuy = false,
}: {
    form: FormInstance;
    isDetail: boolean;
    isXuatHuy?: boolean;
}) => {
    const danhSachSanPham = Form.useWatch("danh_sach_san_pham", form);

    const fetchProductDetail = useCallback(
        async (productId: string, rowIndex: number) => {
            try {
                const response = await getDataById(
                    Number(productId),
                    API_ROUTE_CONFIG.SAN_PHAM
                );

                // Tự động điền một số thông tin nếu có
                if (response) {
                    // Ví dụ: tự động điền giá nhập mặc định nếu có
                    if (response.gia_nhap_mac_dinh) {
                        form.setFieldValue(
                            ["danh_sach_san_pham", rowIndex, "gia_nhap"],
                            response.gia_nhap_mac_dinh
                        );
                    }

                    // Tự động điền đơn vị tính mặc định nếu có
                    if (response.ty_le_chiet_khau) {
                        form.setFieldValue(
                            ["danh_sach_san_pham", rowIndex, "chiet_khau"],
                            response.ty_le_chiet_khau
                        );
                    }
                }
            } catch (error) {
                console.error("Error fetching product detail:", error);
            }
        },
        [form]
    );

    const handleChangeSanPham = useCallback(
        (name: number) => {
            form.setFieldValue(
                ["danh_sach_san_pham", name, "don_vi_tinh_id"],
                undefined
            );

            // Reset giá nhập và tổng tiền
            form.setFieldValue(
                ["danh_sach_san_pham", name, "so_luong_nhap"],
                undefined
            );
            form.setFieldValue(
                ["danh_sach_san_pham", name, "gia_nhap"],
                undefined
            );
            form.setFieldValue(
                ["danh_sach_san_pham", name, "tong_tien"],
                undefined
            );
        },
        [form]
    );

    return (
        <>
            <Card>
                <Typography.Title level={4}>
                    Danh sách nhập sản phẩm/nguyên vật liệu
                </Typography.Title>
                <Divider />
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
                                    <Col span={2}>
                                        <Typography.Text strong>
                                            Đơn vị tính
                                        </Typography.Text>
                                    </Col>
                                    {!isXuatHuy && (
                                        <Col span={2}>
                                            <Typography.Text strong>
                                                Số lượng cần xuất
                                            </Typography.Text>
                                        </Col>
                                    )}
                                    <Col span={10}>
                                        <Typography.Text strong>
                                            Lô sản phẩm
                                        </Typography.Text>
                                    </Col>
                                    <Col span={2}>
                                        <Typography.Text strong>
                                            Số lượng xuất kho
                                        </Typography.Text>
                                    </Col>
                                    {isXuatHuy && (
                                        <Col span={1}>
                                            <Typography.Text strong>
                                                Thao tác
                                            </Typography.Text>
                                        </Col>
                                    )}
                                </Row>

                                {fields.map(({ key, name, ...restField }) => {
                                    const sanPhamId =
                                        danhSachSanPham?.[name]?.san_pham_id;
                                    const donViTinhId =
                                        danhSachSanPham?.[name]?.don_vi_tinh_id;

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
                                                        onChange={(value) => {
                                                            handleChangeSanPham(
                                                                name
                                                            );
                                                            // Gọi API để lấy thông tin chi tiết sản phẩm
                                                            if (value) {
                                                                fetchProductDetail(
                                                                    value,
                                                                    name
                                                                );
                                                            }
                                                        }}
                                                        disabled={
                                                            isXuatHuy
                                                                ? isXuatHuy &&
                                                                  isDetail
                                                                    ? true
                                                                    : false
                                                                : true
                                                        }
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2}>
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
                                                            API_ROUTE_CONFIG.DON_VI_TINH +
                                                            `/options-by-san-pham/${sanPhamId}`
                                                        }
                                                        reload={sanPhamId}
                                                        placeholder="Chọn đơn vị tính"
                                                        showSearch
                                                        disabled={
                                                            isXuatHuy
                                                                ? isXuatHuy &&
                                                                  isDetail
                                                                    ? true
                                                                    : false
                                                                : true
                                                        }
                                                    />
                                                </Form.Item>
                                            </Col>
                                            {!isXuatHuy && (
                                                <Col span={2}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "so_luong_can_mua",
                                                        ]}
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
                                                            placeholder="Số lượng cần mua"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                            disabled
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            )}
                                            <Col span={10}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[
                                                        name,
                                                        "ma_lo_san_pham",
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
                                                            API_ROUTE_CONFIG.SAN_PHAM +
                                                            `/options-lo-san-pham-by-san-pham/${sanPhamId}/${donViTinhId}`
                                                        }
                                                        reload={
                                                            sanPhamId &&
                                                            donViTinhId
                                                                ? [
                                                                      sanPhamId,
                                                                      donViTinhId,
                                                                  ]
                                                                : undefined
                                                        }
                                                        placeholder="Chọn lô sản phẩm"
                                                        showSearch
                                                        disabled={isDetail}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2}>
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
                                                        placeholder="Số lượng xuất"
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        disabled={isDetail}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            {isXuatHuy && (
                                                <Col span={1}>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={
                                                            <MinusCircleOutlined />
                                                        }
                                                        onClick={() =>
                                                            remove(name)
                                                        }
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                            )}
                                        </Row>
                                    );
                                })}
                                {!isDetail && isXuatHuy && (
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
