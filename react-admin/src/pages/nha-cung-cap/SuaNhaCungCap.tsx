import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import FormNhaCungCap from "./FormNhaCungCap";
import { Button, Form, Modal } from "antd";
import { useDispatch } from "react-redux";
import {
    getDataById,
} from "../../services/getData.api";
import { setReload } from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";

const SuaNhaCungCap = ({
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
      form.setFieldsValue({
          ...data,
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
      await putData(path, id, values, closeModel);
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
                width={1000}
                footer={[
                    <Button
                        key="submit"
                        form={`formSuaNhaCungCap-${id}`}
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
                    id={`formSuaNhaCungCap-${id}`}
                    form={form}
                    layout="vertical"
                    onFinish={onUpdate}
                >
                    <FormNhaCungCap
                        form={form}
                    />
                </Form>
            </Modal>
        </>
  );
};

export default SuaNhaCungCap;