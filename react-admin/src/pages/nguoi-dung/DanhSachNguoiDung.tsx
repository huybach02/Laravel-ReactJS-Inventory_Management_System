/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { User } from "../../types/user.type";
import useColumnSearch from "../../hooks/useColumnSearch";
import { getListData } from "../../services/getData.api";
import { createFilterQueryFromArray } from "../../utils/utils";
import { Col, Flex, Image, Row, Space, Switch, Tag } from "antd";
import SuaNguoiDung from "./SuaNguoiDung";
import Delete from "../../components/Delete";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import moment from "moment";
import type { RootState } from "../../redux/store";
import { patchData } from "../../services/updateData";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { usePagination } from "../../hooks/usePagination";
import {
    OPTIONS_CHO_PHEP_NGOAI_GIO,
    OPTIONS_GIOI_TINH,
    OPTIONS_STATUS,
} from "../../utils/constant";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";

const DanhSachNguoiDung = ({
    path,
    permission,
}: {
    path: string;
    permission: Actions;
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
    const [isChangeStatusLoading, setIsChangeStatusLoading] = useState(false);
    const [changeStatusId, setChangeStatusId] = useState<number[]>([]);

    const getDanhSach = async () => {
        setIsLoading(true);
        const params = { ...filter, ...createFilterQueryFromArray(query) };
        const danhSach = await getListData(path, params);
        if (danhSach) {
            setIsLoading(false);
        }
        setDanhSach(danhSach);
    };

    const handleChangeStatus = async (id: number, status: number) => {
        setIsChangeStatusLoading(true);
        setChangeStatusId([...changeStatusId, id]);
        const res = await patchData(
            API_ROUTE_CONFIG.NGUOI_DUNG_NGUAI_GIO,
            id,
            { is_ngoai_gio: status },
            () => {}
        );
        if (res) {
            setDanhSach((prevState) => {
                if (!prevState) return prevState;
                const newData = prevState.data.map((item) => {
                    if (item.id === id) {
                        return { ...item, is_ngoai_gio: status };
                    }
                    return item;
                });
                return { ...prevState, data: newData };
            });
        }
        setChangeStatusId(changeStatusId.filter((item) => item !== id));
        setIsChangeStatusLoading(false);
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
            width: 80,
            render: (id: number) => {
                return (
                    <Space size={0}>
                        {permission.show && (
                            <SuaNguoiDung path={path} id={id} />
                        )}
                        {permission.delete && (
                            <Delete path={path} id={id} onShow={getDanhSach} />
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Ảnh đại diện",
            dataIndex: "images",
            align: "center",
            maxWidth: 120,
            render: (images: any[]) => {
                const image = images && images.length > 0 ? images[0].path : "";
                return (
                    <Image
                        src={image}
                        alt="Ảnh đại diện"
                        width={50}
                        height={50}
                    />
                );
            },
        },
        {
            title: "Tên",
            dataIndex: "name",
            ...inputSearch({
                dataIndex: "name",
                operator: "contain",
                nameColumn: "Tên",
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
            title: "Điện thoại",
            dataIndex: "phone",
            ...inputSearch({
                dataIndex: "phone",
                operator: "contain",
                nameColumn: "Điện thoại",
            }),
        },
        {
            title: "Vai trò",
            dataIndex: "vai_tro",
            align: "center",
            render: (vai_tro: any) => {
                return vai_tro?.ten_vai_tro || "-";
            },
            ...selectSearch({
                dataIndex: "ma_vai_tro",
                path: API_ROUTE_CONFIG.VAI_TRO_OPTIONS,
                operator: "equal",
                nameColumn: "Vai trò",
            }),
        },
        {
            title: "Cho phép ngoài giờ",
            dataIndex: "is_ngoai_gio",
            align: "center",
            maxWidth: 100,
            render: (is_ngoai_gio: number, record: any) => {
                return (
                    <Switch
                        checked={is_ngoai_gio === 1}
                        onChange={(checked) =>
                            handleChangeStatus(record.id, checked ? 1 : 0)
                        }
                        loading={
                            changeStatusId.includes(record.id) &&
                            isChangeStatusLoading
                        }
                    />
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "is_ngoai_gio",
                operator: "equal",
                nameColumn: "Cho phép ngoài giờ",
                options: OPTIONS_CHO_PHEP_NGOAI_GIO,
            }),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status: number) => {
                return (
                    <Tag color={status === 1 ? "green" : "red"}>
                        {status === 1 ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                );
            },
            ...selectSearchWithOutApi({
                dataIndex: "status",
                operator: "equal",
                nameColumn: "Trạng thái",
                options: OPTIONS_STATUS,
            }),
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            render: (record: string): string => {
                return moment(record).format("DD/MM/YYYY HH:mm:ss");
            },
            ...dateSearch({ dataIndex: "created_at", nameColumn: "Ngày tạo" }),
        },
    ];

    useEffect(() => {
        getDanhSach();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, query, isReload]);

    return (
        <Row>
            <Col span={24}>
                <Flex vertical gap={10}>
                    <Row justify="end">
                        {permission.export && (
                            <ExportTableToExcel
                                columns={defaultColumns}
                                path={path}
                                params={{}}
                            />
                        )}
                        {/* <ImportFile path={path} /> */}
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

export default DanhSachNguoiDung;
