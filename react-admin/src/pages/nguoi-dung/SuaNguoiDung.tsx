import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import FormNguoiDung from "./FormNguoiDung";
import dayjs from "dayjs";
import { Button, Form, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getDataById } from "../../services/getData.api";
import {
    clearImageSingle,
    setImageSingle,
    setModalReload,
    setReload,
} from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";
import type { INguoiDungFormValues } from "../../types/user.type";
import type { RootState } from "../../redux/store";

const SuaNguoiDung = ({ path, id }: { path: string; id: number }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const title = `Sửa Người dùng`;

    const { imageSingle } = useSelector((state: RootState) => state.main);

    const showModal = async () => {
        setIsModalOpen(true);
        dispatch(setModalReload());
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
        dispatch(setImageSingle(data.images[0].path));
        form.setFieldsValue({
            ...data,
            province_id: +data.province_id,
            district_id: +data.district_id,
            ward_id: +data.ward_id,
        });
        setIsLoading(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        dispatch(setModalReload());
        dispatch(clearImageSingle());
    };

    const onUpdate = async (values: INguoiDungFormValues) => {
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
                birthday: dayjs(values.birthday).format("YYYY-MM-DD"),
                image: imageSingle,
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
                title={title}
                icon={<EditOutlined />}
            />
            <Modal
                title={title}
                open={isModalOpen}
                onCancel={handleCancel}
                maskClosable={false}
                loading={isLoading}
                centered
                width={1000}
                footer={[
                    <Button
                        key="submit"
                        form={`formSuaNguoiDung-${id}`}
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
                    id={`formSuaNguoiDung-${id}`}
                    form={form}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormNguoiDung isEditing form={form} />
                </Form>
            </Modal>
        </>
    );
};

export default SuaNguoiDung;
