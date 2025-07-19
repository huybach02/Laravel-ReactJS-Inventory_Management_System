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
import SuaPhieuNhapKho from "./SuaPhieuNhapKho";
import Delete from "../../components/Delete";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";
import { OPTIONS_LOAI_PHIEU_NHAP, OPTIONS_STATUS } from "../../utils/constant";
import dayjs from "dayjs";
import ImportExcel from "../../components/ImportExcel";
import ChiTietPhieuNhapKho from "./ChiTietPhieuNhapKho";

const DanhSachPhieuNhapKho = ({
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
                            <ChiTietPhieuNhapKho
                                path={path}
                                id={id}
                                title={title}
                            />
                        )}
                        {permission.edit && record.trang_thai === 0 && (
                            <SuaPhieuNhapKho
                                path={path}
                                id={id}
                                title={title}
                            />
                        )}
                        {permission.delete && record.trang_thai === 0 && (
                            <Delete path={path} id={id} onShow={getDanhSach} />
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Mã phiếu nhập",
            dataIndex: "ma_phieu_nhap_kho",
            ...inputSearch({
                dataIndex: "ma_phieu_nhap_kho",
                operator: "contain",
                nameColumn: "Mã phiếu nhập",
            }),
        },
        {
            title: "Ngày nhập kho",
            dataIndex: "ngay_nhap_kho",
            render: (record: string): string => {
                const date = dayjs(record);
                return date.format("DD/MM/YYYY") || "";
            },
            ...dateSearch({
                dataIndex: "ngay_nhap_kho",
                nameColumn: "Ngày nhập kho",
            }),
        },
        {
            title: "Loại phiếu nhập",
            dataIndex: "loai_phieu_nhap",
            ...selectSearchWithOutApi({
                dataIndex: "loai_phieu_nhap",
                operator: "contain",
                nameColumn: "Loại phiếu nhập",
                options: OPTIONS_LOAI_PHIEU_NHAP,
            }),
            render: (loai_phieu_nhap: number) => {
                return OPTIONS_LOAI_PHIEU_NHAP.find(
                    (item) => item.value === loai_phieu_nhap
                )?.label;
            },
        },
        {
            title: "Nhà cung cấp",
            dataIndex: "ten_nha_cung_cap",
            ...inputSearch({
                dataIndex: "nha_cung_caps.ten_nha_cung_cap",
                operator: "contain",
                nameColumn: "Nhà cung cấp",
            }),
            render: (ten_nha_cung_cap: any, record: any) => {
                if (
                    record.loai_phieu_nhap === OPTIONS_LOAI_PHIEU_NHAP[1].value
                ) {
                    return "-";
                }
                return ten_nha_cung_cap;
            },
        },
        {
            title: "Tổng tiền",
            dataIndex: "tong_tien",
            render: (tong_tien: number) => {
                return formatVietnameseCurrency(tong_tien);
            },
        },
        {
            title: "Đã thanh toán",
            dataIndex: "da_thanh_toan",
            render: (da_thanh_toan: number, record: any) => {
                if (
                    record.loai_phieu_nhap === OPTIONS_LOAI_PHIEU_NHAP[1].value
                ) {
                    return "-";
                }
                return formatVietnameseCurrency(da_thanh_toan);
            },
        },
        {
            title: "Số tiền còn lại",
            render: (record: any) => {
                if (
                    record.loai_phieu_nhap === OPTIONS_LOAI_PHIEU_NHAP[1].value
                ) {
                    return "-";
                }
                return formatVietnameseCurrency(
                    record.tong_tien - record.da_thanh_toan
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            render: (trang_thai: number, record: any) => {
                if (
                    record.loai_phieu_nhap === OPTIONS_LOAI_PHIEU_NHAP[1].value
                ) {
                    return "-";
                }
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
                            ? "Chưa có thanh toán"
                            : trang_thai === 1
                            ? "Đã thanh toán một phần"
                            : "Đã thanh toán hoàn tất"}
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "trang_thai",
                operator: "equal",
                nameColumn: "Trạng thái",
                options: [
                    {
                        label: "Chưa có thanh toán",
                        value: "0",
                    },
                    {
                        label: "Đã thanh toán một phần",
                        value: "1",
                    },
                    {
                        label: "Đã thanh toán hoàn tất",
                        value: "2",
                    },
                ],
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

export default DanhSachPhieuNhapKho;
