import { useEffect, useState } from "react";
import Heading from "../../components/heading";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { getListData } from "../../services/getData.api";
import type { IThoiGianLamViec } from "../../types/main.type";
import {
    Button,
    TimePicker,
    Flex,
    Form,
    Input,
    Modal,
    Table,
    type TableProps,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { formatTime } from "../../helpers/funcHelper";
import { patchData } from "../../services/updateData";

const path = API_ROUTE_CONFIG.THOI_GIAN_LAM_VIEC;

const ThoiGianLamViec = () => {
    const [data, setData] = useState<IThoiGianLamViec[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<IThoiGianLamViec | null>(
        null
    );
    const [form] = Form.useForm();

    const getConfigData = async () => {
        setIsLoading(true);
        const res = await getListData(path);
        if (res) {
            setData(res);
        }
        setIsLoading(false);
    };

    const handleEdit = (record: IThoiGianLamViec) => {
        setSelectedItem(record);
        const formValues = {
            ...record,
            gio_bat_dau: record.gio_bat_dau
                ? dayjs(record.gio_bat_dau, "HH:mm")
                : null,
            gio_ket_thuc: record.gio_ket_thuc
                ? dayjs(record.gio_ket_thuc, "HH:mm")
                : null,
        };
        form.setFieldsValue(formValues);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    const handleOk = async (
        values: IThoiGianLamViec & {
            gio_bat_dau: dayjs.Dayjs | null;
            gio_ket_thuc: dayjs.Dayjs | null;
        }
    ) => {
        const submitValues = {
            ...selectedItem,
            gio_bat_dau: formatTime(values.gio_bat_dau),
            gio_ket_thuc: formatTime(values.gio_ket_thuc),
            ghi_chu: values.ghi_chu,
        };
        setIsLoading(true);
        await patchData(
            path,
            Number(submitValues.id),
            submitValues,
            handleCloseModal
        );
        setIsLoading(false);
        getConfigData();
    };

    useEffect(() => {
        getConfigData();
    }, []);

    const columns: TableProps<IThoiGianLamViec>["columns"] = [
        {
            title: "Hành động",
            dataIndex: "action",
            key: "action",
            render: (text, record) => (
                <Flex gap={5}>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                </Flex>
            ),
        },
        {
            title: "Thứ",
            dataIndex: "thu",
            key: "thu",
            render: (text) => <p style={{ fontWeight: "bold" }}>{text}</p>,
        },
        {
            title: "Giờ bắt đầu",
            dataIndex: "gio_bat_dau",
            key: "gio_bat_dau",
        },
        {
            title: "Giờ kết thúc",
            dataIndex: "gio_ket_thuc",
            key: "gio_ket_thuc",
        },
        {
            title: "Ghi chú",
            key: "ghi_chu",
            dataIndex: "ghi_chu",
        },
        {
            title: "Người tạo",
            key: "ten_nguoi_tao",
            dataIndex: "ten_nguoi_tao",
        },
        {
            title: "Người cập nhật",
            key: "ten_nguoi_cap_nhat",
            dataIndex: "ten_nguoi_cap_nhat",
        },
        {
            title: "Ngày tạo",
            key: "created_at",
            dataIndex: "created_at",
        },
        {
            title: "Ngày cập nhật",
            key: "updated_at",
            dataIndex: "updated_at",
        },
    ];

    return (
        <>
            <Heading title="Thời gian làm việc" />
            <Table<IThoiGianLamViec>
                columns={columns}
                dataSource={data}
                loading={isLoading}
                scroll={{ x: "max-content" }}
                size="small"
                // pagination={{
                //     responsive: true,
                //     position: ["bottomCenter"],
                //     showSizeChanger: true,
                // }}
            />
            <Modal
                title="Cập nhật thời gian làm việc"
                closable={false}
                open={isModalOpen}
                onOk={() => handleOk(form.getFieldsValue())}
                onCancel={handleCloseModal}
                confirmLoading={isLoading}
            >
                <Form form={form}>
                    <Form.Item label="Thứ" name="thu">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Giờ bắt đầu" name="gio_bat_dau">
                        <TimePicker format="HH:mm" />
                    </Form.Item>
                    <Form.Item label="Giờ kết thúc" name="gio_ket_thuc">
                        <TimePicker format="HH:mm" />
                    </Form.Item>
                    <Form.Item label="Ghi chú" name="ghi_chu">
                        <TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ThoiGianLamViec;
