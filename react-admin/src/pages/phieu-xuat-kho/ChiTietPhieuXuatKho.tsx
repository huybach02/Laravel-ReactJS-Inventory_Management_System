/* eslint-disable @typescript-eslint/no-explicit-any */
import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Button, Form, Modal, Tabs } from "antd";
import { getDataById } from "../../services/getData.api";
import FormXuatTheoDonHang from "./FormXuatTheoDonHang";
import dayjs from "dayjs";
import FormXuatNguyenLieu from "./FormXuatNguyenLieu";
import FormXuatHuy from "./FormXuatHuy";

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
    const [tab, setTab] = useState(1);

    const [formXuatTheoDonHang] = Form.useForm();
    const [formXuatHuy] = Form.useForm();
    const [formXuatNguyenLieu] = Form.useForm();

    const showModal = async () => {
        setIsModalOpen(true);
        setIsLoading(true);
        const data = await getDataById(id, path);
        setTab(data.loai_phieu_xuat.toString());
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
            Array.isArray(data.chi_tiet_phieu_xuat_khos) &&
            data.chi_tiet_phieu_xuat_khos.length > 0
        ) {
            danhSachSanPham = data.chi_tiet_phieu_xuat_khos.map((item: any) => {
                return {
                    so_luong: item.so_luong,
                    ma_lo_san_pham: item.ma_lo_san_pham,
                    san_pham_id: item.san_pham_id,
                    don_vi_tinh_id: item.don_vi_tinh_id,
                };
            });
        }

        switch (data.loai_phieu_xuat) {
            case 1:
                formXuatTheoDonHang.setFieldsValue({
                    ...data,
                    danh_sach_san_pham: danhSachSanPham || [],
                });
                break;
            case 2:
                formXuatHuy.setFieldsValue({
                    ...data,
                    danh_sach_san_pham: danhSachSanPham || [],
                });
                break;
            case 3:
                formXuatNguyenLieu.setFieldsValue({
                    ...data,
                    danh_sach_san_pham: danhSachSanPham || [],
                });
                break;
        }
        setIsLoading(false);
    };

    const handleCancel = () => {
        formXuatTheoDonHang.resetFields();
        formXuatHuy.resetFields();
        formXuatNguyenLieu.resetFields();
        setIsModalOpen(false);
    };

    const items = [
        {
            label: "Xuất theo đơn hàng",
            key: "1",
            disabled: Number(tab) === 2 || Number(tab) === 3,
            children: (
                <Form
                    id={"formPhieuXuatKho" + "1"}
                    form={formXuatTheoDonHang}
                    layout="vertical"
                >
                    <FormXuatTheoDonHang form={formXuatTheoDonHang} isDetail />
                </Form>
            ),
        },
        {
            label: "Xuất hủy",
            key: "2",
            disabled: Number(tab) === 1 || Number(tab) === 3,
            children: (
                <Form
                    id={"formPhieuXuatKho" + "2"}
                    form={formXuatHuy}
                    layout="vertical"
                >
                    <FormXuatHuy form={formXuatHuy} isDetail />
                </Form>
            ),
        },
        {
            label: "Xuất nguyên liệu sản xuất",
            key: "3",
            disabled: Number(tab) === 1 || Number(tab) === 2,
            children: (
                <Form
                    id={"formPhieuXuatKho" + "3"}
                    form={formXuatNguyenLieu}
                    layout="vertical"
                >
                    <FormXuatNguyenLieu form={formXuatNguyenLieu} isDetail />
                </Form>
            ),
        },
    ];

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
                <Tabs type="card" items={items} activeKey={tab.toString()} />
            </Modal>
        </>
    );
};

export default ChiTietPhieuXuatKho;
