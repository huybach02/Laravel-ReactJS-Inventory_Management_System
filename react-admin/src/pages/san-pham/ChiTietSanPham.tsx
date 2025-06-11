import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import FormSanPham from "./FormSanPham";
import { Button, Form, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getDataById } from "../../services/getData.api";
import { setImageSingle, setReload } from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";
import type { RootState } from "../../redux/store";

const ChiTietSanPham = ({
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

    const { imageSingle } = useSelector((state: RootState) => state.main);

    const showModal = async () => {
        setIsModalOpen(true);
        setIsLoading(true);
        const data = await getDataById(id, path);
        dispatch(setImageSingle(data.images[0].path));
        form.setFieldsValue({
            ...data,
            don_vi_tinh_id: data.don_vi_tinhs.map(
                (item: { value: number }) => item.value
            ),
            nha_cung_cap_id: data.nha_cung_caps.map(
                (item: { value: number }) => item.value
            ),
            image: data.images[0].path,
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
        await putData(path, id, { ...values, image: imageSingle }, closeModel);
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
                style={{ marginRight: 5 }}
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
                    id={`formSuaSanPham-${id}`}
                    form={form}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormSanPham form={form} isDetail={true} />
                </Form>
            </Modal>
        </>
    );
};

export default ChiTietSanPham;
