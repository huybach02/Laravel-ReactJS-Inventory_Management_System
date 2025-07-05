import {
    FileTextOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import {
    Button,
    Collapse,
    Modal,
    type CollapseProps,
    Table,
    Tag,
    Space,
    Typography,
} from "antd";
import { getDataById } from "../../services/getData.api";
import dayjs from "dayjs";

interface ChiTietCongThuc {
    id: number;
    cong_thuc_san_xuat_id: number;
    san_pham_id: number;
    don_vi_tinh_id: number;
    so_luong: number;
    lan_cap_nhat: number;
    thoi_gian_cap_nhat: string;
    ten_san_pham: string;
    ten_don_vi: string;
    ten_nguoi_tao: string;
    ten_nguoi_cap_nhat: string;
    created_at: string;
    updated_at: string;
}

const LichSuCapNhatCongThucSanXuat = ({
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
    const [data, setData] = useState<Record<string, ChiTietCongThuc[]>>({});

    const showModal = async () => {
        setIsModalOpen(true);
        setIsLoading(true);
        const data = await getDataById(id, path + "/lich-su-cap-nhat");
        setData(data);
        setIsLoading(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // Columns cho bảng chi tiết
    const columns = [
        {
            title: "Nguyên vật liệu",
            dataIndex: "ten_san_pham",
            key: "ten_san_pham",
            width: "40%",
        },
        {
            title: "Đơn vị tính",
            dataIndex: "ten_don_vi",
            key: "ten_don_vi",
            width: "15%",
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: "Số lượng",
            dataIndex: "so_luong",
            key: "so_luong",
            width: "15%",
            render: (value: number) => (
                <Typography.Text strong>{value}</Typography.Text>
            ),
        },
        {
            title: "Người cập nhật",
            dataIndex: "ten_nguoi_cap_nhat",
            key: "ten_nguoi_cap_nhat",
            width: "20%",
        },
    ];

    // Tạo items cho Collapse từ data
    const items: CollapseProps["items"] = Object.entries(data).map(
        ([thoiGian, chiTiets], index) => {
            const firstItem = chiTiets[0];
            const lanCapNhat = firstItem?.lan_cap_nhat || 0;

            return {
                key: index.toString(),
                label: (
                    <Space>
                        <ClockCircleOutlined />
                        <Typography.Text strong>
                            Lần {lanCapNhat} -{" "}
                            {dayjs(thoiGian).format("DD/MM/YYYY HH:mm:ss")}
                        </Typography.Text>
                        <Tag color="processing">
                            {chiTiets.length} nguyên liệu
                        </Tag>
                    </Space>
                ),
                children: (
                    <Table
                        dataSource={chiTiets}
                        columns={columns}
                        pagination={false}
                        size="small"
                        rowKey="id"
                        bordered
                    />
                ),
            };
        }
    );

    return (
        <>
            <Button
                onClick={showModal}
                type="primary"
                size="small"
                title={`Lịch sử cập nhật`}
                icon={<FileTextOutlined />}
                style={{ marginRight: 5 }}
            />
            <Modal
                title={`Lịch sử cập nhật công thức sản xuất ${title}`}
                open={isModalOpen}
                onCancel={handleCancel}
                maskClosable={false}
                loading={isLoading}
                centered
                width={1400}
                footer={null}
                style={{ top: 20 }}
            >
                {Object.keys(data).length > 0 ? (
                    <Collapse
                        items={items}
                        defaultActiveKey={["0"]}
                        size="large"
                    />
                ) : (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <Typography.Text type="secondary">
                            Chưa có lịch sử cập nhật nào
                        </Typography.Text>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default LichSuCapNhatCongThucSanXuat;
