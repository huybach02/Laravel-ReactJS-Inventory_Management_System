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
import { createFilterQuery, formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";
import { generateMaPhieu } from "../../helpers/funcHelper";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import DanhSachSanPham from "./components/DanhSachSanPham";
import { useEffect, useState } from "react";
import { getDataById } from "../../services/getData.api";

const FormNhapSanXuat = ({
    form,
    isEditing = false,
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
        if (sanXuatId && !isEditing) {
            const fetchSanXuat = async () => {
                const res = await getDataById(
                    sanXuatId,
                    API_ROUTE_CONFIG.SAN_XUAT
                );
                setSanXuat(res);
            };
            fetchSanXuat();
        }
    }, [sanXuatId, isEditing]);

    useEffect(() => {
        if (sanXuat && !isEditing) {
            form.setFieldsValue({
                danh_sach_san_pham: [
                    {
                        san_pham_id: sanXuat.san_pham_id,
                        don_vi_tinh_id: sanXuat.don_vi_tinh_id,
                        so_luong_can_nhap:
                            sanXuat.so_luong - sanXuat.so_luong_nhap_kho,
                        gia_nhap: sanXuat.gia_thanh_san_xuat,
                    },
                ],
            });
        }
    }, [sanXuat, form, isEditing]);

    return (
        <Row gutter={[16, 16]}>
            <Col span={24}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="ma_phieu_nhap_kho"
                            label="Mã phiếu nhập kho"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Mã phiếu nhập kho không được bỏ trống!",
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
                    <Col span={12}>
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
                </Row>
            </Col>
            <Col span={24}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="nguoi_tao_phieu"
                            label="Người tạo phiếu"
                            initialValue={user?.name}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <SelectFormApi
                            name="san_xuat_id"
                            label="Sản xuất"
                            path={API_ROUTE_CONFIG.SAN_XUAT + "/options"}
                            filter={createFilterQuery(
                                0,
                                "trang_thai_hoan_thanh",
                                "equal",
                                2
                            )}
                            placeholder="Chọn sản xuất"
                            rules={[
                                {
                                    required: true,
                                    message: "Sản xuất không được bỏ trống!",
                                },
                            ]}
                            onChange={(value) => {
                                if (value) {
                                    form.setFieldValue(
                                        "danh_sach_san_pham",
                                        []
                                    );
                                } else {
                                    form.setFieldValue(
                                        "san_xuat_id",
                                        undefined
                                    );
                                }
                            }}
                            disabled={isDetail}
                        />
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <DanhSachSanPham
                    form={form}
                    isDetail={isDetail}
                    isNhapSanXuat={true}
                    isEditing={isEditing}
                />
            </Col>
            <Col span={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea placeholder="Ghi chú" disabled={isDetail} />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default FormNhapSanXuat;
