import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import FormPhieuThu from "./FormPhieuThu";
import { Button, Form, Modal } from "antd";
import { getDataById } from "../../services/getData.api";
import dayjs from "dayjs";

const SuaPhieuThu = ({
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

    const [chiTietPhieuThu, setChiTietPhieuThu] = useState<any>([]);

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

        if (data.loai_phieu_thu == 2 || data.loai_phieu_thu == 3) {
            setChiTietPhieuThu(data.chi_tiet_phieu_thu);
        }
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
            />
            <Modal
                title={`Chi tiết ${title}`}
                open={isModalOpen}
                onCancel={handleCancel}
                maskClosable={false}
                loading={isLoading}
                centered
                width={1000}
                footer={null}
            >
                <Form
                    id={`formSuaPhieuThu-${id}`}
                    form={form}
                    layout="vertical"
                >
                    <FormPhieuThu
                        form={form}
                        isDetail
                        chiTietPhieuThu={chiTietPhieuThu}
                    />
                </Form>
            </Modal>
        </>
    );
};

export default SuaPhieuThu;
