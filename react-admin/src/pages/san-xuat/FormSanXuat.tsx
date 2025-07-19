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
} from "antd";
import { createFilterQuery, formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";
import dayjs from "dayjs";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { generateMaPhieu } from "../../helpers/funcHelper";
import DanhSachSanPham from "./components/DanhSachSanPham";
import { getDataById, getDataSelect } from "../../services/getData.api";
import { useCallback, useEffect, useState, useMemo } from "react";

const FormSanXuat = ({
    form,
    isDetail = false,
}: {
    form: FormInstance;
    isDetail?: boolean;
}) => {
    const sanPhamId = Form.useWatch("san_pham_id", form);
    const donViTinhId = Form.useWatch("don_vi_tinh_id", form);
    const chiTietCongThucs = Form.useWatch("chi_tiet_cong_thucs", form);
    const giaCost = Form.useWatch("gia_cost", form) || 0;
    const chiPhiKhac = Form.useWatch("chi_phi_khac", form) || 0;
    const soLuongSanXuat = Form.useWatch("so_luong", form) || 0;
    const loiNhuan = Form.useWatch("loi_nhuan", form) || 0;
    const giaThanhSanXuat = Form.useWatch("gia_thanh_san_xuat", form) || 0;

    // Memoize filter object để tránh re-render không cần thiết
    const sanPhamFilter = useMemo(
        () => createFilterQuery(0, "loai_san_pham", "equal", "SP_SAN_XUAT"),
        []
    );

    const fetchInfoSanPham = useCallback(async () => {
        const res = await getDataById(sanPhamId, API_ROUTE_CONFIG.SAN_PHAM);
        form.setFieldsValue({
            loi_nhuan: +res.muc_loi_nhuan,
        });
    }, [sanPhamId]);

    const fetchInfoCongThucSanXuat = useCallback(async () => {
        const res = await getDataSelect(
            API_ROUTE_CONFIG.CONG_THUC_SAN_XUAT +
                "/get-by-san-pham-id-and-don-vi-tinh-id",
            {
                san_pham_id: sanPhamId,
                don_vi_tinh_id: donViTinhId,
            }
        );

        if (res) {
            form.setFieldsValue({
                chi_tiet_cong_thucs: res.chi_tiet_cong_thucs,
            });
        }
    }, [sanPhamId, donViTinhId]);

    useEffect(() => {
        if (sanPhamId) {
            fetchInfoSanPham();
        }
        if (sanPhamId && donViTinhId) {
            fetchInfoCongThucSanXuat();
        }
    }, [sanPhamId, donViTinhId]);

    useEffect(() => {
        if (chiTietCongThucs) {
            form.setFieldsValue({
                gia_cost: chiTietCongThucs.reduce(
                    (
                        acc: number,
                        curr: {
                            san_pham: { gia_nhap_mac_dinh: number };
                            so_luong_thuc_te: number;
                        }
                    ) =>
                        acc +
                        curr.san_pham.gia_nhap_mac_dinh * curr.so_luong_thuc_te,
                    0
                ),
            });
        }
    }, [chiTietCongThucs, form]);

    // Tính giá thành sản xuất
    useEffect(() => {
        if (giaCost && soLuongSanXuat && soLuongSanXuat > 0) {
            const giaThanhMoi =
                Math.ceil((giaCost + chiPhiKhac) / soLuongSanXuat / 1000) *
                1000;
            form.setFieldsValue({
                gia_thanh_san_xuat: giaThanhMoi,
            });
        }
    }, [giaCost, chiPhiKhac, soLuongSanXuat, form]);

    // Tính giá bán đề xuất
    useEffect(() => {
        if (giaThanhSanXuat && loiNhuan && loiNhuan > 0) {
            const giaBanMoi =
                Math.ceil((giaThanhSanXuat * (1 + loiNhuan / 100)) / 1000) *
                1000;
            form.setFieldsValue({
                gia_ban_de_xuat: giaBanMoi,
            });
        }
    }, [giaThanhSanXuat, loiNhuan, form]);

    return (
        <Row gutter={[10, 10]}>
            <Col span={8} xs={24} md={24} lg={8}>
                <Form.Item
                    name="ma_lo_san_xuat"
                    label="Mã lô sản xuất"
                    rules={[
                        {
                            required: true,
                            message: "Mã lô sản xuất không được bỏ trống!",
                        },
                    ]}
                    initialValue={generateMaPhieu("SX")}
                >
                    <Input placeholder="Nhập mã" disabled={isDetail} />
                </Form.Item>
            </Col>
            <Col span={16} xs={24} md={24} lg={16}>
                <SelectFormApi
                    name="san_pham_id"
                    label="Sản phẩm"
                    path={API_ROUTE_CONFIG.SAN_PHAM + "/options"}
                    placeholder="Chọn sản phẩm"
                    filter={sanPhamFilter}
                    rules={[
                        {
                            required: true,
                            message: "Sản phẩm không được bỏ trống!",
                        },
                    ]}
                    disabled={isDetail}
                    onChange={(value) => {
                        if (value) {
                            form.setFieldsValue({
                                don_vi_tinh_id: undefined,
                                chi_tiet_cong_thucs: [],
                            });
                        }
                    }}
                />
            </Col>
            <Col span={8} xs={24} md={24} lg={8}>
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
                    disabled={isDetail}
                />
            </Col>
            <Col span={8} xs={24} md={24} lg={8}>
                <Form.Item
                    name="so_luong"
                    label="Số lượng cần sản xuất"
                    rules={[
                        {
                            required: true,
                            message: "Số lượng không được bỏ trống!",
                        },
                        {
                            type: "number",
                            min: 1,
                            message: "Số lượng phải lớn hơn 0!",
                        },
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập số lượng cần sản xuất"
                        style={{ width: "100%" }}
                        min={1}
                        max={1000000}
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} md={24} lg={8}>
                <Form.Item
                    name="loi_nhuan"
                    label="Lợi nhuận cho 1 sản phẩm"
                    rules={[
                        {
                            required: true,
                            message: "Lợi nhuận không được bỏ trống!",
                        },
                        {
                            type: "number",
                            min: 1,
                            message: "Lợi nhuận phải lớn hơn 0!",
                        },
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập lợi nhuận cho 1 sản phẩm"
                        style={{ width: "100%" }}
                        addonAfter="%"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} md={24} lg={8}>
                <Form.Item name="gia_cost" label="Giá cost" initialValue={0}>
                    <InputNumber
                        style={{ width: "100%" }}
                        addonAfter="đ"
                        disabled
                        formatter={formatter}
                        parser={parser}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} md={24} lg={8}>
                <Form.Item
                    name="chi_phi_khac"
                    label="Chi phí khác"
                    rules={[
                        {
                            required: true,
                            message: "Chi phí khác không được bỏ trống!",
                        },
                        {
                            type: "number",
                            min: 0,
                            message: "Chi phí khác phải lớn hơn hoặc bằng 0!",
                        },
                    ]}
                    initialValue={0}
                >
                    <InputNumber
                        placeholder="Nhập chi phí khác"
                        style={{ width: "100%" }}
                        addonAfter="đ"
                        formatter={formatter}
                        parser={parser}
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} md={24} lg={8}>
                <Form.Item
                    name="gia_thanh_san_xuat"
                    label="Giá thành sản xuất cho 1 sản phẩm"
                    initialValue={0}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        addonAfter="đ"
                        disabled
                        formatter={formatter}
                        parser={parser}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} md={24} lg={8}>
                <Form.Item
                    name="gia_ban_de_xuat"
                    label="Giá bán đề xuất cho 1 sản phẩm"
                    initialValue={0}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        addonAfter="đ"
                        disabled
                        formatter={formatter}
                        parser={parser}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                <DanhSachSanPham form={form} isDetail={isDetail} />
            </Col>
        </Row>
    );
};

export default FormSanXuat;
