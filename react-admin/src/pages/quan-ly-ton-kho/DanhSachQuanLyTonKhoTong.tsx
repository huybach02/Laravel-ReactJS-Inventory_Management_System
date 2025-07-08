/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { User } from "../../types/user.type";
import useColumnSearch from "../../hooks/useColumnSearch";
import { getDataById, getListData } from "../../services/getData.api";
import { createFilterQueryFromArray } from "../../utils/utils";
import {
    Col,
    Row,
    Space,
    Tag,
    Flex,
    Button,
    Modal,
    Typography,
    Card,
    Divider,
    Descriptions,
    Table,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";
import { OPTIONS_STATUS_TON_KHO } from "../../utils/constant";
import dayjs from "dayjs";
import { EyeOutlined } from "@ant-design/icons";

const DanhSachQuanLyTonKhoTong = ({
    path,
    permission,
    title,
}: {
    path: string;
    permission: Actions;
    title: string;
}) => {
    const dispatch = useDispatch();

    const isReload = useSelector((state: RootState) => state.main.isReload);

    const [danhSach, setDanhSach] = useState<
        { data: User[]; total: number } | undefined
    >({ data: [], total: 0 });
    const { filter, handlePageChange, handleLimitChange } = usePagination({
        page: 1,
        limit: 20,
    });
    const {
        inputSearch,
        query,
        dateSearch,
        selectSearch,
        selectSearchWithOutApi,
    } = useColumnSearch();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingChiTietLo, setIsLoadingChiTietLo] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chiTietLo, setChiTietLo] = useState<any>(null);

    const getDanhSach = async () => {
        setIsLoading(true);
        const params = { ...filter, ...createFilterQueryFromArray(query) };
        const danhSach = await getListData(path, params);
        if (danhSach) {
            setIsLoading(false);
        }
        setDanhSach(danhSach);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const getChiTietLo = async (id: number) => {
        setIsLoadingChiTietLo(true);
        const chiTietLo = await getDataById(id, path);
        if (chiTietLo) {
            setIsLoadingChiTietLo(false);
        }
        setChiTietLo(chiTietLo);
    };

    const defaultColumns: any = [
        {
            title: "STT",
            dataIndex: "index",
            width: 80,
            render: (_text: any, _record: any, index: any) => {
                return (
                    filter.limit && (filter.page - 1) * filter.limit + index + 1
                );
            },
        },
        {
            title: "Thao tác",
            dataIndex: "id",
            align: "center",
            render: (id: number) => {
                return (
                    <Space size={0}>
                        {permission.index && (
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => {
                                    setIsModalOpen(true);
                                    getChiTietLo(id);
                                }}
                            />
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Mã lô",
            dataIndex: "ma_lo_san_pham",
            ...inputSearch({
                dataIndex: "ma_lo_san_pham",
                operator: "contain",
                nameColumn: "Mã lô",
            }),
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "ten_san_pham",
            ...inputSearch({
                dataIndex: "san_phams.ten_san_pham",
                operator: "contain",
                nameColumn: "Tên sản phẩm",
            }),
        },
        {
            title: "Nhà cung cấp",
            dataIndex: "ten_nha_cung_cap",
            ...inputSearch({
                dataIndex: "nha_cung_caps.ten_nha_cung_cap",
                operator: "contain",
                nameColumn: "Nhà cung cấp",
            }),
        },
        {
            title: "Ngày sản xuất",
            dataIndex: "ngay_san_xuat",
            render: (record: string): string => {
                const date = dayjs(record);
                return date.format("DD/MM/YYYY") || "";
            },
            ...dateSearch({
                dataIndex: "chi_tiet_phieu_nhap_khos.ngay_san_xuat",
                nameColumn: "Ngày sản xuất",
            }),
        },
        {
            title: "Ngày hết hạn",
            dataIndex: "ngay_het_han",
            render: (record: string): string => {
                const date = dayjs(record);
                return date.format("DD/MM/YYYY") || "";
            },
            ...dateSearch({
                dataIndex: "chi_tiet_phieu_nhap_khos.ngay_het_han",
                nameColumn: "Ngày hết hạn",
            }),
        },
        {
            title: "Số lượng tồn",
            dataIndex: "so_luong_ton",
            ...inputSearch({
                dataIndex: "so_luong_ton",
                operator: "contain",
                nameColumn: "Số lượng tồn",
            }),
        },
        {
            title: "Đơn vị tính",
            dataIndex: "ten_don_vi",
            ...inputSearch({
                dataIndex: "don_vi_tinhs.ten_don_vi",
                operator: "contain",
                nameColumn: "Đơn vị tính",
            }),
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            render: (trang_thai: number) => {
                return (
                    <Tag
                        color={
                            trang_thai === 0
                                ? "red"
                                : trang_thai === 1
                                ? "orange"
                                : "green"
                        }
                    >
                        {trang_thai === 0
                            ? "Hết hàng"
                            : trang_thai === 1
                            ? "Sắp hết hàng"
                            : "Ổn định"}
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "trang_thai",
                operator: "equal",
                nameColumn: "Trạng thái",
                options: OPTIONS_STATUS_TON_KHO,
            }),
        },
    ];

    useEffect(() => {
        getDanhSach();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReload, filter, query]);

    return (
        <Row>
            <Col span={24}>
                <Flex vertical gap={10}>
                    <Row
                        justify="end"
                        align="middle"
                        style={{ marginBottom: 5, gap: 10 }}
                    >
                        {permission.export && (
                            <ExportTableToExcel
                                columns={defaultColumns}
                                path={path}
                                params={{}}
                            />
                        )}
                        {/* {permission.create && <ImportExcel path={path} />} */}
                    </Row>
                    <CustomTable
                        rowKey="id"
                        dataTable={danhSach?.data}
                        defaultColumns={defaultColumns}
                        filter={filter}
                        scroll={{ x: 1000 }}
                        handlePageChange={handlePageChange}
                        handleLimitChange={handleLimitChange}
                        total={danhSach?.total}
                        loading={isLoading}
                    />
                </Flex>
            </Col>
            <Modal
                title={`Chi tiết lô sản phẩm ${
                    chiTietLo?.ma_lo_san_pham || ""
                }`}
                open={isModalOpen}
                width={1500}
                onCancel={handleCancel}
                maskClosable={false}
                centered
                footer={null}
                loading={isLoadingChiTietLo}
                bodyStyle={{
                    maxHeight: "calc(100vh - 200px)",
                    overflow: "auto",
                    padding: "12px",
                }}
            >
                {chiTietLo && (
                    <Row gutter={[16, 12]}>
                        <Col span={24}>
                            <Card
                                type="inner"
                                title="Thông tin cơ bản"
                                size="small"
                            >
                                <Descriptions
                                    column={{
                                        xs: 1,
                                        sm: 2,
                                        md: 3,
                                        lg: 5,
                                        xl: 5,
                                    }}
                                    layout="vertical"
                                    bordered
                                >
                                    <Descriptions.Item
                                        label="Tên sản phẩm"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        {chiTietLo.ten_san_pham}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Mã lô"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        {chiTietLo.ma_lo_san_pham}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Đơn vị tính"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        {chiTietLo.ten_don_vi}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Nhà cung cấp"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        {chiTietLo.ten_nha_cung_cap}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Mức lợi nhuận"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        {chiTietLo.muc_loi_nhuan}%
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card
                                type="inner"
                                title="Thông tin số lượng"
                                size="small"
                            >
                                <Descriptions
                                    column={{ xs: 1, sm: 2, md: 3 }}
                                    layout="vertical"
                                    bordered
                                >
                                    <Descriptions.Item
                                        label="Số lượng tồn"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        <Typography.Text
                                            strong
                                            style={{
                                                fontSize: "30px",
                                                color: "#1890ff",
                                            }}
                                        >
                                            {chiTietLo.so_luong_ton}
                                        </Typography.Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Số lượng nhập"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        {chiTietLo.so_luong_nhap}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Số lượng cảnh báo"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        {chiTietLo.so_luong_canh_bao}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card
                                type="inner"
                                title="Thông tin giá"
                                size="small"
                            >
                                <Descriptions
                                    column={{
                                        xs: 1,
                                        sm: 2,
                                        md: 3,
                                        lg: 6,
                                        xl: 6,
                                    }}
                                    size="small"
                                    bordered
                                >
                                    <Descriptions.Item
                                        label="Tổng tiền nhập"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        <Typography.Text
                                            type="danger"
                                            strong
                                            style={{ fontSize: "16px" }}
                                        >
                                            {chiTietLo.tong_tien_nhap?.toLocaleString()}{" "}
                                            đ
                                        </Typography.Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Giá nhập đơn vị"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        <Typography.Text type="danger" strong>
                                            {chiTietLo.gia_nhap?.toLocaleString()}{" "}
                                            đ
                                        </Typography.Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Chiết khấu"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        <Tag color="blue">
                                            {chiTietLo.chiet_khau}%
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Giá vốn đơn vị"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        <Typography.Text type="warning" strong>
                                            {chiTietLo.gia_von_don_vi?.toLocaleString()}{" "}
                                            đ
                                        </Typography.Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Giá bán lẻ đơn vị"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        <Typography.Text type="success" strong>
                                            {chiTietLo.gia_ban_le_don_vi?.toLocaleString()}{" "}
                                            đ
                                        </Typography.Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Lợi nhuận bán lẻ"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        <Typography.Text type="success" strong>
                                            {chiTietLo.loi_nhuan_ban_le?.toLocaleString()}{" "}
                                            đ
                                        </Typography.Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card
                                type="inner"
                                title="Thông tin thời gian"
                                size="small"
                            >
                                <Descriptions
                                    column={{ xs: 1, sm: 2 }}
                                    layout="vertical"
                                    bordered
                                >
                                    <Descriptions.Item
                                        label="Ngày sản xuất"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        {chiTietLo.ngay_san_xuat}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label="Ngày hết hạn"
                                        labelStyle={{ fontWeight: "bold" }}
                                    >
                                        <Typography.Text
                                            type={
                                                new Date(
                                                    chiTietLo.ngay_het_han
                                                ) < new Date()
                                                    ? "danger"
                                                    : "success"
                                            }
                                        >
                                            {chiTietLo.ngay_het_han}{" "}
                                            {new Date(chiTietLo.ngay_het_han) <
                                                new Date() && " (Đã hết hạn)"}
                                        </Typography.Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        {chiTietLo.ghi_chu && (
                            <Col span={24}>
                                <Card type="inner" title="Ghi chú" size="small">
                                    <Typography.Paragraph style={{ margin: 0 }}>
                                        {chiTietLo.ghi_chu}
                                    </Typography.Paragraph>
                                </Card>
                            </Col>
                        )}
                    </Row>
                )}
            </Modal>
        </Row>
    );
};

export default DanhSachQuanLyTonKhoTong;
