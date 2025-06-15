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
} from "antd";
import { formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";
import { generateMaPhieu } from "../../helpers/funcHelper";
import {
    OPTIONS_LOAI_PHIEU_CHI,
    OPTIONS_PHUONG_THUC_THANH_TOAN,
} from "../../utils/constant";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import dayjs from "dayjs";
import { getDataById } from "../../services/getData.api";
import { useEffect, useState } from "react";

const FormPhieuChi = ({ form }: { form: FormInstance }) => {
    const nhaCungCapId = Form.useWatch("nha_cung_cap_id", form);
    const loaiPhieuChi = Form.useWatch("loai_phieu_chi", form);
    const phuongThucThanhToan = Form.useWatch("phuong_thuc_thanh_toan", form);
    const phieuNhapKhoId = Form.useWatch("phieu_nhap_kho_id", form);

    const fetchInfoPhieuNhapKho = async () => {
        const response = await getDataById(
            phieuNhapKhoId,
            API_ROUTE_CONFIG.PHIEU_NHAP_KHO
        );
        form.setFieldValue(
            "so_tien_can_thanh_toan",
            Number(response?.tong_tien) - Number(response?.da_thanh_toan)
        );
    };

    const fetchTongTienCanThanhToanTheoNhaCungCap = async () => {
        const response = await getDataById(
            nhaCungCapId,
            API_ROUTE_CONFIG.PHIEU_NHAP_KHO +
                "/tong-tien-can-thanh-toan-theo-nha-cung-cap"
        );
        form.setFieldValue("so_tien_can_thanh_toan", response);
    };

    useEffect(() => {
        if (phieuNhapKhoId && loaiPhieuChi === 1) {
            fetchInfoPhieuNhapKho();
        }
        if (nhaCungCapId && loaiPhieuChi === 2) {
            fetchTongTienCanThanhToanTheoNhaCungCap();
        }
    }, [phieuNhapKhoId, loaiPhieuChi, nhaCungCapId]);

    return (
        <Row gutter={[10, 10]}>
            <Col span={12}>
                <Form.Item
                    name="ma_phieu_chi"
                    label="Mã phiếu chi"
                    rules={[
                        {
                            required: true,
                            message: "Mã phiếu chi không được bỏ trống!",
                        },
                    ]}
                    initialValue={generateMaPhieu("CHI")}
                >
                    <Input placeholder="Nhập mã phiếu chi" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="ngay_chi"
                    label="Ngày chi"
                    rules={[
                        {
                            required: true,
                            message: "Ngày chi không được bỏ trống!",
                        },
                    ]}
                    initialValue={dayjs()}
                >
                    <DatePicker
                        placeholder="Chọn ngày chi"
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item
                    name="loai_phieu_chi"
                    label="Loại phiếu chi"
                    rules={[
                        {
                            required: true,
                            message: "Loại phiếu chi không được bỏ trống!",
                        },
                    ]}
                >
                    <Select
                        options={OPTIONS_LOAI_PHIEU_CHI}
                        placeholder="Chọn loại phiếu chi"
                        onChange={(value) => {
                            form.setFieldValue("nha_cung_cap_id", undefined);
                            form.setFieldValue("phieu_nhap_kho_id", undefined);
                            form.setFieldValue("so_tien_can_thanh_toan", 0);
                        }}
                    />
                </Form.Item>
            </Col>
            {(loaiPhieuChi === 1 || loaiPhieuChi === 2) && (
                <Col span={12}>
                    <SelectFormApi
                        name="nha_cung_cap_id"
                        label="Nhà cung cấp"
                        path={API_ROUTE_CONFIG.NHA_CUNG_CAP + "/options"}
                        placeholder="Chọn nhà cung cấp"
                        rules={[
                            {
                                required:
                                    loaiPhieuChi === 1 || loaiPhieuChi === 2,
                                message: "Nhà cung cấp không được bỏ trống!",
                            },
                        ]}
                        onChange={() => {
                            // Reset phiếu nhập kho khi thay đổi nhà cung cấp
                            form.setFieldValue("phieu_nhap_kho_id", undefined);
                            form.setFieldValue("so_tien_can_thanh_toan", 0);
                        }}
                    />
                </Col>
            )}
            {loaiPhieuChi === 1 && (
                <Col span={12}>
                    <SelectFormApi
                        name="phieu_nhap_kho_id"
                        label="Phiếu nhập kho"
                        path={
                            nhaCungCapId
                                ? API_ROUTE_CONFIG.PHIEU_NHAP_KHO +
                                  "/options-by-nha-cung-cap/" +
                                  nhaCungCapId
                                : ""
                        }
                        reload={nhaCungCapId}
                        placeholder="Chọn phiếu nhập kho"
                        rules={[
                            {
                                required: loaiPhieuChi === 1,
                                message: "Phiếu nhập kho không được bỏ trống!",
                            },
                        ]}
                    />
                </Col>
            )}
            {(loaiPhieuChi === 1 || loaiPhieuChi === 2) && (
                <Col span={12}>
                    <Form.Item
                        name="so_tien_can_thanh_toan"
                        label="Số tiền cần thanh toán"
                    >
                        <InputNumber
                            placeholder="Nhập số tiền cần thanh toán"
                            style={{ width: "100%" }}
                            formatter={formatter}
                            parser={parser}
                            addonAfter="đ"
                            disabled
                        />
                    </Form.Item>
                </Col>
            )}
            <Col span={12}>
                <Form.Item
                    name="so_tien"
                    label="Số tiền chi"
                    rules={[
                        {
                            required: true,
                            message: "Số tiền chi không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <InputNumber
                        placeholder="Nhập số tiền chi"
                        style={{ width: "100%" }}
                        formatter={formatter}
                        parser={parser}
                        addonAfter="đ"
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="nguoi_nhan"
                    label="Người nhận"
                    rules={[
                        {
                            required: true,
                            message: "Người nhận không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập người nhận" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="phuong_thuc_thanh_toan"
                    label="Phương thức thanh toán"
                    rules={[
                        {
                            required: true,
                            message:
                                "Phương thức thanh toán không được bỏ trống!",
                        },
                    ]}
                >
                    <Select
                        options={OPTIONS_PHUONG_THUC_THANH_TOAN}
                        placeholder="Chọn phương thức thanh toán"
                    />
                </Form.Item>
            </Col>
            {phuongThucThanhToan === 2 && (
                <Col span={12}>
                    <Form.Item
                        name="so_tai_khoan"
                        label="Số tài khoản"
                        rules={[
                            {
                                required: phuongThucThanhToan === 2,
                                message: "Số tài khoản không được bỏ trống!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập số tài khoản" />
                    </Form.Item>
                </Col>
            )}
            {phuongThucThanhToan === 2 && (
                <Col span={12}>
                    <Form.Item
                        name="ngan_hang"
                        label="Ngân hàng"
                        rules={[
                            {
                                required: phuongThucThanhToan === 2,
                                message: "Ngân hàng không được bỏ trống!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập ngân hàng" />
                    </Form.Item>
                </Col>
            )}
            {loaiPhieuChi === 3 && (
                <Col span={24}>
                    <Form.Item
                        name="ly_do_chi"
                        label="Lý do chi"
                        rules={[
                            {
                                required: loaiPhieuChi === 3,
                                message: "Lý do chi không được bỏ trống!",
                            },
                        ]}
                    >
                        <Input.TextArea placeholder="Nhập lý do chi" rows={2} />
                    </Form.Item>
                </Col>
            )}
            <Col span={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea placeholder="Nhập ghi chú" rows={2} />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default FormPhieuChi;
