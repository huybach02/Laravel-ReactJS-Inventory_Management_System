/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { User } from "../../types/user.type";
import useColumnSearch from "../../hooks/useColumnSearch";
import { getListData } from "../../services/getData.api";
import {
    createFilterQueryFromArray,
    formatVietnameseCurrency,
} from "../../utils/utils";
import { Col, Row, Space, Tag, Flex } from "antd";
import SuaQuanLyBanHang from "./SuaQuanLyBanHang";
import Delete from "../../components/Delete";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";
import {
    OPTIONS_STATUS,
    OPTIONS_TRANG_THAI_THANH_TOAN,
    OPTIONS_TRANG_THAI_XUAT_KHO,
} from "../../utils/constant";
import dayjs from "dayjs";
import ImportExcel from "../../components/ImportExcel";
import ChiTietQuanLyBanHang from "./ChiTietQuanLyBanHang";
import InHoaDon from "../../components/InHoaDon";

const DanhSachQuanLyBanHang = ({
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
                            <ChiTietQuanLyBanHang
                                path={path}
                                id={id}
                                title={title}
                            />
                        )}
                        {permission.show && (
                            <InHoaDon
                                donHangId={id}
                                disabled={!permission.show}
                            />
                        )}
                        {permission.edit && (
                            <SuaQuanLyBanHang
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
            title: "Mã đơn hàng",
            dataIndex: "ma_don_hang",
            ...inputSearch({
                dataIndex: "ma_don_hang",
                operator: "contain",
                nameColumn: "Mã đơn hàng",
            }),
        },
        {
            title: "Ngày tạo",
            dataIndex: "ngay_tao_don_hang",
            ...dateSearch({
                dataIndex: "ngay_tao_don_hang",
                nameColumn: "Ngày tạo",
            }),
        },
        {
            title: "Tên khách hàng",
            dataIndex: "ten_khach_hang",
            ...inputSearch({
                dataIndex: "ten_khach_hang",
                operator: "contain",
                nameColumn: "Tên khách hàng",
            }),
        },
        {
            title: "Số điện thoại",
            dataIndex: "so_dien_thoai",
            ...inputSearch({
                dataIndex: "so_dien_thoai",
                operator: "contain",
                nameColumn: "Số điện thoại",
            }),
        },
        {
            title: "Tổng tiền",
            dataIndex: "tong_tien_can_thanh_toan",
            ...inputSearch({
                dataIndex: "tong_tien_can_thanh_toan",
                operator: "contain",
                nameColumn: "Tổng tiền cần thanh toán",
            }),
            render: (tong_tien_can_thanh_toan: number) => {
                return formatVietnameseCurrency(tong_tien_can_thanh_toan);
            },
        },
        {
            title: "Đã thanh toán",
            dataIndex: "so_tien_da_thanh_toan",
            ...inputSearch({
                dataIndex: "so_tien_da_thanh_toan",
                operator: "contain",
                nameColumn: "Tổng tiền đã thanh toán",
            }),
            render: (so_tien_da_thanh_toan: number) => {
                return formatVietnameseCurrency(so_tien_da_thanh_toan);
            },
        },
        {
            title: "Trạng thái thanh toán",
            dataIndex: "trang_thai_thanh_toan",
            render: (trang_thai_thanh_toan: number) => {
                return (
                    <Tag color={trang_thai_thanh_toan === 1 ? "green" : "red"}>
                        {trang_thai_thanh_toan === 1
                            ? "Đã hoàn thành"
                            : "Chưa hoàn thành"}
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "trang_thai_thanh_toan",
                operator: "equal",
                nameColumn: "Trạng thái thanh toán",
                options: OPTIONS_TRANG_THAI_THANH_TOAN,
            }),
        },
        {
            title: "Trạng thái xuất kho",
            dataIndex: "trang_thai_xuat_kho",
            render: (trang_thai_xuat_kho: number) => {
                return (
                    <Tag
                        color={
                            trang_thai_xuat_kho === 1
                                ? "blue"
                                : trang_thai_xuat_kho === 2
                                ? "green"
                                : "red"
                        }
                    >
                        {trang_thai_xuat_kho === 1
                            ? "Đã có xuất kho"
                            : trang_thai_xuat_kho === 2
                            ? "Đã hoàn thành"
                            : "Chưa xuất kho"}
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "trang_thai_xuat_kho",
                operator: "equal",
                nameColumn: "Trạng thái xuất kho",
                options: OPTIONS_TRANG_THAI_XUAT_KHO,
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
                        scroll={{ x: 2000 }}
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

export default DanhSachQuanLyBanHang;
