/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { postData } from "../../services/postData.api";
import { useState } from "react";
import { Button, Form, Modal, Row, Tabs } from "antd";
import { useDispatch } from "react-redux";
import { clearImageSingle, setReload } from "../../redux/slices/main.slice";
import FormNhapTuNhaCungCap from "./FormNhapTuNhaCungCap";
import FormNhapDoiHang from "./FormNhapDoiHang";
import FormNhapSanXuat from "./FormNhapSanXuat";
import dayjs from "dayjs";

const ThemPhieuNhapKho = ({ path, title }: { path: string; title: string }) => {
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    const showModal = async () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        dispatch(clearImageSingle());
    };

    const onCreate = async (values: any) => {
        setIsLoading(true);
        const closeModel = () => {
            handleCancel();
            dispatch(setReload());
        };

        await postData(
            path,
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
                loai_phieu_nhap: 1,
            },
            closeModel
        );
        setIsLoading(false);
    };

    const onChange = (key: string) => {
        console.log(key);
    };

    const items = [
        {
            label: "Nhập từ nhà cung cấp",
            key: "1",
            children: (
                <Form
                    id="formPhieuNhapKhoTuNhaCungCap"
                    form={form}
                    layout="vertical"
                    onFinish={onCreate}
                >
                    <FormNhapTuNhaCungCap form={form} />
                </Form>
            ),
        },
        {
            label: "Nhập đổi hàng",
            key: "2",
            children: <FormNhapDoiHang form={form} />,
        },
        {
            label: "Nhập sản xuất",
            key: "3",
            children: <FormNhapSanXuat form={form} />,
        },
    ];

    return (
        <>
            <Button
                onClick={showModal}
                type="primary"
                title={`Thêm ${title}`}
                icon={<PlusOutlined />}
            >
                Thêm {title}
            </Button>
            <Modal
                title={`Thêm ${title}`}
                open={isModalOpen}
                width={1800}
                onCancel={handleCancel}
                maskClosable={false}
                centered
                footer={[
                    <Row justify="end" key="footer">
                        <Button
                            key="submit"
                            form="formPhieuNhapKhoTuNhaCungCap"
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={isLoading}
                        >
                            Lưu
                        </Button>
                    </Row>,
                ]}
            >
                <Tabs onChange={onChange} type="card" items={items} />
            </Modal>
        </>
    );
};

export default ThemPhieuNhapKho;
