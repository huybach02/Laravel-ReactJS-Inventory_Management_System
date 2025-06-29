/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Row,
    Col,
    Form,
    Input,
    InputNumber,
    type FormInstance,
    DatePicker,
    Typography,
} from "antd";
import { formatter, parser } from "../../utils/utils";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { generateMaPhieu } from "../../helpers/funcHelper";
import { phonePattern } from "../../utils/patterns";
import ThongTinNhaCungCap from "./components/ThongTinNhaCungCap";
import DanhSachSanPham from "./components/DanhSachSanPham";

const FormNhapTuNhaCungCap = ({
    form,
    isEditing = false,
    isDetail = false,
}: {
    form: FormInstance;
    isEditing?: boolean;
    isDetail?: boolean;
}) => {
    const { user } = useSelector((state: RootState) => state.auth);

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

    // Tính toán tổng tiền cho từng sản phẩm với useMemo
    const calculatedProducts = useMemo(() => {
        if (!danhSachSanPham || !Array.isArray(danhSachSanPham)) {
            return [];
        }

        return danhSachSanPham.map((item: any, index: number) => {
            if (item && item.so_luong_nhap && item.gia_nhap) {
                const soLuong = Number(item.so_luong_nhap) || 0;
                const giaNhap = Number(item.gia_nhap) || 0;
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
                    <Input
                        placeholder="Nhập mã phiếu nhập kho"
                        disabled={isDetail}
                    />
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
                        disabled={isDetail}
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
                    <Input
                        placeholder="Nhập số hóa đơn nhà cung cấp"
                        disabled={isDetail}
                    />
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
                    <Input
                        placeholder="Nhập người giao hàng"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="so_dien_thoai_nguoi_giao_hang"
                    label="Số điện thoại người giao hàng"
                    rules={[
                        {
                            pattern: phonePattern,
                            message:
                                "Số điện thoại người giao hàng không hợp lệ!",
                        },
                    ]}
                >
                    <Input
                        placeholder="Nhập số điện thoại người giao hàng"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                <ThongTinNhaCungCap form={form} isDetail={isDetail} />
            </Col>
            <Col span={24} style={{ marginBottom: 20 }}>
                <DanhSachSanPham form={form} isDetail={isDetail} />
            </Col>
            <Col span={5} xs={24} sm={12} md={5} lg={5} xl={5}>
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
                        disabled={isEditing || isDetail}
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
                        disabled={isEditing || isDetail}
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
                        disabled={isEditing || isDetail}
                    />
                </Form.Item>
            </Col>
            <Col
                span={24}
                xs={24}
                sm={24}
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
                    <Input.TextArea placeholder="Ghi chú" disabled={isDetail} />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default React.memo(FormNhapTuNhaCungCap);
