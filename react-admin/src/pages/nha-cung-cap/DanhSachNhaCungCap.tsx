/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { User } from "../../types/user.type";
import useColumnSearch from "../../hooks/useColumnSearch";
import { getListData } from "../../services/getData.api";
import { createFilterQueryFromArray } from "../../utils/utils";
import { Col, Row, Space, Tag, Flex } from "antd";
import SuaNhaCungCap from "./SuaNhaCungCap";
import Delete from "../../components/Delete";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";
import { OPTIONS_STATUS } from "../../utils/constant";
import dayjs from "dayjs";
import ImportExcel from "../../components/ImportExcel";

const DanhSachNhaCungCap = ({
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
            align: "right",
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
                        {permission.edit && (
                            <SuaNhaCungCap path={path} id={id} title={title} />
                        )}
                        {permission.delete && (
                            <Delete path={path} id={id} onShow={getDanhSach} />
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Mã nhà cung cấp",
            dataIndex: "ma_nha_cung_cap",
            ...inputSearch({
                dataIndex: "ma_nha_cung_cap",
                operator: "contain",
                nameColumn: "Mã nhà cung cấp",
            }),
        },
        {
            title: "Tên nhà cung cấp",
            dataIndex: "ten_nha_cung_cap",
            ...inputSearch({
                dataIndex: "ten_nha_cung_cap",
                operator: "contain",
                nameColumn: "Tên nhà cung cấp",
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
            title: "Email",
            dataIndex: "email",
            ...inputSearch({
                dataIndex: "email",
                operator: "contain",
                nameColumn: "Email",
            }),
        },
        {
            title: "Địa chỉ",
            dataIndex: "dia_chi",
            ...inputSearch({
                dataIndex: "dia_chi",
                operator: "contain",
                nameColumn: "Địa chỉ",
            }),
        },
        {
            title: "Mã số thuế",
            dataIndex: "ma_so_thue",
            ...inputSearch({
                dataIndex: "ma_so_thue",
                operator: "contain",
                nameColumn: "Mã số thuế",
            }),
        },
        {
            title: "Ngân hàng",
            dataIndex: "ngan_hang",
            ...inputSearch({
                dataIndex: "ngan_hang",
                operator: "contain",
                nameColumn: "Ngân hàng",
            }),
        },
        {
            title: "Số tài khoản",
            dataIndex: "so_tai_khoan",
            ...inputSearch({
                dataIndex: "so_tai_khoan",
                operator: "contain",
                nameColumn: "Số tài khoản",
            }),
        },
        {
            title: "Ghi chú",
            dataIndex: "ghi_chu",
            width: 250,
            ...inputSearch({
                dataIndex: "ghi_chu",
                operator: "contain",
                nameColumn: "Ghi chú",
            }),
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            render: (trang_thai: number) => {
                return (
                    <Tag color={trang_thai === 1 ? "green" : "red"}>
                        {trang_thai === 1 ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "trang_thai",
                operator: "equal",
                nameColumn: "Trạng thái",
                options: OPTIONS_STATUS,
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
                        {permission.create && <ImportExcel path={path} />}
                    </Row>
                    <CustomTable
                        rowKey="id"
                        dataTable={danhSach?.data}
                        defaultColumns={defaultColumns}
                        filter={filter}
                        scroll={{ x: 3000 }}
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

export default DanhSachNhaCungCap;
