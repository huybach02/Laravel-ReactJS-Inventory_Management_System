import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import FormQuanLyBanHang from "./FormQuanLyBanHang";
import { Button, Form, Modal } from "antd";
import { useDispatch } from "react-redux";
import { getDataById } from "../../services/getData.api";
import { setReload } from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";
import dayjs from "dayjs";

const SuaQuanLyBanHang = ({
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

        // Transform chi_tiet_don_hangs thành format cho FormList
        let danhSachSanPham: any[] = [];
        if (data.chi_tiet_don_hangs && Array.isArray(data.chi_tiet_don_hangs)) {
            danhSachSanPham = data.chi_tiet_don_hangs.map((item: any) => {
                return {
                    san_pham_id: +item.san_pham_id,
                    don_vi_tinh_id: +item.don_vi_tinh_id,
                    so_luong: item.so_luong,
                    don_gia: item.don_gia,
                    tong_tien: item.tong_tien,
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

        try {
            const closeModel = () => {
                handleCancel();
                dispatch(setReload());
            };

            await putData(
                path,
                id,
                {
                    ...values,
                    ngay_tao_don_hang: dayjs(values.ngay_tao_don_hang).format(
                        "YYYY-MM-DD"
                    ),
                    so_tien_da_thanh_toan: values.so_tien_da_thanh_toan
                        ? values.so_tien_da_thanh_toan
                        : 0,
                },
                closeModel
            );
        } catch (error) {
            console.error("Error in onUpdate:", error);
        } finally {
            setIsSubmitting(false);
        }
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
                width={1200}
                footer={[
                    <Button
                        key="submit"
                        form={`formSuaQuanLyBanHang-${id}`}
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
                    id={`formSuaQuanLyBanHang-${id}`}
                    form={form}
                    layout="vertical"
                    onFinish={onUpdate}
                    onFinishFailed={(errorInfo) => {
                        console.error("Form validation failed:", errorInfo);
                    }}
                >
                    <FormQuanLyBanHang form={form} />
                </Form>
            </Modal>
        </>
    );
};

export default SuaQuanLyBanHang;
