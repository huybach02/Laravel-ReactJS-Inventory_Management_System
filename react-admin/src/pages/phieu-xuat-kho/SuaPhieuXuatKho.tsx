/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Button, Form, Modal, Tabs } from "antd";
import { useDispatch } from "react-redux";
import { getDataById } from "../../services/getData.api";
import { setReload } from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";
import FormXuatTheoDonHang from "./FormXuatTheoDonHang";
import dayjs from "dayjs";
import FormXuatNguyenLieu from "./FormXuatNguyenLieu";
import FormXuatHuy from "./FormXuatHuy";

const SuaPhieuXuatKho = ({
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tab, setTab] = useState("1");

    const dispatch = useDispatch();

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

        // Transform chi_tiet_phieu_xuat_khos thành format cho FormList
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

    const onUpdate = async (values: any) => {
        setIsSubmitting(true);
        const closeModel = () => {
            handleCancel();
            dispatch(setReload());
        };
        await putData(
            path,
            id,
            {
                ...values,
                ngay_xuat_kho: dayjs(values.ngay_xuat_kho).format("YYYY-MM-DD"),
                loai_phieu_xuat: Number(tab),
            },
            closeModel
        );
        setIsSubmitting(false);
    };

    const items = [
        {
            label: "Xuất theo đơn hàng",
            key: "1",
            disabled: Number(tab) === 2 || Number(tab) === 3,
            children: (
                <Form
                    id={"formPhieuXuatKhoUpdate" + "1"}
                    form={formXuatTheoDonHang}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormXuatTheoDonHang form={formXuatTheoDonHang} />
                </Form>
            ),
        },
        {
            label: "Xuất hủy",
            key: "2",
            disabled: Number(tab) === 1 || Number(tab) === 3,
            children: (
                <Form
                    id={"formPhieuXuatKhoUpdate" + "2"}
                    form={formXuatHuy}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormXuatHuy form={formXuatHuy} />
                </Form>
            ),
        },
        {
            label: "Xuất nguyên liệu sản xuất",
            key: "3",
            disabled: Number(tab) === 1 || Number(tab) === 2,
            children: (
                <Form
                    id={"formPhieuXuatKhoUpdate" + "3"}
                    form={formXuatNguyenLieu}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormXuatNguyenLieu form={formXuatNguyenLieu} />
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
                title={`Sửa ${title}`}
                icon={<EditOutlined />}
            />
            <Modal
                title={`Sửa ${title}`}
                open={isModalOpen}
                onCancel={handleCancel}
                maskClosable={false}
                loading={isLoading}
                centered
                width={1800}
                footer={[
                    <Button
                        key="submit"
                        form={`formPhieuXuatKhoUpdate${tab}`}
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={isSubmitting}
                    >
                        Lưu
                    </Button>,
                ]}
            >
                <Tabs type="card" items={items} activeKey={tab.toString()} />
            </Modal>
        </>
    );
};

export default SuaPhieuXuatKho;
