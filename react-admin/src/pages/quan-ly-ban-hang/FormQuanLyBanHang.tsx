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
    Typography,
} from "antd";
import { formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";
import { generateMaPhieu } from "../../helpers/funcHelper";
import dayjs from "dayjs";
import {
    OPTIONS_LOAI_KHACH_HANG,
    OPTIONS_LOAI_THANH_TOAN,
} from "../../utils/constant";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import DanhSachSanPham from "./components/DanhSachSanPham";
import { useCallback, useEffect, useMemo, useState } from "react";
import { phoneNumberVNPattern } from "../../utils/patterns";

const FormQuanLyBanHang = ({
    form,
    isDetail = false,
}: {
    form: FormInstance;
    isDetail?: boolean;
}) => {
    const loaiKhachHang = Form.useWatch("loai_khach_hang", form);
    const loaiThanhToan = Form.useWatch("loai_thanh_toan", form);

    const [tongTienHang, setTongTienHang] = useState<number>(0);

    // Theo dõi thay đổi trong danh sách sản phẩm với debounce
    const danhSachSanPham = Form.useWatch("danh_sach_san_pham", form) || [];

    // Theo dõi thay đổi các field tính toán
    const thueVat = Form.useWatch("thue_vat", form) || 0;
    const chiPhi = Form.useWatch("chi_phi", form) || 0;
    const giamGia = Form.useWatch("giam_gia", form) || 0;

    // Tính toán tổng tiền với useMemo để tránh tính toán lại không cần thiết
    const tongTienThanhToan = useMemo(() => {
        const tongTienCoBan = tongTienHang + (chiPhi || 0) - (giamGia || 0);
        const tienThue = (tongTienCoBan * (thueVat || 0)) / 100;
        return tongTienCoBan + tienThue;
    }, [tongTienHang, chiPhi, giamGia, thueVat]);

    // Tính toán tổng tiền cho từng sản phẩm với useMemo
    const calculatedProducts = useMemo(() => {
        if (!danhSachSanPham || !Array.isArray(danhSachSanPham)) {
            return [];
        }

        return danhSachSanPham.map((item: any, index: number) => {
            if (item && item.so_luong && item.don_gia) {
                const soLuong = Number(item.so_luong) || 0;
                const giaNhap = Number(item.don_gia) || 0;
                const chietKhau = Number(item.chiet_khau) || 0;
                const tongTien = soLuong * giaNhap * (1 - chietKhau / 100);

                return { ...item, tongTien, index };
            }
            return { ...item, tongTien: 0, index };
        });
    }, [danhSachSanPham]);

    // Tính tổng tiền hàng từ calculated products
    const calculatedTongTienHang = useMemo(() => {
        return calculatedProducts.reduce((tong, item) => {
            return tong + (item.tongTien || 0);
        }, 0);
    }, [calculatedProducts]);

    // Update form values khi có thay đổi trong calculations
    const updateFormValues = useCallback(() => {
        calculatedProducts.forEach((item) => {
            const currentTongTien = form.getFieldValue([
                "danh_sach_san_pham",
                item.index,
                "tong_tien",
            ]);
            if (item.tongTien !== currentTongTien) {
                form.setFieldValue(
                    ["danh_sach_san_pham", item.index, "tong_tien"],
                    item.tongTien
                );
            }
        });
    }, [calculatedProducts, form]);

    // Effect để update form values với debounce nhẹ
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFormValues();
            setTongTienHang(calculatedTongTienHang);
        }, 50);

        return () => clearTimeout(timer);
    }, [updateFormValues, calculatedTongTienHang]);

    return (
        <Row gutter={[10, 10]}>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="ma_don_hang"
                    label="Mã đơn hàng"
                    rules={[
                        {
                            required: true,
                            message: "Mã đơn hàng không được bỏ trống!",
                        },
                    ]}
                    initialValue={generateMaPhieu("DH")}
                >
                    <Input placeholder="Nhập mã đơn hàng" disabled={isDetail} />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="ngay_tao_don_hang"
                    label="Ngày tạo đơn hàng"
                    rules={[
                        {
                            required: true,
                            message: "Ngày tạo đơn hàng không được bỏ trống!",
                        },
                    ]}
                    initialValue={dayjs()}
                >
                    <DatePicker
                        placeholder="Nhập ngày tạo đơn hàng"
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="loai_khach_hang"
                    label="Loại khách hàng"
                    rules={[
                        {
                            required: true,
                            message: "Loại khách hàng không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <Select
                        options={OPTIONS_LOAI_KHACH_HANG}
                        placeholder="Chọn loại khách hàng"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            {loaiKhachHang === OPTIONS_LOAI_KHACH_HANG[0].value && (
                <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                    <SelectFormApi
                        name="khach_hang_id"
                        label="Khách hàng"
                        path={API_ROUTE_CONFIG.KHACH_HANG + "/options"}
                        placeholder="Chọn khách hàng"
                        //filter={createFilterQuery(0, 'SELECT', 'equal', 0)}
                        rules={[
                            {
                                required:
                                    loaiKhachHang ===
                                    OPTIONS_LOAI_KHACH_HANG[0].value,
                                message: "Khách hàng không được bỏ trống!",
                            },
                        ]}
                        disabled={isDetail}
                    />
                </Col>
            )}
            {loaiKhachHang === OPTIONS_LOAI_KHACH_HANG[1].value && (
                <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                    <Form.Item
                        name="ten_khach_hang"
                        label="Tên khách hàng"
                        rules={[
                            {
                                required:
                                    loaiKhachHang ===
                                    OPTIONS_LOAI_KHACH_HANG[1].value,
                                message: "Tên khách hàng không được bỏ trống!",
                            },
                        ]}
                    >
                        <Input
                            placeholder="Nhập tên khách hàng"
                            disabled={isDetail}
                        />
                    </Form.Item>
                </Col>
            )}
            {loaiKhachHang === OPTIONS_LOAI_KHACH_HANG[1].value && (
                <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                    <Form.Item
                        name="so_dien_thoai"
                        label="Số điện thoại"
                        rules={[
                            {
                                required:
                                    loaiKhachHang ===
                                    OPTIONS_LOAI_KHACH_HANG[1].value,
                                message: "Số điện thoại không được bỏ trống!",
                            },
                            {
                                pattern: phoneNumberVNPattern,
                                message: "Số điện thoại không hợp lệ!",
                            },
                        ]}
                    >
                        <Input
                            placeholder="Nhập số điện thoại"
                            disabled={isDetail}
                        />
                    </Form.Item>
                </Col>
            )}
            <Col span={16} xs={24} sm={24} md={24} lg={16} xl={16}>
                <Form.Item
                    name="dia_chi_giao_hang"
                    label="Địa chỉ giao hàng"
                    rules={[
                        {
                            required: true,
                            message: "Địa chỉ giao hàng không được bỏ trống!",
                        },
                    ]}
                >
                    <Input
                        placeholder="Nhập địa chỉ giao hàng"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={24} style={{ marginBottom: 20 }}>
                <DanhSachSanPham form={form} isDetail={isDetail} />
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="giam_gia"
                    label="Giảm giá"
                    rules={[
                        {
                            required: true,
                            message: "Giảm giá không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <InputNumber
                        placeholder="Nhập giảm giá"
                        disabled={isDetail}
                        style={{ width: "100%" }}
                        addonAfter="đ"
                        formatter={formatter}
                        parser={parser}
                        min={0}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="chi_phi"
                    label="Chi phí"
                    rules={[
                        {
                            required: true,
                            message: "Chi phí không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <InputNumber
                        placeholder="Nhập chi phí"
                        disabled={isDetail}
                        style={{ width: "100%" }}
                        addonAfter="đ"
                        formatter={formatter}
                        parser={parser}
                        min={0}
                    />
                </Form.Item>
            </Col>
            <Col
                span={5}
                xs={24}
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
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="loai_thanh_toan"
                    label="Loại thanh toán"
                    rules={[
                        {
                            required: true,
                            message: "Loại thanh toán không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <Select
                        options={OPTIONS_LOAI_THANH_TOAN}
                        placeholder="Chọn loại thanh toán"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            {loaiThanhToan !== OPTIONS_LOAI_THANH_TOAN[0].value && (
                <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                    <Form.Item
                        name="so_tien_da_thanh_toan"
                        label="Số tiền đã thanh toán"
                        rules={[
                            {
                                required:
                                    loaiThanhToan !==
                                    OPTIONS_LOAI_THANH_TOAN[0].value,
                                message:
                                    "Số tiền đã thanh toán không được bỏ trống!",
                            },
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập số tiền đã thanh toán"
                            disabled={isDetail}
                            style={{ width: "100%" }}
                            addonAfter="đ"
                            formatter={formatter}
                            parser={parser}
                            min={0}
                        />
                    </Form.Item>
                </Col>
            )}
            <Col span={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea placeholder="Ghi chú" disabled={isDetail} />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default FormQuanLyBanHang;
