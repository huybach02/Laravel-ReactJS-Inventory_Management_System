/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { User } from "../../types/user.type";
import useColumnSearch from "../../hooks/useColumnSearch";
import { getListData } from "../../services/getData.api";
import { createFilterQueryFromArray } from "../../utils/utils";
import { Col, Row, Space, Tag, Flex } from "antd";
import SuaSanXuat from "./SuaSanXuat";
import Delete from "../../components/Delete";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";
import {
    OPTIONS_STATUS,
    OPTIONS_TRANG_THAI_NHAP_KHO,
    OPTIONS_TRANG_THAI_SAN_XUAT,
    OPTIONS_TRANG_THAI_XUAT_KHO_NGUYEN_LIEU,
} from "../../utils/constant";
import dayjs from "dayjs";
import ImportExcel from "../../components/ImportExcel";
import ChiTietSanXuat from "./ChiTietSanXuat";

const DanhSachSanXuat = ({
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
            render: (id: number, record: any) => {
                return (
                    <Space size={0}>
                        {permission.show && (
                            <ChiTietSanXuat path={path} id={id} title={title} />
                        )}
                        {permission.edit &&
                            record.trang_thai_xuat_kho === 0 && (
                                <SuaSanXuat path={path} id={id} title={title} />
                            )}
                        {permission.delete && (
                            <Delete path={path} id={id} onShow={getDanhSach} />
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Mã sản xuất",
            dataIndex: "ma_lo_san_xuat",
            ...inputSearch({
                dataIndex: "ma_lo_san_xuat",
                operator: "contain",
                nameColumn: "Mã sản xuất",
            }),
        },
        {
            title: "Ngày sản xuất",
            dataIndex: "ngay_san_xuat",
            ...inputSearch({
                dataIndex: "ngay_san_xuat",
                operator: "contain",
                nameColumn: "Ngày sản xuất",
            }),
            render: (record: string): string => {
                return record || "--";
            },
        },
        {
            title: "Sản phẩm",
            dataIndex: "ten_san_pham",
            ...inputSearch({
                dataIndex: "san_phams.ten_san_pham",
                operator: "contain",
                nameColumn: "Sản phẩm",
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
            title: "Số lượng",
            dataIndex: "so_luong",
        },
        {
            title: "Số lượng đã nhập kho",
            dataIndex: "so_luong_nhap_kho",
        },
        {
            title: "Trạng thái sản xuất",
            dataIndex: "trang_thai_hoan_thanh",
            render: (trang_thai_hoan_thanh: number) => {
                return (
                    <Tag
                        color={
                            trang_thai_hoan_thanh === 0
                                ? "red"
                                : trang_thai_hoan_thanh === 1
                                ? "blue"
                                : "green"
                        }
                    >
                        {trang_thai_hoan_thanh === 0
                            ? "Chưa sản xuất"
                            : trang_thai_hoan_thanh === 1
                            ? "Đang sản xuất"
                            : "Đã hoàn thành"}
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "trang_thai_hoan_thanh",
                operator: "equal",
                nameColumn: "Trạng thái sản xuất",
                options: OPTIONS_TRANG_THAI_SAN_XUAT,
            }),
        },
        {
            title: "Trạng thái nhập kho",
            dataIndex: "trang_thai_nhap_kho",
            render: (trang_thai_nhap_kho: number) => {
                return (
                    <Tag
                        color={
                            trang_thai_nhap_kho === 0
                                ? "red"
                                : trang_thai_nhap_kho === 1
                                ? "blue"
                                : "green"
                        }
                    >
                        {trang_thai_nhap_kho === 0
                            ? "Chưa nhập kho"
                            : trang_thai_nhap_kho === 1
                            ? "Đã nhập kho một phần"
                            : "Đã nhập kho hoàn tất"}
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "trang_thai",
                operator: "equal",
                nameColumn: "Trạng thái",
                options: OPTIONS_TRANG_THAI_NHAP_KHO,
            }),
        },
        {
            title: "Trạng thái xuất kho nguyên liệu",
            dataIndex: "trang_thai_xuat_kho",
            render: (trang_thai_xuat_kho: number) => {
                return (
                    <Tag
                        color={
                            trang_thai_xuat_kho === 0
                                ? "red"
                                : trang_thai_xuat_kho === 1
                                ? "blue"
                                : "green"
                        }
                    >
                        {trang_thai_xuat_kho === 0
                            ? "Chưa xuất kho"
                            : trang_thai_xuat_kho === 1
                            ? "Đã xuất kho một phần"
                            : "Đã xuất kho hoàn tất"}
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "trang_thai",
                operator: "equal",
                nameColumn: "Trạng thái",
                options: OPTIONS_TRANG_THAI_XUAT_KHO_NGUYEN_LIEU,
            }),
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
            render: (record: string): string => {
                const date = dayjs(record);
                return date.format("DD/MM/YYYY HH:mm:ss") || "";
            },
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
            render: (record: string): string => {
                const date = dayjs(record);
                return date.format("DD/MM/YYYY HH:mm:ss") || "";
            },
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
                        scroll={{ x: 2400 }}
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

export default DanhSachSanXuat;
