/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import useColumnSearch from "../../hooks/useColumnSearch";
import { getListData } from "../../services/getData.api";
import { createFilterQueryFromArray } from "../../utils/utils";
import { Button, Col, Modal, Row, Space, Tag } from "antd";
import { useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { apiURL } from "../../configs/config";

const path = API_ROUTE_CONFIG.LICH_SU_IMPORT;

const LichSuImport = () => {
    const isReload = useSelector((state: RootState) => state.main.isReload);

    const [danhSach, setDanhSach] = useState<
        { data: any[]; total: number } | undefined
    >({ data: [], total: 0 });
    const { filter, handlePageChange, handleLimitChange } = usePagination({
        page: 1,
        limit: 20,
    });
    const { inputSearch, query, dateSearch } = useColumnSearch();
    const [isLoading, setIsLoading] = useState(false);
    const [ketQuaImport, setKetQuaImport] = useState<any[]>([]);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const getDanhSach = async () => {
        setIsLoading(true);
        const params = { ...filter, ...createFilterQueryFromArray(query) };
        const danhSach = await getListData(path, params);
        if (danhSach) {
            setIsLoading(false);
        }
        setDanhSach(danhSach);
    };

    const handleXemKetQua = (id: number) => {
        const ketQuaImport = danhSach?.data.find((item) => item.id === id);
        setKetQuaImport(JSON.parse(ketQuaImport?.ket_qua_import));
    };

    const handleDownloadFile = (id: number) => {
        console.log(id);
        window.open(
            `${
                apiURL.endsWith("/") ? apiURL.slice(0, -1) : apiURL
            }${path}/download-file/${id}`
        );
    };

    const defaultColumns: any = [
        {
            title: "STT",
            dataIndex: "index",
            align: "left",
            width: 70,
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
            width: 100,
            render: (id: number) => {
                return (
                    <Space size={0}>
                        <Button
                            size="small"
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                handleXemKetQua(id);
                                setIsOpenModal(true);
                            }}
                        />
                    </Space>
                );
            },
        },
        {
            title: "Người import",
            dataIndex: "ten_nguoi_tao",
            ...inputSearch({
                dataIndex: "ten_nguoi_tao",
                operator: "contain",
                nameColumn: "Tên người import",
            }),
        },
        {
            title: "Mục import",
            dataIndex: "muc_import",
            ...inputSearch({
                dataIndex: "muc_import",
                operator: "contain",
                nameColumn: "Mục import",
            }),
        },
        {
            title: "Tổng số lượng",
            dataIndex: "tong_so_luong",
        },
        {
            title: "Số lượng thành công",
            dataIndex: "so_luong_thanh_cong",
        },
        {
            title: "Số lượng thất bại",
            dataIndex: "so_luong_that_bai",
        },
        {
            title: "File đã import",
            dataIndex: "id",
            render: (id: number) => {
                return (
                    <Button
                        size="small"
                        type="default"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadFile(id)}
                    />
                );
            },
        },
        {
            title: "Ngày import",
            dataIndex: "created_at",
            render: (record: string): string => {
                return record;
            },
            ...dateSearch({
                dataIndex: "created_at",
                nameColumn: "Ngày import",
            }),
        },
    ];

    const ketQuaImportColumns: any = [
        {
            title: "Dòng",
            width: 100,
            dataIndex: "dong",
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            width: 100,
            render: (trang_thai: string) => {
                return trang_thai === "thanh_cong" ? (
                    <Tag color="green">Thành công</Tag>
                ) : (
                    <Tag color="red">Thất bại</Tag>
                );
            },
        },
        {
            title: "Thông báo",
            width: 240,
            dataIndex: "thong_bao",
        },
        {
            title: "Chi tiết lỗi",
            dataIndex: "loi",
            render: (loi: string[]) => {
                return loi && loi.length > 0 ? (
                    loi.map((item) => {
                        return <Tag color="red">{item}</Tag>;
                    })
                ) : (
                    <Tag color="green">Không có lỗi</Tag>
                );
            },
        },
    ];

    useEffect(() => {
        getDanhSach();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, query, isReload]);

    return (
        <Row>
            <Col span={24}>
                <CustomTable
                    rowKey="id"
                    dataTable={danhSach?.data}
                    defaultColumns={defaultColumns}
                    filter={filter}
                    scroll={{ x: 1000, y: "calc(100dvh - 300px)" }}
                    handlePageChange={handlePageChange}
                    handleLimitChange={handleLimitChange}
                    total={danhSach?.total}
                    loading={isLoading}
                    hidePagination={true}
                />
            </Col>
            <Modal
                title="Kết quả import"
                open={isOpenModal}
                width={1400}
                onCancel={() => setIsOpenModal(false)}
                maskClosable={false}
                centered
                footer={null}
            >
                <CustomTable
                    rowKey="id"
                    dataTable={ketQuaImport}
                    defaultColumns={ketQuaImportColumns}
                    filter={filter}
                    scroll={{ x: "max-content", y: "calc(100dvh - 300px)" }}
                    handlePageChange={handlePageChange}
                    handleLimitChange={handleLimitChange}
                    total={ketQuaImport?.length}
                    loading={isLoading}
                    hidePagination={true}
                />
            </Modal>
        </Row>
    );
};

export default LichSuImport;
