/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Button, Form, Modal, Tabs } from "antd";
import { useDispatch } from "react-redux";
import { getDataById } from "../../services/getData.api";
import { setReload } from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";
import dayjs from "dayjs";
import FormNhapTuNhaCungCap from "./FormNhapTuNhaCungCap";
import FormNhapSanXuat from "./FormNhapSanXuat";

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
    const [tab, setTab] = useState("1");
    const [formNhapTuNhaCungCap] = Form.useForm();
    const [formNhapSanXuat] = Form.useForm();
    const dispatch = useDispatch();

    const showModal = async () => {
        setIsModalOpen(true);
        setIsLoading(true);
        const data = await getDataById(id, path);
        setTab(data.loai_phieu_nhap.toString());
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

        switch (data.loai_phieu_nhap) {
            case 1:
                formNhapTuNhaCungCap.setFieldsValue({
                    ...data,
                    danh_sach_san_pham: danhSachSanPham || [],
                });
                break;
            case 2:
                formNhapSanXuat.setFieldsValue({
                    ...data,
                    danh_sach_san_pham: danhSachSanPham || [],
                });
                break;
        }
        setIsLoading(false);
    };

    const handleCancel = () => {
        formNhapSanXuat.resetFields();
        formNhapTuNhaCungCap.resetFields();
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
                loai_phieu_nhap: Number(tab),
            },
            closeModel
        );
        setIsSubmitting(false);
    };

    const items = [
        {
            label: "Nhập từ nhà cung cấp",
            key: "1",
            disabled: tab === "2",
            children: (
                <Form
                    id={`formSuaPhieuNhapKho` + "1"}
                    form={formNhapTuNhaCungCap}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormNhapTuNhaCungCap
                        form={formNhapTuNhaCungCap}
                        isEditing={true}
                    />
                </Form>
            ),
        },
        {
            label: "Nhập từ sản xuất",
            key: "2",
            disabled: tab === "1",
            children: (
                <Form
                    id={`formSuaPhieuNhapKho` + "2"}
                    form={formNhapSanXuat}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormNhapSanXuat form={formNhapSanXuat} isEditing={true} />
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
                        form={`formSuaPhieuNhapKho` + tab}
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={isSubmitting}
                    >
                        Lưu
                    </Button>,
                ]}
            >
                <Tabs
                    type="card"
                    items={items}
                    activeKey={tab.toString()}
                    onChange={() => {}}
                />
            </Modal>
        </>
    );
};

export default SuaPhieuNhapKho;
