import { PlusOutlined } from "@ant-design/icons";
import { postData } from "../../services/postData.api";
import { useState } from "react";
import { Button, Form, Modal, Row } from "antd";
import FormDonViTinh from "./FormDonViTinh";
import { useDispatch } from "react-redux";
import { setReload } from "../../redux/slices/main.slice";

const ThemDonViTinh = ({ path, title }: { path: string; title: string }) => {
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
    };

    const onCreate = async (values: any) => {
      setIsLoading(true);
      const closeModel = () => {
        handleCancel();
        dispatch(setReload());
      };
      await postData(path, values, closeModel);
      setIsLoading(false);
    };

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
                width={1000}
                onCancel={handleCancel}
                maskClosable={false}
                centered
                footer={[
                    <Row justify="end" key="footer">
                        <Button
                            key="submit"
                            form="formDonViTinh"
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
                    id="formDonViTinh"
                    form={form}
                    layout="vertical"
                    onFinish={onCreate}
                >
                    <FormDonViTinh
                        form={form}
                    />
                </Form>
            </Modal>
        </>
  );
};

export default ThemDonViTinh;