/* eslint-disable @typescript-eslint/no-explicit-any */
import { Col, DatePicker, Form, Input, Row, type FormInstance } from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { generateMaPhieu } from "../../helpers/funcHelper";
import dayjs from "dayjs";
import SelectFormApi from "../../components/select/SelectFormApi";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { useEffect, useState } from "react";
import { getDataById } from "../../services/getData.api";
import DanhSachSanPham from "./components/DanhSachSanPham";

const FormXuatNguyenLieu = ({
    form,
    isDetail = false,
}: {
    form: FormInstance;
    isEditing?: boolean;
    isDetail?: boolean;
}) => {
    const { user } = useSelector((state: RootState) => state.auth);

    const sanXuatId = Form.useWatch("san_xuat_id", form);

    const [sanXuat, setSanXuat] = useState<any>(null);

    useEffect(() => {
        if (sanXuatId) {
            const fetchSanPham = async () => {
                const res = await getDataById(
                    sanXuatId,
                    API_ROUTE_CONFIG.SAN_XUAT
                );
                setSanXuat(res);
            };
            fetchSanPham();
        } else {
            setSanXuat(null);
        }
    }, [sanXuatId]);

    useEffect(() => {
        if (sanXuat) {
            let danhSachSanPham: any[] = [];
            if (sanXuat && Array.isArray(sanXuat.chi_tiet_san_xuat)) {
                const currentValues =
                    form.getFieldValue("danh_sach_san_pham") || [];

                danhSachSanPham = sanXuat.chi_tiet_san_xuat.map(
                    (item: any, index: number) => {
                        const currentItem = currentValues[index] || {};

                        return {
                            san_pham_id: +item.san_pham_id,
                            don_vi_tinh_id: +item.don_vi_tinh_id,
                            ngay_san_xuat: item.ngay_san_xuat
                                ? dayjs(item.ngay_san_xuat, "YYYY-MM-DD")
                                : undefined,
                            han_su_dung: item.ngay_het_han
                                ? dayjs(item.ngay_het_han, "YYYY-MM-DD")
                                : undefined,
                            gia_nhap: item.gia_ban,
                            chiet_khau: item.chiet_khau || 0,
                            tong_tien: item.tong_tien,
                            so_luong_can_mua:
                                item.so_luong_thuc_te -
                                    item.so_luong_xuat_kho || 0,
                            ma_lo_san_pham: currentItem.ma_lo_san_pham,
                            so_luong: currentItem.so_luong,
                        };
                    }
                );
            }

            form.setFieldsValue({
                danh_sach_san_pham: danhSachSanPham,
            });
        }
    }, [sanXuat, form]);

    return (
        <Row gutter={[10, 10]}>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="ma_phieu_xuat_kho"
                    label="Mã phiếu xuất kho"
                    rules={[
                        {
                            required: true,
                            message: "Mã phiếu xuất kho không được bỏ trống!",
                        },
                    ]}
                    initialValue={generateMaPhieu("PXK")}
                >
                    <Input
                        placeholder="Nhập mã phiếu xuất kho"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form.Item
                    name="ngay_xuat_kho"
                    label="Ngày xuất kho"
                    rules={[
                        {
                            required: true,
                            message: "Ngày xuất không được bỏ trống!",
                        },
                    ]}
                    initialValue={dayjs()}
                >
                    <DatePicker
                        placeholder="Nhập ngày xuất"
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
            <Col span={24}>
                <SelectFormApi
                    name="san_xuat_id"
                    label="Sản xuất"
                    path={API_ROUTE_CONFIG.SAN_XUAT + "/options"}
                    placeholder="Chọn sản xuất"
                    rules={[
                        {
                            required: true,
                            message: "Sản xuất không được bỏ trống!",
                        },
                    ]}
                    onChange={(value) => {
                        if (value) {
                            form.setFieldValue("danh_sach_san_pham", []);
                        } else {
                            form.setFieldValue("san_xuat_id", undefined);
                            setSanXuat(null);
                        }
                    }}
                    disabled={isDetail}
                />
            </Col>
            <Col span={24} xs={24} sm={24} md={24} lg={24} xl={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea
                        placeholder="Nhập ghi chú"
                        disabled={isDetail}
                        rows={2}
                    />
                </Form.Item>
            </Col>
            <Col span={24} style={{ marginBottom: 20 }}>
                <DanhSachSanPham form={form} isDetail={isDetail} />
            </Col>
        </Row>
    );
};

export default FormXuatNguyenLieu;
