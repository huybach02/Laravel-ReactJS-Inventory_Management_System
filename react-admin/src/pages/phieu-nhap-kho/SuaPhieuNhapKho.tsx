/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Button, Form, Modal } from "antd";
import { useDispatch } from "react-redux";
import { getDataById } from "../../services/getData.api";
import { setReload } from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";
import dayjs from "dayjs";
import FormNhapTuNhaCungCap from "./FormNhapTuNhaCungCap";

const SuaPhieuNhapKho = ({
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

    const onUpdate = async (values: any) => {
        setIsSubmitting(true);
        const closeModel = () => {
            handleCancel();
            dispatch(setReload());
        };
        console.log(values);
        await putData(
            path,
            id,
            {
                ...values,
                ngay_nhap_kho: dayjs(values.ngay_nhap_kho).format("YYYY-MM-DD"),
                danh_sach_san_pham: values.danh_sach_san_pham.map(
                    (item: any) => ({
                        ...item,
                        ngay_san_xuat: dayjs(item.ngay_san_xuat).format(
                            "YYYY-MM-DD"
                        ),
                        ngay_het_han: dayjs(item.ngay_het_han).format(
                            "YYYY-MM-DD"
                        ),
                        chiet_khau: Number(item.chiet_khau),
                    })
                ),
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
                        form={`formSuaPhieuNhapKho-${id}`}
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
                    id={`formSuaPhieuNhapKho-${id}`}
                    form={form}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormNhapTuNhaCungCap form={form} isEditing={true} />
                </Form>
            </Modal>
        </>
    );
};

export default SuaPhieuNhapKho;
