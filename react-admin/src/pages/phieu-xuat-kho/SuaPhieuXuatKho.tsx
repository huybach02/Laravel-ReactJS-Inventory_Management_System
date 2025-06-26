/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Button, Form, Modal } from "antd";
import { useDispatch } from "react-redux";
import { getDataById } from "../../services/getData.api";
import { setReload } from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";
import FormXuatTheoDonHang from "./FormXuatTheoDonHang";
import dayjs from "dayjs";

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
    const [form] = Form.useForm();
    const dispatch = useDispatch();

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
            },
            closeModel
        );
        setIsSubmitting(false);
    };

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
                        form={`formSuaPhieuXuatKho-${id}`}
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={isSubmitting}
                    >
                        Lưu
                    </Button>,
                ]}
            >
                <Form
                    id={`formSuaPhieuXuatKho-${id}`}
                    form={form}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormXuatTheoDonHang form={form} />
                </Form>
            </Modal>
        </>
    );
};

export default SuaPhieuXuatKho;
