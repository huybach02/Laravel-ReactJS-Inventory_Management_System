/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { postData } from "../../services/postData.api";
import { useState } from "react";
import { Button, Form, Modal, Row, Tabs } from "antd";
import { useDispatch } from "react-redux";
import { clearImageSingle, setReload } from "../../redux/slices/main.slice";
import FormXuatTheoDonHang from "./FormXuatTheoDonHang";
import FormXuatHuy from "./FormXuatHuy";
import FormXuatNguyenLieu from "./FormXuatNguyenLieu";
import dayjs from "dayjs";

const ThemPhieuXuatKho = ({ path, title }: { path: string; title: string }) => {
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Tạo riêng form instance cho từng tab
    const [formXuatTheoDonHang] = Form.useForm();
    const [formXuatHuy] = Form.useForm();
    const [formXuatNguyenLieu] = Form.useForm();

    const [tab, setTab] = useState("1");

    const showModal = async () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        // Reset tất cả các forms
        formXuatTheoDonHang.resetFields();
        formXuatHuy.resetFields();
        formXuatNguyenLieu.resetFields();
        dispatch(clearImageSingle());
        setTab("1");
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
                ngay_xuat_kho: dayjs(values.ngay_xuat_kho).format("YYYY-MM-DD"),
                loai_phieu_xuat: Number(tab),
            },
            closeModel
        );
        setIsLoading(false);
    };

    const onChange = (key: string) => {
        setTab(key);
    };

    const items = [
        {
            label: "Xuất theo đơn hàng",
            key: "1",
            children: (
                <Form
                    id={"formPhieuXuatKho" + "1"}
                    form={formXuatTheoDonHang}
                    layout="vertical"
                    onFinish={onCreate}
                >
                    <FormXuatTheoDonHang form={formXuatTheoDonHang} />
                </Form>
            ),
        },
        {
            label: "Xuất hủy",
            key: "2",
            children: (
                <Form
                    id={"formPhieuXuatKho" + "2"}
                    form={formXuatHuy}
                    layout="vertical"
                    onFinish={onCreate}
                >
                    <FormXuatHuy form={formXuatHuy} />
                </Form>
            ),
        },
        {
            label: "Xuất nguyên liệu sản xuất",
            key: "3",
            children: (
                <Form
                    id={"formPhieuXuatKho" + "3"}
                    form={formXuatNguyenLieu}
                    layout="vertical"
                    onFinish={onCreate}
                >
                    <FormXuatNguyenLieu form={formXuatNguyenLieu} />
                </Form>
            ),
        },
    ];

    console.log(tab);

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
                            form={`formPhieuXuatKho${tab}`}
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
                <Tabs
                    onChange={onChange}
                    type="card"
                    items={items}
                    activeKey={tab}
                />
            </Modal>
        </>
    );
};

export default ThemPhieuXuatKho;
