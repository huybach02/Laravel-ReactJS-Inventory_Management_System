/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Row,
    Col,
    Form,
    Input,
    InputNumber,
    type FormInstance,
    Select,
    DatePicker,
    Card,
    Typography,
    Flex,
    Table,
    Button,
    Space,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { getDataById } from "../../services/getData.api";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { generateMaPhieu } from "../../helpers/funcHelper";

const FormNhapTuNhaCungCap = ({ form }: { form: FormInstance }) => {
    const { user } = useSelector((state: RootState) => state.auth);

    const [infoNhaCungCap, setInfoNhaCungCap] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedProducts, setSelectedProducts] = useState<{
        [key: number]: any;
    }>({});
    const [tongTienHang, setTongTienHang] = useState<number>(0);

    // Theo dõi thay đổi trong danh sách sản phẩm với debounce
    const danhSachSanPham = Form.useWatch("danh_sach_san_pham", form) || [];

    // Theo dõi thay đổi các field tính toán
    const thueVat = Form.useWatch("thue_vat", form) || 0;
    const chiPhiNhapHang = Form.useWatch("chi_phi_nhap_hang", form) || 0;
    const giamGiaNhapHang = Form.useWatch("giam_gia_nhap_hang", form) || 0;

    // Tính toán tổng tiền với useMemo để tránh tính toán lại không cần thiết
    const tongTienThanhToan = useMemo(() => {
        const tongTienCoBan =
            tongTienHang + (chiPhiNhapHang || 0) - (giamGiaNhapHang || 0);
        const tienThue = (tongTienCoBan * (thueVat || 0)) / 100;
        return tongTienCoBan + tienThue;
    }, [tongTienHang, chiPhiNhapHang, giamGiaNhapHang, thueVat]);

    const fetchInfoNhaCungCap = useCallback(
        async (value: string) => {
            setIsLoading(true);
            try {
                const response = await getDataById(
                    Number(value),
                    API_ROUTE_CONFIG.NHA_CUNG_CAP
                );
                setInfoNhaCungCap(response);

                // Reset danh sách sản phẩm khi thay đổi nhà cung cấp
                const currentProducts =
                    form.getFieldValue("danh_sach_san_pham") || [];
                const resetProducts = currentProducts.map(() => ({
                    san_pham_id: undefined,
                    so_luong: undefined,
                    gia_nhap: undefined,
                    gia_ban: undefined,
                    ngay_san_xuat: undefined,
                    han_su_dung: undefined,
                    vi_tri_luu: undefined,
                    tong_tien: undefined,
                }));
                form.setFieldValue("danh_sach_san_pham", resetProducts);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [form]
    );

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

    const columns = [
        {
            title: "Tên nhà cung cấp",
            dataIndex: "ten_nha_cung_cap",
            key: "ten_nha_cung_cap",
        },
        {
            title: "Mã nhà cung cấp",
            dataIndex: "ma_nha_cung_cap",
            key: "ma_nha_cung_cap",
        },
        {
            title: "Số điện thoại",
            dataIndex: "so_dien_thoai",
            key: "so_dien_thoai",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Mã số thuế",
            dataIndex: "ma_so_thue",
            key: "ma_so_thue",
        },
        {
            title: "Ngân hàng",
            dataIndex: "ngan_hang",
            key: "ngan_hang",
        },
        {
            title: "Số tài khoản",
            dataIndex: "so_tai_khoan",
            key: "so_tai_khoan",
        },
        {
            title: "Địa chỉ",
            dataIndex: "dia_chi",
            key: "dia_chi",
        },
        {
            title: "Công nợ",
            dataIndex: "cong_no",
            key: "cong_no",
            render: (value: number) => {
                return (
                    <Typography.Text>{formatter(value) || 0}</Typography.Text>
                );
            },
        },
    ];

    useEffect(() => {
        if (!form.getFieldValue("nha_cung_cap_id")) {
            setInfoNhaCungCap(null);
        }
    }, [form.getFieldValue("nha_cung_cap_id")]);

    // Tự động tính toán tổng tiền cho từng dòng sản phẩm
    useEffect(() => {
        const timer = setTimeout(() => {
            if (danhSachSanPham && Array.isArray(danhSachSanPham)) {
                const updatedProducts = danhSachSanPham.map(
                    (item: any, index: number) => {
                        if (item && item.so_luong_nhap && item.gia_nhap) {
                            const soLuong = Number(item.so_luong_nhap) || 0;
                            const giaNhap = Number(item.gia_nhap) || 0;
                            const chietKhau = Number(item.chiet_khau) || 0;
                            const tongTien =
                                soLuong * giaNhap * (1 - chietKhau / 100);

                            if (tongTien !== item.tong_tien) {
                                form.setFieldValue(
                                    ["danh_sach_san_pham", index, "tong_tien"],
                                    tongTien
                                );
                            }
                        }
                        return item;
                    }
                );
            }
        }, 50); // Debounce 50ms

        return () => clearTimeout(timer);
    }, [danhSachSanPham, form]);

    // Tính tổng tiền hàng khi danh sách sản phẩm thay đổi với debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            let tong = 0;
            if (danhSachSanPham && Array.isArray(danhSachSanPham)) {
                danhSachSanPham.forEach((item: any) => {
                    if (
                        item &&
                        typeof item.tong_tien === "number" &&
                        !isNaN(item.tong_tien)
                    ) {
                        tong += item.tong_tien;
                    }
                });
            }
            setTongTienHang(tong);
        }, 100); // Debounce 100ms

        return () => clearTimeout(timer);
    }, [danhSachSanPham]);

    return (
        <Row gutter={[10, 10]}>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="ma_phieu_nhap_kho"
                    label="Mã phiếu nhập kho"
                    rules={[
                        {
                            required: true,
                            message: "Mã phiếu nhập kho không được bỏ trống!",
                        },
                    ]}
                    initialValue={generateMaPhieu("PNK")}
                >
                    <Input placeholder="Nhập mã phiếu nhập kho" />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="ngay_nhap_kho"
                    label="Ngày nhập kho"
                    rules={[
                        {
                            required: true,
                            message: "Ngày nhập không được bỏ trống!",
                        },
                    ]}
                    initialValue={dayjs()}
                >
                    <DatePicker
                        placeholder="Nhập ngày nhập"
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="nguoi_tao_phieu"
                    label="Người tạo phiếu"
                    initialValue={user?.name}
                >
                    <Input disabled />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="so_hoa_don_nha_cung_cap"
                    label="Số hóa đơn nhà cung cấp"
                >
                    <Input placeholder="Nhập số hóa đơn nhà cung cấp" />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="nguoi_giao_hang"
                    label="Người giao hàng"
                    rules={[
                        {
                            required: true,
                            message: "Người giao hàng không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập người giao hàng" />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="so_dien_thoai_nguoi_giao_hang"
                    label="Số điện thoại người giao hàng"
                >
                    <Input placeholder="Nhập số điện thoại người giao hàng" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Card>
                    <Row>
                        <Col span={24}>
                            <SelectFormApi
                                name="nha_cung_cap_id"
                                label="Nhà cung cấp"
                                path={
                                    API_ROUTE_CONFIG.NHA_CUNG_CAP + "/options"
                                }
                                placeholder="Chọn nhà cung cấp"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Nhà cung cấp không được bỏ trống!",
                                    },
                                ]}
                                onChange={fetchInfoNhaCungCap}
                            />
                        </Col>
                        {infoNhaCungCap && (
                            <Col span={24}>
                                <Typography.Title level={4}>
                                    Thông tin nhà cung cấp
                                </Typography.Title>
                                <Table
                                    key={infoNhaCungCap?.id}
                                    columns={columns}
                                    dataSource={[
                                        {
                                            ...infoNhaCungCap,
                                        },
                                    ]}
                                    pagination={false}
                                    loading={isLoading}
                                    scroll={{ x: "max-content" }}
                                />
                            </Col>
                        )}
                    </Row>
                </Card>
            </Col>
            <Col span={24} style={{ marginBottom: 20 }}>
                <Card>
                    <Typography.Title level={4}>
                        Danh sách nhập sản phẩm/nguyên vật liệu
                    </Typography.Title>
                    <div
                        className="product-list-container"
                        style={{
                            overflowX: "auto",
                            overflowY: "visible",
                        }}
                    >
                        <style>
                            {`
                                @media (min-width: 1200px) {
                                    .product-list-container {
                                        overflow-x: visible !important;
                                    }
                                    .product-row {
                                        min-width: auto !important;
                                    }
                                }
                                @media (max-width: 1199px) {
                                    .product-row {
                                        min-width: 1200px !important;
                                    }
                                }
                            `}
                        </style>
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
                                        <Col span={4}>
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
                                        <Col span={2}>
                                            <Typography.Text strong>
                                                Chiết khấu
                                            </Typography.Text>
                                        </Col>
                                        <Col span={3}>
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

                                    {fields.map(
                                        ({ key, name, ...restField }) => (
                                            <Row
                                                key={key}
                                                gutter={[8, 8]}
                                                className="product-row"
                                                style={{
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <Col span={4}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "san_pham_id",
                                                        ]}
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
                                                                `/options-by-nha-cung-cap/${infoNhaCungCap.id}`
                                                            }
                                                            placeholder="Chọn sản phẩm"
                                                            showSearch
                                                            key={
                                                                infoNhaCungCap?.id ||
                                                                "all"
                                                            }
                                                            onChange={(
                                                                value
                                                            ) => {
                                                                // Reset đơn vị tính khi thay đổi sản phẩm
                                                                form.setFieldValue(
                                                                    [
                                                                        "danh_sach_san_pham",
                                                                        name,
                                                                        "don_vi_tinh_id",
                                                                    ],
                                                                    undefined
                                                                );

                                                                // Reset giá nhập và tổng tiền
                                                                form.setFieldValue(
                                                                    [
                                                                        "danh_sach_san_pham",
                                                                        name,
                                                                        "so_luong_nhap",
                                                                    ],
                                                                    undefined
                                                                );
                                                                form.setFieldValue(
                                                                    [
                                                                        "danh_sach_san_pham",
                                                                        name,
                                                                        "gia_nhap",
                                                                    ],
                                                                    undefined
                                                                );
                                                                form.setFieldValue(
                                                                    [
                                                                        "danh_sach_san_pham",
                                                                        name,
                                                                        "tong_tien",
                                                                    ],
                                                                    undefined
                                                                );

                                                                // Update selected products state
                                                                setSelectedProducts(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [name]: value,
                                                                    })
                                                                );

                                                                // Gọi API để lấy thông tin chi tiết sản phẩm
                                                                if (value) {
                                                                    fetchProductDetail(
                                                                        value,
                                                                        name
                                                                    );
                                                                }
                                                            }}
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
                                                                `/options-by-san-pham/${selectedProducts[name]}`
                                                            }
                                                            placeholder="Chọn đơn vị tính"
                                                            showSearch
                                                            disabled={
                                                                !selectedProducts[
                                                                    name
                                                                ]
                                                            }
                                                            key={
                                                                selectedProducts[
                                                                    name
                                                                ] ||
                                                                "no-product"
                                                            }
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "ngay_san_xuat",
                                                        ]}
                                                    >
                                                        <DatePicker
                                                            placeholder="Ngày sản xuất"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                            format="DD/MM/YYYY"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "han_su_dung",
                                                        ]}
                                                    >
                                                        <DatePicker
                                                            placeholder="Hạn sử dụng"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                            format="DD/MM/YYYY"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "so_luong_nhap",
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
                                                            placeholder="Số lượng"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "gia_nhap",
                                                        ]}
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
                                                            formatter={
                                                                formatter
                                                            }
                                                            parser={parser}
                                                            addonAfter="đ"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "chiet_khau",
                                                        ]}
                                                        initialValue={0}
                                                    >
                                                        <InputNumber
                                                            min={0}
                                                            placeholder="Chiết khấu"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                            formatter={
                                                                formatter
                                                            }
                                                            parser={parser}
                                                            max={100}
                                                            addonAfter="%"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "tong_tien",
                                                        ]}
                                                        dependencies={[
                                                            [
                                                                name,
                                                                "so_luong_nhap",
                                                            ],
                                                            [name, "gia_nhap"],
                                                            [
                                                                name,
                                                                "chiet_khau",
                                                            ],
                                                        ]}
                                                    >
                                                        <InputNumber
                                                            placeholder="Tổng tiền"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                            formatter={
                                                                formatter
                                                            }
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
                                                        onClick={() =>
                                                            remove(name)
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        )
                                    )}

                                    <Row>
                                        <Col span={24}>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                                disabled={!infoNhaCungCap}
                                            >
                                                Thêm sản phẩm
                                            </Button>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </Form.List>
                    </div>
                </Card>
            </Col>
            <Col span={5} xs={25} sm={12} md={5} lg={5} xl={5}>
                <Typography.Title level={5}>Tổng tiền hàng</Typography.Title>
                <Typography.Text style={{ fontSize: 20 }}>
                    {formatter(tongTienHang) || 0} đ
                </Typography.Text>
            </Col>
            <Col span={4} xs={24} sm={12} md={4} lg={4} xl={4}>
                <Form.Item
                    name="chi_phi_nhap_hang"
                    label="Chi phí nhập hàng"
                    rules={[
                        {
                            required: true,
                            message: "Chi phí nhập hàng không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <InputNumber
                        min={0}
                        placeholder="Chi phí nhập hàng"
                        style={{ width: "100%" }}
                        addonAfter="đ"
                        formatter={formatter}
                        parser={parser}
                    />
                </Form.Item>
            </Col>
            <Col span={4} xs={24} sm={12} md={4} lg={4} xl={4}>
                <Form.Item
                    name="giam_gia_nhap_hang"
                    label="Giảm giá nhập hàng"
                    rules={[
                        {
                            required: true,
                            message: "Giảm giá nhập hàng không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <InputNumber
                        min={0}
                        placeholder="Giảm giá nhập hàng"
                        style={{ width: "100%" }}
                        addonAfter="đ"
                        formatter={formatter}
                        parser={parser}
                    />
                </Form.Item>
            </Col>
            <Col span={4} xs={24} sm={12} md={4} lg={4} xl={4}>
                <Form.Item
                    name="thue_vat"
                    label="Thuế VAT"
                    rules={[
                        {
                            required: true,
                            message: "Thuế VAT không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <InputNumber
                        min={0}
                        placeholder="Thuế VAT"
                        style={{ width: "100%" }}
                        addonAfter="%"
                        max={100}
                    />
                </Form.Item>
            </Col>
            <Col
                span={5}
                xs={25}
                sm={12}
                md={5}
                lg={5}
                xl={5}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                }}
            >
                <Typography.Title level={5}>
                    Tổng tiền thanh toán
                </Typography.Title>
                <Typography.Text style={{ fontSize: 20 }}>
                    {formatter(tongTienThanhToan) || 0} đ
                </Typography.Text>
            </Col>
            <Col span={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea placeholder="Ghi chú" />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default React.memo(FormNhapTuNhaCungCap);
