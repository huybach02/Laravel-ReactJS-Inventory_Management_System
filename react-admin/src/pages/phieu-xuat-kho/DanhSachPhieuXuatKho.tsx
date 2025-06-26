/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { User } from "../../types/user.type";
import useColumnSearch from "../../hooks/useColumnSearch";
import { getListData } from "../../services/getData.api";
import { createFilterQueryFromArray } from "../../utils/utils";
import { Col, Row, Space, Tag, Flex } from "antd";
import SuaPhieuXuatKho from "./SuaPhieuXuatKho";
import Delete from "../../components/Delete";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";
import { OPTIONS_LOAI_PHIEU_XUAT, OPTIONS_STATUS } from "../../utils/constant";
import dayjs from "dayjs";
import ImportExcel from "../../components/ImportExcel";
import ChiTietPhieuXuatKho from "./ChiTietPhieuXuatKho";
import { Link } from "react-router-dom";

const DanhSachPhieuXuatKho = ({
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

    const getDanhSach = async () => {
        setIsLoading(true);
        const params = { ...filter, ...createFilterQueryFromArray(query) };
        const danhSach = await getListData(path, params);
        if (danhSach) {
            setIsLoading(false);
        }
        setDanhSach(danhSach);
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
                        {permission.show && (
                            <ChiTietPhieuXuatKho
                                path={path}
                                id={id}
                                title={title}
                            />
                        )}
                        {permission.edit && (
                            <SuaPhieuXuatKho
                                path={path}
                                id={id}
                                title={title}
                            />
                        )}
                        {permission.delete && (
                            <Delete path={path} id={id} onShow={getDanhSach} />
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Mã phiếu xuất",
            dataIndex: "ma_phieu_xuat_kho",
            ...inputSearch({
                dataIndex: "ma_phieu_xuat_kho",
                operator: "contain",
                nameColumn: "Mã phiếu xuất",
            }),
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "ma_don_hang",
            ...inputSearch({
                dataIndex: "don_hangs.ma_don_hang",
                operator: "contain",
                nameColumn: "Mã đơn hàng",
            }),
            render: (ma_don_hang: string) => {
                return ma_don_hang || "-";
            },
        },
        {
            title: "Ngày xuất kho",
            dataIndex: "ngay_xuat_kho",
            render: (record: string): string => {
                const date = dayjs(record);
                return date.format("DD/MM/YYYY") || "";
            },
            ...dateSearch({
                dataIndex: "ngay_xuat_kho",
                nameColumn: "Ngày xuất kho",
            }),
        },
        {
            title: "Loại phiếu xuất",
            dataIndex: "loai_phieu_xuat",
            ...selectSearchWithOutApi({
                dataIndex: "loai_phieu_xuat",
                operator: "contain",
                nameColumn: "Loại phiếu xuất",
                options: OPTIONS_LOAI_PHIEU_XUAT,
            }),
            render: (loai_phieu_xuat: number) => {
                return OPTIONS_LOAI_PHIEU_XUAT.find(
                    (item) => item.value === loai_phieu_xuat
                )?.label;
            },
        },
        {
            title: "Người tạo",
            dataIndex: "ten_nguoi_tao",
            ...inputSearch({
                dataIndex: "ten_nguoi_tao",
                operator: "contain",
                nameColumn: "Người tạo",
            }),
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            ...dateSearch({ dataIndex: "created_at", nameColumn: "Ngày tạo" }),
        },
        {
            title: "Người cập nhật",
            dataIndex: "ten_nguoi_cap_nhat",
            ...inputSearch({
                dataIndex: "ten_nguoi_cap_nhat",
                operator: "contain",
                nameColumn: "Người cập nhật",
            }),
        },
        {
            title: "Ngày cập nhật",
            dataIndex: "updated_at",
            ...dateSearch({
                dataIndex: "updated_at",
                nameColumn: "Ngày cập nhật",
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
        </Row>
    );
};

export default DanhSachPhieuXuatKho;
