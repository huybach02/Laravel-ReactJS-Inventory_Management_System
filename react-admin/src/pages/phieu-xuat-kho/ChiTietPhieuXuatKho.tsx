/* eslint-disable @typescript-eslint/no-explicit-any */
import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Button, Form, Modal } from "antd";
import { getDataById } from "../../services/getData.api";
import FormXuatTheoDonHang from "./FormXuatTheoDonHang";
import dayjs from "dayjs";

const ChiTietPhieuXuatKho = ({
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
            data.chi_tiet_phieu_xuat_khos &&
            Array.isArray(data.chi_tiet_phieu_xuat_khos)
        ) {
            danhSachSanPham = data.chi_tiet_phieu_xuat_khos.map((item: any) => {
                return {
                    so_luong: item.so_luong,
                    ma_lo_san_pham: item.ma_lo_san_pham,
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
                style={{ marginRight: 5 }}
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
                    id={`formChiTietPhieuXuatKho-${id}`}
                    form={form}
                    layout="vertical"
                >
                    <FormXuatTheoDonHang form={form} isDetail />
                </Form>
            </Modal>
        </>
    );
};

export default ChiTietPhieuXuatKho;
