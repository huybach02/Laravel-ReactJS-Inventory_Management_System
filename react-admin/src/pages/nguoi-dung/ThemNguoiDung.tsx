import { PlusOutlined } from "@ant-design/icons";
import { postData } from "../../services/postData.api";
import { useState } from "react";
import dayjs from "dayjs";
import { Button, Form, Modal, Row } from "antd";
import FormNguoiDung from "./FormNguoiDung";
import type { INguoiDungFormValues } from "../../types/user.type";
import { useDispatch, useSelector } from "react-redux";
import {
    clearImageSingle,
    setModalReload,
    setReload,
} from "../../redux/slices/main.slice";
import type { RootState } from "../../redux/store";

const ThemNguoiDung = ({ path }: { path: string }) => {
    const dispatch = useDispatch();

    const { imageSingle } = useSelector((state: RootState) => state.main);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    const title = `Thêm Người dùng`;

    const showModal = async () => {
        setIsModalOpen(true);
        dispatch(setModalReload());
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        dispatch(setModalReload());
        dispatch(clearImageSingle());
    };

    const onCreate = async (values: INguoiDungFormValues) => {
        setIsLoading(true);
        const closeModel = () => {
            handleCancel();
            dispatch(setReload());
        };
        await postData(
            path,
            {
                ...values,
                birthday: dayjs(values.birthday).format("YYYY-MM-DD"),
                image: imageSingle,
            },
            closeModel
        );
        setIsLoading(false);
        dispatch(clearImageSingle());
    };

    return (
        <>
            <Button
                onClick={showModal}
                type="primary"
                title={title}
                icon={<PlusOutlined />}
            >
                {title}
            </Button>
            <Modal
                title={title}
                open={isModalOpen}
                width={1000}
                onCancel={handleCancel}
                maskClosable={false}
                centered
                footer={[
                    <Row justify="end" key="footer">
                        <Button
                            key="submit"
                            form="formThemNguoiDung"
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
                <Form
                    id="formThemNguoiDung"
                    form={form}
                    layout="vertical"
                    onFinish={onCreate}
                >
                    <FormNguoiDung form={form} isEditing={false} />
                </Form>
            </Modal>
        </>
    );
};

export default ThemNguoiDung;
