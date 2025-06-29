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
    Tooltip,
    Table,
} from "antd";
import { createFilterQuery, formatter, parser } from "../../utils/utils";
import SelectFormApi from "../../components/select/SelectFormApi";
import { trangThaiSelect } from "../../configs/select-config";
import { generateMaPhieu } from "../../helpers/funcHelper";
import dayjs from "dayjs";
import { OPTIONS_LOAI_PHIEU_THU } from "../../utils/constant";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import { getDataSelect } from "../../services/getData.api";
import { useCallback, useEffect, useState } from "react";
import { OPTIONS_PHUONG_THUC_THANH_TOAN } from "../../utils/constant";
import { WarningOutlined } from "@ant-design/icons";

const FormPhieuThu = ({
    form,
    isDetail,
    chiTietPhieuThu,
}: {
    form: FormInstance;
    isDetail?: boolean;
    chiTietPhieuThu?: any;
}) => {
    const loaiPhieuThu = Form.useWatch("loai_phieu_thu", form);
    const donHangId = Form.useWatch("don_hang_id", form);
    const khachHangId = Form.useWatch("khach_hang_id", form);
    const phuongThucThanhToan = Form.useWatch("phuong_thuc_thanh_toan", form);

    const [donHang, setDonHang] = useState<any[]>([]);

    const fetchSoTienCanThanhToan = async () => {
        const response = await getDataSelect(
            `${API_ROUTE_CONFIG.QUAN_LY_BAN_HANG}/get-so-tien-can-thanh-toan/${donHangId}`,
            {}
        );
        form.setFieldValue("so_tien_can_thanh_toan", response);
    };

    const fetchDonHangByKhachHangId = async () => {
        const response = await getDataSelect(
            `${API_ROUTE_CONFIG.QUAN_LY_BAN_HANG}/get-don-hang-by-khach-hang-id/${khachHangId}`,
            {}
        );
        setDonHang(
            !isDetail
                ? response.map((item: any) => ({
                      ...item,
                      so_tien_thanh_toan: 0,
                  }))
                : response
                      .filter((item: any) =>
                          chiTietPhieuThu?.find(
                              (item2: any) =>
                                  item2.ma_don_hang == item.ma_don_hang &&
                                  item2.so_tien_da_thanh_toan > 0
                          )
                      )
                      .map((item: any) => ({
                          ...item,
                          so_tien_thanh_toan: chiTietPhieuThu?.find(
                              (item: any) =>
                                  item.ma_don_hang == item.ma_don_hang
                          )?.so_tien_da_thanh_toan,
                      }))
        );
    };

    useEffect(() => {
        if (loaiPhieuThu === 1 && donHangId) {
            fetchSoTienCanThanhToan();
        }
        if ((loaiPhieuThu === 2 || loaiPhieuThu === 3) && khachHangId) {
            fetchDonHangByKhachHangId();
        }
    }, [loaiPhieuThu, donHangId, khachHangId]);

    const columns = [
        {
            title: "Đơn hàng",
            dataIndex: "ma_don_hang",
            key: "don_hang",
            render: (text: string, record: any) => {
                return isDetail
                    ? text
                    : text +
                          " (Công nợ: " +
                          formatter(
                              record.tong_tien_can_thanh_toan -
                                  record.so_tien_da_thanh_toan
                          ) +
                          " đ)";
            },
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
                            const updatedDonHang = donHang.map((item) =>
                                item.id === record.id
                                    ? { ...item, so_tien_thanh_toan: value }
                                    : item
                            );

                            // setDonHang(updatedDonHang);
                            form.setFieldValue(
                                "don_hang_ids",
                                updatedDonHang.filter(
                                    (item) => item.so_tien_thanh_toan > 0
                                )
                            );

                            const tongTien = updatedDonHang.reduce(
                                (acc, item) =>
                                    acc + (item.so_tien_thanh_toan || 0),
                                0
                            );

                            form.setFieldValue("so_tien", tongTien);
                        }}
                        defaultValue={
                            donHang?.find(
                                (item: any) =>
                                    item.ma_don_hang == record.ma_don_hang
                            )?.so_tien_thanh_toan || 0
                        }
                    />
                );
            },
        },
    ];

    return (
        <Row gutter={[10, 10]}>
            <Col span={12}>
                <Form.Item
                    name="ma_phieu_thu"
                    label="Mã phiếu thu"
                    rules={[
                        {
                            required: true,
                            message: "Mã phiếu thu không được bỏ trống!",
                        },
                    ]}
                    initialValue={generateMaPhieu("THU")}
                >
                    <Input
                        placeholder="Nhập mã phiếu thu"
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="ngay_thu"
                    label="Ngày thu"
                    rules={[
                        {
                            required: true,
                            message: "Ngày thu không được bỏ trống!",
                        },
                    ]}
                    initialValue={dayjs()}
                >
                    <DatePicker
                        placeholder="Chọn ngày thu"
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item
                    name="loai_phieu_thu"
                    label="Loại phiếu thu"
                    rules={[
                        {
                            required: true,
                            message: "Loại phiếu thu không được bỏ trống!",
                        },
                    ]}
                >
                    <Select
                        options={OPTIONS_LOAI_PHIEU_THU}
                        placeholder="Chọn loại phiếu thu"
                        onChange={(value) => {
                            form.setFieldValue("don_hang_id", undefined);
                            form.setFieldValue("khach_hang_id", undefined);
                            form.setFieldValue("so_tien_can_thanh_toan", 0);
                        }}
                        disabled={isDetail}
                    />
                </Form.Item>
            </Col>
            {loaiPhieuThu === 1 && (
                <Col span={12}>
                    <SelectFormApi
                        name="don_hang_id"
                        label="Đơn hàng (chỉ hiển thị đơn hàng chưa hoàn thành thanh toán)"
                        path={API_ROUTE_CONFIG.QUAN_LY_BAN_HANG + "/options"}
                        filter={createFilterQuery(
                            1,
                            "trang_thai_thanh_toan",
                            "equal",
                            0
                        )}
                        placeholder="Chọn đơn hàng"
                        rules={[
                            {
                                required: loaiPhieuThu === 1,
                                message: "Đơn hàng không được bỏ trống!",
                            },
                        ]}
                        disabled={isDetail}
                    />
                </Col>
            )}
            {(loaiPhieuThu === 2 || loaiPhieuThu === 3) && (
                <Col span={12}>
                    <SelectFormApi
                        name="khach_hang_id"
                        label="Khách hàng"
                        path={API_ROUTE_CONFIG.KHACH_HANG + "/options"}
                        filter={createFilterQuery(
                            1,
                            "trang_thai_thanh_toan",
                            "equal",
                            0
                        )}
                        placeholder="Chọn khách hàng"
                        rules={[
                            {
                                required: loaiPhieuThu === 2,
                                message: "Khách hàng không được bỏ trống!",
                            },
                        ]}
                        disabled={isDetail}
                    />
                </Col>
            )}
            {loaiPhieuThu === 1 && !isDetail && (
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

            {(loaiPhieuThu === 2 || loaiPhieuThu === 3) &&
                khachHangId &&
                donHang.length > 0 && (
                    <Col span={24}>
                        <Table
                            columns={columns}
                            dataSource={donHang}
                            rowKey="id"
                            pagination={false}
                            bordered
                            style={{ marginBottom: 20 }}
                        />
                        <Form.Item name="don_hang_ids" hidden>
                            <Input />
                        </Form.Item>
                    </Col>
                )}

            <Col span={12}>
                <Form.Item
                    name="so_tien"
                    label="Số tiền thu"
                    rules={[
                        {
                            required: loaiPhieuThu !== 2 ? true : false,
                            message: "Số tiền thu không được bỏ trống!",
                        },
                    ]}
                    initialValue={0}
                >
                    <InputNumber
                        placeholder="Nhập số tiền thu"
                        style={{ width: "100%" }}
                        formatter={formatter}
                        parser={parser}
                        addonAfter="đ"
                        disabled={isDetail || loaiPhieuThu === 2}
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="nguoi_tra"
                    label="Người thanh toán"
                    rules={[
                        {
                            required: true,
                            message: "Người thanh toán không được bỏ trống!",
                        },
                    ]}
                >
                    <Input
                        placeholder="Nhập người thanh toán"
                        disabled={isDetail}
                    />
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
                <Col span={6}>
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
                <Col span={6}>
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

export default FormPhieuThu;
