/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    InputNumber,
    Row,
    Typography,
    type FormInstance,
} from "antd";
import { useCallback, useEffect } from "react";
import SelectFormApi from "../../../components/select/SelectFormApi";
import { API_ROUTE_CONFIG } from "../../../configs/api-route-config";
import { formatter, parser } from "../../../utils/utils";
import { getDataById } from "../../../services/getData.api";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const DanhSachSanPham = ({
    form,
    isDetail,
    isNhapSanXuat = false,
    isEditing = false,
}: {
    form: FormInstance;
    isDetail: boolean;
    isNhapSanXuat?: boolean;
    isEditing?: boolean;
}) => {
    const danhSachSanPham = Form.useWatch("danh_sach_san_pham", form);

    useEffect(() => {
        if (danhSachSanPham) {
            const newDanhSachSanPham = [...danhSachSanPham];
            let changed = false;

            newDanhSachSanPham.forEach((item, index) => {
                if (item) {
                    const soLuong = item.so_luong_nhap || 0;
                    const giaNhap = item.gia_nhap || 0;
                    const chietKhau = item.chiet_khau || 0;
                    const tongTien = soLuong * giaNhap * (1 - chietKhau / 100);

                    if (item.tong_tien !== tongTien) {
                        newDanhSachSanPham[index] = {
                            ...item,
                            tong_tien: tongTien,
                        };
                        changed = true;
                    }
                }
            });

            if (changed) {
                form.setFieldsValue({
                    danh_sach_san_pham: newDanhSachSanPham,
                });
            }
        }
    }, [danhSachSanPham, form]);

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
                                    <Col span={isNhapSanXuat ? 6 : 4}>
                                        <Typography.Text strong>
                                            Tên SP/NVL
                                        </Typography.Text>
                                    </Col>
                                    <Col span={2}>
                                        <Typography.Text strong>
                                            Đơn vị tính
                                        </Typography.Text>
                                    </Col>
                                    <Col span={3}>
                                        <Typography.Text strong>
                                            Ngày sản xuất
                                        </Typography.Text>
                                    </Col>
                                    <Col span={3}>
                                        <Typography.Text strong>
                                            Hạn sử dụng
                                        </Typography.Text>
                                    </Col>
                                    {isNhapSanXuat &&
                                        !isDetail &&
                                        !isEditing && (
                                            <Col span={2}>
                                                <Typography.Text strong>
                                                    Số lượng cần nhập
                                                </Typography.Text>
                                            </Col>
                                        )}
                                    <Col span={2}>
                                        <Typography.Text strong>
                                            Số lượng nhập
                                        </Typography.Text>
                                    </Col>
                                    <Col span={3}>
                                        <Typography.Text strong>
                                            Giá nhập
                                        </Typography.Text>
                                    </Col>
                                    {!isNhapSanXuat && (
                                        <Col span={2}>
                                            <Typography.Text strong>
                                                Chiết khấu
                                            </Typography.Text>
                                        </Col>
                                    )}
                                    <Col span={3}>
                                        <Typography.Text strong>
                                            Tổng tiền
                                        </Typography.Text>
                                    </Col>
                                    {!isNhapSanXuat && (
                                        <Col span={2}>
                                            <Typography.Text strong>
                                                Thao tác
                                            </Typography.Text>
                                        </Col>
                                    )}
                                </Row>

                                {fields.map(({ key, name, ...restField }) => (
                                    <Row
                                        key={key}
                                        gutter={[8, 8]}
                                        className="product-row"
                                        style={{
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Col span={isNhapSanXuat ? 6 : 4}>
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
                                                {!isNhapSanXuat && (
                                                    <SelectFormApi
                                                        path={
                                                            API_ROUTE_CONFIG.SAN_PHAM +
                                                            `/options-by-nha-cung-cap/${form.getFieldValue(
                                                                "nha_cung_cap_id"
                                                            )}`
                                                        }
                                                        placeholder="Chọn sản phẩm"
                                                        showSearch
                                                        reload={form.getFieldValue(
                                                            "nha_cung_cap_id"
                                                        )}
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
                                                        disabled={isDetail}
                                                    />
                                                )}
                                                {isNhapSanXuat && (
                                                    <SelectFormApi
                                                        path={
                                                            API_ROUTE_CONFIG.SAN_PHAM +
                                                            `/options`
                                                        }
                                                        placeholder="Chọn sản phẩm"
                                                        showSearch
                                                        disabled
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "don_vi_tinh_id"]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Vui lòng chọn đơn vị tính!",
                                                    },
                                                ]}
                                                dependencies={["san_pham_id"]}
                                            >
                                                <SelectFormApi
                                                    path={
                                                        API_ROUTE_CONFIG.DON_VI_TINH +
                                                        `/options-by-san-pham/${form.getFieldValue(
                                                            [
                                                                "danh_sach_san_pham",
                                                                name,
                                                                "san_pham_id",
                                                            ]
                                                        )}`
                                                    }
                                                    reload={form.getFieldValue([
                                                        "danh_sach_san_pham",
                                                        name,
                                                        "san_pham_id",
                                                    ])}
                                                    placeholder="Chọn đơn vị tính"
                                                    showSearch
                                                    disabled={
                                                        isDetail ||
                                                        isNhapSanXuat
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "ngay_san_xuat"]}
                                            >
                                                <DatePicker
                                                    placeholder="Ngày sản xuất"
                                                    style={{
                                                        width: "100%",
                                                    }}
                                                    format="DD/MM/YYYY"
                                                    disabled={isDetail}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "ngay_het_han"]}
                                            >
                                                <DatePicker
                                                    placeholder="Hạn sử dụng"
                                                    style={{
                                                        width: "100%",
                                                    }}
                                                    format="DD/MM/YYYY"
                                                    disabled={isDetail}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {isNhapSanXuat &&
                                            !isDetail &&
                                            !isEditing && (
                                                <Col span={2}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "so_luong_can_nhap",
                                                        ]}
                                                    >
                                                        <InputNumber
                                                            min={1}
                                                            placeholder="Số lượng"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                            disabled
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            )}
                                        <Col span={2}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "so_luong_nhap"]}
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
                                        <Col span={3}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "gia_nhap"]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Vui lòng nhập giá nhập!",
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    placeholder="Giá nhập"
                                                    style={{
                                                        width: "100%",
                                                    }}
                                                    formatter={formatter}
                                                    parser={parser}
                                                    addonAfter="đ"
                                                    disabled={isDetail}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {!isNhapSanXuat && (
                                            <Col span={2}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "chiet_khau"]}
                                                    initialValue={0}
                                                >
                                                    <InputNumber
                                                        min={0}
                                                        placeholder="Chiết khấu"
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        formatter={formatter}
                                                        parser={parser}
                                                        max={100}
                                                        addonAfter="%"
                                                        disabled={isDetail}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        )}
                                        <Col span={3}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "tong_tien"]}
                                                dependencies={[
                                                    [name, "so_luong_nhap"],
                                                    [name, "gia_nhap"],
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
                                        {!isNhapSanXuat && (
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
                                        )}
                                    </Row>
                                ))}

                                {!isDetail && !isNhapSanXuat && (
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
