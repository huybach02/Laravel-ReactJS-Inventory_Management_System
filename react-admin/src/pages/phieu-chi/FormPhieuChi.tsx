/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Row,
    Col,
    Form,
    Input,
    InputNumber,
    type FormInstance,
    Select,
    DatePicker,
    Table,
    Typography,
    Tooltip,
} from "antd";
import { formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";
import { generateMaPhieu } from "../../helpers/funcHelper";
import {
    OPTIONS_LOAI_PHIEU_CHI,
    OPTIONS_PHUONG_THUC_THANH_TOAN,
} from "../../utils/constant";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import dayjs from "dayjs";
import { getDataById, getDataSelect } from "../../services/getData.api";
import { useCallback, useEffect, useState } from "react";
import { WarningOutlined } from "@ant-design/icons";

const FormPhieuChi = ({
    form,
    isDetail,
    chiTietPhieuChi,
}: {
    form: FormInstance;
    isDetail?: boolean;
    chiTietPhieuChi?: any;
}) => {
    console.log(chiTietPhieuChi);
    const nhaCungCapId = Form.useWatch("nha_cung_cap_id", form);
    const loaiPhieuChi = Form.useWatch("loai_phieu_chi", form);
    const phuongThucThanhToan = Form.useWatch("phuong_thuc_thanh_toan", form);
    const phieuNhapKhoId = Form.useWatch("phieu_nhap_kho_id", form);

    const [nhieuPhieuNhapKho, setNhieuPhieuNhapKho] = useState<any[]>([]);

    const fetchInfoPhieuNhapKho = async () => {
        const response = await getDataById(
            phieuNhapKhoId,
            API_ROUTE_CONFIG.PHIEU_NHAP_KHO
        );
        form.setFieldValue(
            "so_tien_can_thanh_toan",
            Number(response?.tong_tien) - Number(response?.da_thanh_toan)
        );
    };

    const fetchTongTienCanThanhToanTheoNhaCungCap = async () => {
        const response = await getDataById(
            nhaCungCapId,
            API_ROUTE_CONFIG.PHIEU_NHAP_KHO +
                "/tong-tien-can-thanh-toan-theo-nha-cung-cap"
        );
        form.setFieldValue("so_tien_can_thanh_toan", response);
    };

    const fetchNhieuPhieuNhapKhoTheoNhaCungCap = useCallback(async () => {
        const response = await getDataSelect(
            API_ROUTE_CONFIG.PHIEU_NHAP_KHO +
                "/options-by-nha-cung-cap/" +
                nhaCungCapId,
            {
                chua_hoan_thanh: isDetail ? false : true,
            }
        );
        setNhieuPhieuNhapKho(
            !isDetail
                ? response.map((item: any) => ({
                      ...item,
                      so_tien_thanh_toan: 0,
                  }))
                : response
                      .filter((item: any) =>
                          chiTietPhieuChi?.find(
                              (item2: any) =>
                                  item2.ma_phieu_nhap_kho ==
                                      item.ma_phieu_nhap_kho &&
                                  item2.tong_tien_da_thanh_toan > 0
                          )
                      )
                      .map((item: any) => ({
                          ...item,
                          so_tien_thanh_toan: chiTietPhieuChi?.find(
                              (item: any) =>
                                  item.ma_phieu_nhap_kho ==
                                  item.ma_phieu_nhap_kho
                          )?.tong_tien_da_thanh_toan,
                      }))
        );
    }, [nhaCungCapId]);

    useEffect(() => {
        if (phieuNhapKhoId && loaiPhieuChi === 1) {
            fetchInfoPhieuNhapKho();
        }
        if (nhaCungCapId && loaiPhieuChi === 2) {
            fetchTongTienCanThanhToanTheoNhaCungCap();
        }
        if (loaiPhieuChi === 4 && nhaCungCapId) {
            fetchNhieuPhieuNhapKhoTheoNhaCungCap();
        }
    }, [phieuNhapKhoId, loaiPhieuChi, nhaCungCapId]);

    const columns = [
        {
            title: "Phiếu nhập kho",
            dataIndex: !isDetail ? "label" : "ma_phieu_nhap_kho",
            key: "phieu_nhap_kho",
        },
        {
            title: "Số tiền thanh toán",
            dataIndex: "so_tien_thanh_toan",
            key: "so_tien_thanh_toan",
            render: (text: string, record: any) => {
                return (
                    <InputNumber
                        placeholder="Nhập số tiền chi"
                        style={{ width: "100%" }}
                        formatter={formatter}
                        parser={parser}
                        addonAfter="đ"
                        disabled={isDetail}
                        onChange={(value) => {
                            const updatedPhieuNhapKho = nhieuPhieuNhapKho.map(
                                (item) =>
                                    item.id === record.id
                                        ? { ...item, so_tien_thanh_toan: value }
                                        : item
                            );

                            setNhieuPhieuNhapKho(updatedPhieuNhapKho);
                            form.setFieldValue(
                                "phieu_nhap_kho_ids",
                                updatedPhieuNhapKho.filter(
                                    (item) => item.so_tien_thanh_toan > 0
                                )
                            );

                            const tongTien = updatedPhieuNhapKho.reduce(
                                (acc, item) =>
                                    acc + (item.so_tien_thanh_toan || 0),
                                0
                            );

                            form.setFieldValue("so_tien", tongTien);
                        }}
                        defaultValue={
                            chiTietPhieuChi?.find(
                                (item: any) =>
                                    item.ma_phieu_nhap_kho ==
                                    record.ma_phieu_nhap_kho
                            )?.tong_tien_da_thanh_toan
                        }
                    />
                );
            },
        },
        {
            title: "Số tiền còn lại",
            dataIndex: "so_tien_con_lai",
            key: "so_tien_con_lai",
            hidden: isDetail,
            render: (text: string, record: any) => {
                if (record.so_tien_thanh_toan > 0) {
                    const soTienConLai =
                        record.cong_no - (record.so_tien_thanh_toan || 0);
                    return (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span>{formatter(soTienConLai) + " đ"}</span>
                            {record.so_tien_thanh_toan > record.cong_no && (
                                <Tooltip
                                    title="Số tiền thanh toán vượt quá công nợ"
                                    color="#ff4d4f"
                                    placement="top"
                                >
                                    <WarningOutlined
                                        style={{
                                            color: "#ff4d4f",
                                            marginLeft: "8px",
                                            fontSize: "20px",
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </div>
                    );
                } else if (record.so_tien_thanh_toan == 0) {
                    return (
                        formatter(
                            record.cong_no - (record.so_tien_thanh_toan || 0)
                        ) + " đ"
                    );
                } else {
                    return "-";
                }
            },
        },
    ].filter((column) => !column.hidden);

    return (
        <Row gutter={[10, 10]}>
            <Col span={12}>
                <Form.Item
                    name="ma_phieu_chi"
                    label="Mã phiếu chi"
                    rules={[
                        {
                            required: true,
                            message: "Mã phiếu chi không được bỏ trống!",
                        },
                    ]}
                    initialValue={generateMaPhieu("CHI")}
                >
                    <Input
                        placeholder="Nhập mã phiếu chi"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="ngay_chi"
                    label="Ngày chi"
                    rules={[
                        {
                            required: true,
                            message: "Ngày chi không được bỏ trống!",
                        },
                    ]}
                    initialValue={dayjs()}
                >
                    <DatePicker
                        placeholder="Chọn ngày chi"
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item
                    name="loai_phieu_chi"
                    label="Loại phiếu chi"
                    rules={[
                        {
                            required: true,
                            message: "Loại phiếu chi không được bỏ trống!",
                        },
                    ]}
                >
                    <Select
                        options={OPTIONS_LOAI_PHIEU_CHI}
                        placeholder="Chọn loại phiếu chi"
                        onChange={(value) => {
                            form.setFieldValue("nha_cung_cap_id", undefined);
                            form.setFieldValue("phieu_nhap_kho_id", undefined);
                            form.setFieldValue("so_tien_can_thanh_toan", 0);
                        }}
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            {(loaiPhieuChi === 1 ||
                loaiPhieuChi === 2 ||
                loaiPhieuChi === 4) && (
                <Col span={12}>
                    <SelectFormApi
                        name="nha_cung_cap_id"
                        label="Nhà cung cấp"
                        path={API_ROUTE_CONFIG.NHA_CUNG_CAP + "/options"}
                        placeholder="Chọn nhà cung cấp"
                        rules={[
                            {
                                required:
                                    loaiPhieuChi === 1 ||
                                    loaiPhieuChi === 2 ||
                                    loaiPhieuChi === 4,
                                message: "Nhà cung cấp không được bỏ trống!",
                            },
                        ]}
                        onChange={() => {
                            // Reset phiếu nhập kho khi thay đổi nhà cung cấp
                            form.setFieldValue("phieu_nhap_kho_id", undefined);
                            form.setFieldValue("so_tien_can_thanh_toan", 0);
                            form.setFieldValue("phieu_nhap_kho_ids", []);
                            setNhieuPhieuNhapKho([]);
                        }}
                        disabled={isDetail}
                    />
                </Col>
            )}
            {loaiPhieuChi === 1 && (
                <Col span={12}>
                    <SelectFormApi
                        name="phieu_nhap_kho_id"
                        label="Phiếu nhập kho"
                        path={
                            nhaCungCapId
                                ? API_ROUTE_CONFIG.PHIEU_NHAP_KHO +
                                  "/options-by-nha-cung-cap/" +
                                  nhaCungCapId
                                : ""
                        }
                        filter={{
                            chua_hoan_thanh: true,
                        }}
                        reload={nhaCungCapId}
                        placeholder="Chọn phiếu nhập kho"
                        rules={[
                            {
                                required: loaiPhieuChi === 1,
                                message: "Phiếu nhập kho không được bỏ trống!",
                            },
                        ]}
                        disabled={isDetail}
                    />
                </Col>
            )}
            {(loaiPhieuChi === 1 || loaiPhieuChi === 2) && !isDetail && (
                <Col span={12}>
                    <Form.Item
                        name="so_tien_can_thanh_toan"
                        label="Số tiền cần thanh toán"
                    >
                        <InputNumber
                            placeholder="Nhập số tiền cần thanh toán"
                            style={{ width: "100%" }}
                            formatter={formatter}
                            parser={parser}
                            addonAfter="đ"
                            disabled
                        />
                    </Form.Item>
                </Col>
            )}

            {loaiPhieuChi === 4 &&
                nhaCungCapId &&
                nhieuPhieuNhapKho.length > 0 && (
                    <Col span={24}>
                        <Table
                            columns={columns}
                            dataSource={nhieuPhieuNhapKho}
                            rowKey="id"
                            pagination={false}
                            bordered
                            style={{ marginBottom: 20 }}
                        />
                        <Form.Item name="phieu_nhap_kho_ids" hidden>
                            <Input />
                        </Form.Item>
                    </Col>
                )}

            <Col span={12}>
                <Form.Item
                    name="so_tien"
                    label="Số tiền chi"
                    rules={[
                        {
                            required: loaiPhieuChi === 4 ? false : true,
                            message: "Số tiền chi không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <InputNumber
                        placeholder="Nhập số tiền chi"
                        style={{ width: "100%" }}
                        formatter={formatter}
                        parser={parser}
                        addonAfter="đ"
                        disabled={isDetail || loaiPhieuChi === 4}
                    />
                </Form.Item>
            </Col>

            {/* <Col span={24}>
                {isDetail && chiTietPhieuChi && chiTietPhieuChi.length > 0 && (
                    <>
                        <Typography.Title level={5}>
                            Chi tiết phiếu chi
                        </Typography.Title>
                        <Table
                            columns={columns}
                            dataSource={chiTietPhieuChi}
                            pagination={false}
                            bordered
                            style={{ marginBottom: 20 }}
                        />
                    </>
                )}
            </Col> */}

            <Col span={12}>
                <Form.Item
                    name="nguoi_nhan"
                    label="Người nhận"
                    rules={[
                        {
                            required: true,
                            message: "Người nhận không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập người nhận" disabled={isDetail} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="phuong_thuc_thanh_toan"
                    label="Phương thức thanh toán"
                    rules={[
                        {
                            required: true,
                            message:
                                "Phương thức thanh toán không được bỏ trống!",
                        },
                    ]}
                >
                    <Select
                        options={OPTIONS_PHUONG_THUC_THANH_TOAN}
                        placeholder="Chọn phương thức thanh toán"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            {phuongThucThanhToan === 2 && (
                <Col span={12}>
                    <Form.Item
                        name="so_tai_khoan"
                        label="Số tài khoản"
                        rules={[
                            {
                                required: phuongThucThanhToan === 2,
                                message: "Số tài khoản không được bỏ trống!",
                            },
                        ]}
                    >
                        <Input
                            placeholder="Nhập số tài khoản"
                            disabled={isDetail}
                        />
                    </Form.Item>
                </Col>
            )}
            {phuongThucThanhToan === 2 && (
                <Col span={12}>
                    <Form.Item
                        name="ngan_hang"
                        label="Ngân hàng"
                        rules={[
                            {
                                required: phuongThucThanhToan === 2,
                                message: "Ngân hàng không được bỏ trống!",
                            },
                        ]}
                    >
                        <Input
                            placeholder="Nhập ngân hàng"
                            disabled={isDetail}
                        />
                    </Form.Item>
                </Col>
            )}
            {loaiPhieuChi === 3 && (
                <Col span={24}>
                    <Form.Item
                        name="ly_do_chi"
                        label="Lý do chi"
                        rules={[
                            {
                                required: loaiPhieuChi === 3,
                                message: "Lý do chi không được bỏ trống!",
                            },
                        ]}
                    >
                        <Input.TextArea
                            placeholder="Nhập lý do chi"
                            rows={2}
                            disabled={isDetail}
                        />
                    </Form.Item>
                </Col>
            )}
            <Col span={24}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                    <Input.TextArea
                        placeholder="Nhập ghi chú"
                        rows={2}
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default FormPhieuChi;
