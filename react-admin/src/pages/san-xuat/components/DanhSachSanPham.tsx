/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    InputNumber,
    Row,
    Typography,
    type FormInstance,
} from "antd";
import { useCallback, useEffect, useMemo } from "react";
import SelectFormApi from "../../../components/select/SelectFormApi";
import { API_ROUTE_CONFIG } from "../../../configs/api-route-config";
import { createFilterQuery } from "../../../utils/utils";

const DanhSachSanPham = ({
    form,
    isDetail,
}: {
    form: FormInstance;
    isDetail: boolean;
}) => {
    const danhSachSanPham = Form.useWatch("chi_tiet_cong_thucs", form) || [];
    const soLuongSanXuat = Form.useWatch("so_luong", form);

    // Memoize filter object để tránh re-render không cần thiết
    const sanPhamFilter = useMemo(
        () => createFilterQuery(0, "loai_san_pham", "equal", "NGUYEN_LIEU"),
        []
    );

    const handleChangeSanPham = useCallback(
        (name: number) => {
            form.setFieldValue(
                ["chi_tiet_cong_thucs", name, "don_vi_tinh_id"],
                undefined
            );

            form.setFieldValue(
                ["chi_tiet_cong_thucs", name, "so_luong"],
                undefined
            );
        },
        [form]
    );

    // Tự động cập nhật số lượng thực tế khi số lượng công thức hoặc số lượng sản xuất thay đổi
    useEffect(() => {
        if (danhSachSanPham && soLuongSanXuat) {
            danhSachSanPham.forEach((item: any, index: number) => {
                if (item?.so_luong) {
                    const soLuongThucTe = item.so_luong * soLuongSanXuat;
                    form.setFieldValue(
                        ["chi_tiet_cong_thucs", index, "so_luong_thuc_te"],
                        soLuongThucTe
                    );
                }
            });
        }
    }, [danhSachSanPham, soLuongSanXuat, form]);

    return (
        <>
            <Card>
                <Typography.Title level={4}>
                    Danh sách nguyên vật liệu dựa theo công thức sản xuất
                </Typography.Title>
                <Divider />
                <div
                    className="product-list-container"
                    style={{
                        overflowX: "auto",
                        overflowY: "visible",
                    }}
                >
                    <Form.List name="chi_tiet_cong_thucs">
                        {(fields) => (
                            <>
                                <Row
                                    gutter={[8, 8]}
                                    className="product-row"
                                    style={{
                                        marginBottom: 16,
                                    }}
                                >
                                    <Col span={12}>
                                        <Typography.Text strong>
                                            Tên nguyên vật liệu
                                        </Typography.Text>
                                    </Col>
                                    <Col span={5}>
                                        <Typography.Text strong>
                                            Đơn vị tính
                                        </Typography.Text>
                                    </Col>
                                    <Col span={3}>
                                        <Typography.Text strong>
                                            Số lượng công thức
                                        </Typography.Text>
                                    </Col>
                                    <Col span={3}>
                                        <Typography.Text strong>
                                            Số lượng thực tế
                                        </Typography.Text>
                                    </Col>
                                </Row>

                                {fields.map(({ key, name, ...restField }) => {
                                    const sanPhamId =
                                        danhSachSanPham[name]?.san_pham_id;

                                    return (
                                        <Row
                                            key={key}
                                            gutter={[8, 8]}
                                            className="product-row"
                                            style={{
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Col span={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "san_pham_id"]}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Vui lòng chọn sản phẩm!",
                                                        },
                                                    ]}
                                                >
                                                    <SelectFormApi
                                                        path={
                                                            API_ROUTE_CONFIG.SAN_PHAM +
                                                            `/options`
                                                        }
                                                        filter={sanPhamFilter}
                                                        placeholder="Chọn sản phẩm"
                                                        showSearch
                                                        onChange={() => {
                                                            handleChangeSanPham(
                                                                name
                                                            );
                                                        }}
                                                        disabled
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[
                                                        name,
                                                        "don_vi_tinh_id",
                                                    ]}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Vui lòng chọn đơn vị tính!",
                                                        },
                                                    ]}
                                                    dependencies={[
                                                        "san_pham_id",
                                                    ]}
                                                >
                                                    <SelectFormApi
                                                        path={
                                                            sanPhamId
                                                                ? API_ROUTE_CONFIG.DON_VI_TINH +
                                                                  `/options-by-san-pham/${sanPhamId}`
                                                                : ""
                                                        }
                                                        reload={sanPhamId}
                                                        placeholder="Chọn đơn vị tính"
                                                        showSearch
                                                        disabled
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={3}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "so_luong"]}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Vui lòng nhập số lượng!",
                                                        },
                                                        {
                                                            type: "number",
                                                            min: 1,
                                                            message:
                                                                "Số lượng phải lớn hơn 0!",
                                                        },
                                                    ]}
                                                    initialValue={1}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        placeholder="Số lượng công thức"
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        disabled
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={3}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[
                                                        name,
                                                        "so_luong_thuc_te",
                                                    ]}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Vui lòng nhập số lượng!",
                                                        },
                                                        {
                                                            type: "number",
                                                            min: 1,
                                                            message:
                                                                "Số lượng phải lớn hơn 0!",
                                                        },
                                                    ]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        placeholder="Số lượng thực tế"
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        disabled
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </>
                        )}
                    </Form.List>
                </div>
            </Card>
        </>
    );
};

export default DanhSachSanPham;
