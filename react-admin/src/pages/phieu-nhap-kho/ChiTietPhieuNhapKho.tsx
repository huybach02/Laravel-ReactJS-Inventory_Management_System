/* eslint-disable @typescript-eslint/no-explicit-any */
import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Button, Form, Modal } from "antd";
import { getDataById } from "../../services/getData.api";
import dayjs from "dayjs";
import FormNhapTuNhaCungCap from "./FormNhapTuNhaCungCap";

const ChiTietPhieuNhapKho = ({
    path,
    id,
    title,
}: {
    path: string;
    id: number;
    title: string;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    const showModal = async () => {
        setIsModalOpen(true);
        setIsLoading(true);
        const data = await getDataById(id, path);
        Object.keys(data).forEach((key) => {
            if (data[key]) {
                if (
                    /ngay_|_ngay/.test(key) ||
                    /ngay/.test(key) ||
                    /thoi_gian|_thoi/.test(key) ||
                    /birthday/.test(key)
                ) {
                    data[key] = dayjs(data[key], "YYYY-MM-DD");
                }
            }
        });

        // Transform chi_tiet_phieu_nhap_khos thành format cho FormList
        let danhSachSanPham: any[] = [];
        if (
            data.chi_tiet_phieu_nhap_khos &&
            Array.isArray(data.chi_tiet_phieu_nhap_khos)
        ) {
            danhSachSanPham = data.chi_tiet_phieu_nhap_khos.map((item: any) => {
                return {
                    san_pham_id: +item.san_pham_id,
                    don_vi_tinh_id: +item.don_vi_tinh_id,
                    ngay_san_xuat: item.ngay_san_xuat
                        ? dayjs(item.ngay_san_xuat, "YYYY-MM-DD")
                        : undefined,
                    ngay_het_han: item.ngay_het_han
                        ? dayjs(item.ngay_het_han, "YYYY-MM-DD")
                        : undefined,
                    so_luong_nhap: item.so_luong_nhap,
                    gia_nhap: item.gia_nhap,
                    chiet_khau: item.chiet_khau || 0,
                    tong_tien:
                        item.tong_tien_nhap ||
                        item.so_luong_nhap *
                            item.gia_nhap *
                            (1 - (item.chiet_khau || 0) / 100),
                };
            });
        }

        form.setFieldsValue({
            ...data,
            danh_sach_san_pham: danhSachSanPham,
        });
        setIsLoading(false);
    };

    const handleCancel = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    return (
        <>
            <Button
                onClick={showModal}
                type="primary"
                size="small"
                title={`Chi tiết ${title}`}
                icon={<EyeOutlined />}
                style={{
                    marginRight: 5,
                }}
            />
            <Modal
                title={`Chi tiết ${title}`}
                open={isModalOpen}
                onCancel={handleCancel}
                maskClosable={false}
                loading={isLoading}
                centered
                width={1800}
                footer={null}
            >
                <Form
                    id={`formChiTietPhieuNhapKho-${id}`}
                    form={form}
                    layout="vertical"
                >
                    <FormNhapTuNhaCungCap form={form} isDetail={true} />
                </Form>
            </Modal>
        </>
    );
};

export default ChiTietPhieuNhapKho;
