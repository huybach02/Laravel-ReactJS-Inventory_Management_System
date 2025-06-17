import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import FormPhieuChi from "./FormPhieuChi";
import { Button, Form, Modal } from "antd";
import { useDispatch } from "react-redux";
import { getDataById } from "../../services/getData.api";
import { setReload } from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";
import dayjs from "dayjs";

const ChiTietPhieuChi = ({
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

    const [chiTietPhieuChi, setChiTietPhieuChi] = useState<any>([]);

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
        form.setFieldsValue({
            ...data,
        });
        setIsLoading(false);

        if (data.loai_phieu_chi == 2 || data.loai_phieu_chi == 4) {
            setChiTietPhieuChi(data.chi_tiet_phieu_chi);
        }
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
        await putData(path, id, values, closeModel);
        setIsSubmitting(false);
    };

    return (
        <>
            <Button
                onClick={showModal}
                type="primary"
                size="small"
                title={`Chi tiết ${title}`}
                icon={<EyeOutlined />}
            />
            <Modal
                title={`Chi tiết ${title}`}
                open={isModalOpen}
                onCancel={handleCancel}
                maskClosable={false}
                loading={isLoading}
                centered
                width={1000}
                footer={[
                    <Button
                        key="submit"
                        form={`formSuaPhieuChi-${id}`}
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
                    id={`formSuaPhieuChi-${id}`}
                    form={form}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormPhieuChi
                        form={form}
                        isDetail={true}
                        chiTietPhieuChi={chiTietPhieuChi}
                    />
                </Form>
            </Modal>
        </>
    );
};

export default ChiTietPhieuChi;
