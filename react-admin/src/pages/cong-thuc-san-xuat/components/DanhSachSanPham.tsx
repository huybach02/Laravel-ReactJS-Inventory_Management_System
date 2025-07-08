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
import { useCallback } from "react";
import SelectFormApi from "../../../components/select/SelectFormApi";
import { API_ROUTE_CONFIG } from "../../../configs/api-route-config";
import { createFilterQuery } from "../../../utils/utils";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const DanhSachSanPham = ({
    form,
    isDetail,
}: {
    form: FormInstance;
    isDetail: boolean;
}) => {
    const danhSachSanPham = Form.useWatch("chi_tiet_cong_thucs", form) || [];

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

    return (
        <>
            <Card>
                <Typography.Title level={4}>
                    Danh sách nguyên vật liệu
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
                        {(fields, { add, remove }) => (
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
                                    <Col span={5}>
                                        <Typography.Text strong>
                                            Số lượng công thức
                                        </Typography.Text>
                                    </Col>
                                    <Col span={2}>
                                        <Typography.Text strong>
                                            Thao tác
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
                                                        filter={createFilterQuery(
                                                            0,
                                                            "loai_san_pham",
                                                            "equal",
                                                            "NGUYEN_LIEU"
                                                        )}
                                                        placeholder="Chọn sản phẩm"
                                                        showSearch
                                                        onChange={() => {
                                                            handleChangeSanPham(
                                                                name
                                                            );
                                                        }}
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
                                                        disabled={
                                                            isDetail ||
                                                            !sanPhamId
                                                        }
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
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
                                                        placeholder="Số lượng cần mua"
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        disabled={isDetail}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2}>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={
                                                        <MinusCircleOutlined />
                                                    }
                                                    onClick={() => remove(name)}
                                                    disabled={isDetail}
                                                />
                                            </Col>
                                        </Row>
                                    );
                                })}
                                {!isDetail && (
                                    <Row>
                                        <Col span={24}>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm nguyên vật liệu
                                            </Button>
                                        </Col>
                                    </Row>
                                )}
                            </>
                        )}
                    </Form.List>
                </div>
            </Card>
        </>
    );
};

export default DanhSachSanPham;
