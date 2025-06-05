import { PlusOutlined } from "@ant-design/icons";
import { postData } from "../../services/postData.api";
import { useState } from "react";
import { Button, Form, Modal, Row } from "antd";
import FormVaiTro from "./FormVaiTro";
import { useDispatch } from "react-redux";
import { setReload } from "../../redux/slices/main.slice";
import type { IPhanQuyen, IVaiTro } from "../../types/main.type";
import { getListPhanQuyenMacDinh } from "../../services/getData.api";

const ThemVaiTro = ({ path }: { path: string }) => {
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [vaiTroMacDinh, setVaiTroMacDinh] = useState<IPhanQuyen[]>([]);
    const [form] = Form.useForm();
    const title = `Thêm Vai trò`;

    const showModal = async () => {
        setIsModalOpen(true);
        const vaiTroMacDinh = await getListPhanQuyenMacDinh();
        setVaiTroMacDinh(vaiTroMacDinh);
        vaiTroMacDinh.map((item: IPhanQuyen) => {
            for (const key in item.actions) {
                if (!item.actions[key]) {
                    return form.setFieldValue(`checkall_${item.name}`, false);
                }
            }
            return form.setFieldValue(`checkall_${item.name}`, true);
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const onCreate = async (values: IVaiTro) => {
        const phanQuyen: IPhanQuyen[] = Object.entries(values)
            .filter(
                ([key]) =>
                    key.includes("_index") ||
                    key.includes("_create") ||
                    key.includes("_show") ||
                    key.includes("_edit") ||
                    key.includes("_delete") ||
                    key.includes("_export") ||
                    key.includes("_showMenu")
            )
            .reduce((acc: IPhanQuyen[], [key, value]) => {
                const [name, action] = key.split("_");
                const permissionIndex = acc.findIndex(
                    (permission: IPhanQuyen) => permission.name === name
                );
                if (permissionIndex === -1) {
                    acc.push({ name, actions: { [action]: value } });
                } else {
                    acc[permissionIndex].actions[action] = value;
                }
                return acc;
            }, []);
        values = {
            ten_vai_tro: values.ten_vai_tro,
            ma_vai_tro: values.ma_vai_tro,
            phan_quyen: JSON.stringify(phanQuyen),
            trang_thai: values.trang_thai,
        };
        setIsLoading(true);
        const closeModel = () => {
            handleCancel();
            dispatch(setReload());
        };
        await postData(
            path,
            {
                ...values,
            },
            closeModel
        );
        setIsLoading(false);
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
                    <FormVaiTro
                        form={form}
                        isEditing={false}
                        vaiTroMacDinh={vaiTroMacDinh}
                        setVaiTroMacDinh={setVaiTroMacDinh}
                    />
                </Form>
            </Modal>
        </>
    );
};

export default ThemVaiTro;
