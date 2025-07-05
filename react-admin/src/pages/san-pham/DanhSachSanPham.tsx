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
import { Col, Row, Space, Tag, Flex, Image } from "antd";
import SuaSanPham from "./SuaSanPham";
import Delete from "../../components/Delete";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";
import { OPTIONS_LOAI_SAN_PHAM, OPTIONS_STATUS } from "../../utils/constant";
import dayjs from "dayjs";
import ImportExcel from "../../components/ImportExcel";
import ChiTietSanPham from "./ChiTietSanPham";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";

const DanhSachSanPham = ({
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
        const filters = Object.values(query);
        const params = {
            ...filter,
            ...createFilterQueryFromArray([
                ...filters,
                {
                    field: "loai_san_pham",
                    operator: "not_equal",
                    value: "NGUYEN_LIEU",
                },
            ]),
        };
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
                            <ChiTietSanPham path={path} id={id} title={title} />
                        )}
                        {permission.edit && (
                            <SuaSanPham path={path} id={id} title={title} />
                        )}
                        {permission.delete && (
                            <Delete path={path} id={id} onShow={getDanhSach} />
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Ảnh sản phẩm",
            dataIndex: "images",
            align: "center",
            maxWidth: 120,
            render: (images: any[]) => {
                const image = images && images.length > 0 ? images[0].path : "";
                return (
                    <Image
                        src={image}
                        alt="Ảnh sản phẩm"
                        width={50}
                        height={50}
                    />
                );
            },
            exportData: (record: any) => {
                return record.images && record.images.length > 0
                    ? record.images[0].path
                    : "";
            },
        },
        {
            title: "Mã sản phẩm",
            dataIndex: "ma_san_pham",
            ...inputSearch({
                dataIndex: "ma_san_pham",
                operator: "contain",
                nameColumn: "Mã sản phẩm",
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
            title: "Danh mục",
            dataIndex: "danh_muc",
            render: (record: { ten_danh_muc: string }) => {
                return record?.ten_danh_muc;
            },
            ...selectSearch({
                dataIndex: "danh_muc_id",
                path: API_ROUTE_CONFIG.DANH_MUC_SAN_PHAM + "/options",
                operator: "equal",
                nameColumn: "Danh mục",
            }),
        },
        {
            title: "Loại sản phẩm",
            dataIndex: "loai_san_pham",
            render: (record: string) => {
                return (
                    <Tag
                        color={
                            OPTIONS_LOAI_SAN_PHAM.find(
                                (item) => item.value === record
                            )?.value === "SP_NHA_CUNG_CAP"
                                ? "blue"
                                : "green"
                        }
                    >
                        {
                            OPTIONS_LOAI_SAN_PHAM.filter(
                                (item) => item.value !== "NGUYEN_LIEU"
                            ).find((item) => item.value === record)?.label
                        }
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "loai_san_pham",
                operator: "equal",
                nameColumn: "Loại sản phẩm",
                options: OPTIONS_LOAI_SAN_PHAM.filter(
                    (item) => item.value !== "NGUYEN_LIEU"
                ),
            }),
        },
        {
            title: "Giá nhập mặc định",
            dataIndex: "gia_nhap_mac_dinh",
            render: (record: number) => {
                return formatVietnameseCurrency(record);
            },
        },
        {
            title: "Tỷ lệ chiết khấu",
            dataIndex: "ty_le_chiet_khau",
            render: (record: number) => {
                return record + " %";
            },
        },
        {
            title: "Mức lợi nhuận",
            dataIndex: "muc_loi_nhuan",
            render: (record: number) => {
                return record + " %";
            },
        },
        {
            title: "Tổng số lượng nhập",
            dataIndex: "tong_so_luong_nhap",
            render: (record: number) => {
                return record;
            },
        },
        {
            title: "Tổng số lượng thực tế",
            dataIndex: "tong_so_luong_thuc_te",
            render: (record: number) => {
                return record;
            },
        },
        {
            title: "Số lượng cảnh báo",
            dataIndex: "so_luong_canh_bao",
            render: (record: number) => {
                return record;
            },
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

export default DanhSachSanPham;
