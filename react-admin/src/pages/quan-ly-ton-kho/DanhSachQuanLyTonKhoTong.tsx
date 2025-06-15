/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { User } from "../../types/user.type";
import useColumnSearch from "../../hooks/useColumnSearch";
import { getListData } from "../../services/getData.api";
import { createFilterQueryFromArray } from "../../utils/utils";
import { Col, Row, Space, Tag, Flex } from "antd";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";
import { OPTIONS_STATUS } from "../../utils/constant";
import dayjs from "dayjs";

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
                dataIndex: "ten_san_pham",
                operator: "contain",
                nameColumn: "Tên sản phẩm",
            }),
        },
        {
            title: "Nhà cung cấp",
            dataIndex: "ten_nha_cung_cap",
            ...inputSearch({
                dataIndex: "ten_nha_cung_cap",
                operator: "contain",
                nameColumn: "Tên sản phẩm",
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
                dataIndex: "ten_don_vi",
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
                options: OPTIONS_STATUS,
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

export default DanhSachQuanLyTonKhoTong;
