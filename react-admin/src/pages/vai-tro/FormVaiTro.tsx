/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CheckboxChangeEvent, FormInstance } from "antd";
import { Row, Col, Form, Input, Select, Typography, Checkbox } from "antd";
import { trangThaiSelect } from "../../configs/select-config";
import type { IPhanQuyen } from "../../types/main.type";
import { Fragment } from "react/jsx-runtime";
import { ConvertTextCheckBox } from "../../helpers/funcHelper";

const FormVaiTro = ({
    isEditing,
    form,
    vaiTroMacDinh,
    setVaiTroMacDinh,
}: {
    isEditing: boolean;
    form: FormInstance;
    vaiTroMacDinh: IPhanQuyen[];
    setVaiTroMacDinh: (vaiTroMacDinh: IPhanQuyen[]) => void;
}) => {
    const saveDataCheckbox = (
        item: IPhanQuyen,
        key: string | null,
        dataCheck: boolean
    ) => {
        let updatedActions = {};
        if (key === null) {
            for (const key in item.actions) {
                if (Object.prototype.hasOwnProperty.call(item.actions, key)) {
                    item.actions[key] = dataCheck;
                }
            }
            updatedActions = { ...item.actions };
        } else
            updatedActions = {
                ...item.actions,
                [key]: dataCheck,
            };
        const updatedItem = {
            ...item,
            actions: updatedActions,
        };
        const updatedItems: IPhanQuyen[] = vaiTroMacDinh.map((i: IPhanQuyen) =>
            i === item ? updatedItem : i
        );
        setVaiTroMacDinh(updatedItems);
        return updatedItem;
    };

    const handleCheckAllItem =
        (item: IPhanQuyen) => (event: CheckboxChangeEvent) => {
            const updatedItems: IPhanQuyen = saveDataCheckbox(
                item,
                null,
                event.target.checked
            );
            for (const key in updatedItems.actions) {
                form.setFieldValue(
                    [`${updatedItems.name}_${key}`],
                    event.target.checked
                );
            }
        };

    const onChange =
        (item: IPhanQuyen, key: string) => (event: CheckboxChangeEvent) => {
            const updatedItem: IPhanQuyen = saveDataCheckbox(
                item,
                key,
                event.target.checked
            );
            for (const key in updatedItem.actions) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        updatedItem.actions,
                        key
                    ) &&
                    updatedItem.actions[key] === false
                ) {
                    return form.setFieldValue([`checkall_${item.name}`], false);
                }
            }
            return form.setFieldValue([`checkall_${item.name}`], true);
        };

    return (
        <Row gutter={[10, 10]}>
            <Col span={12} xs={24} lg={12}>
                <Form.Item
                    name="ma_vai_tro"
                    label="Mã vai trò"
                    rules={[
                        {
                            required: true,
                            message: "Mã vai trò không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập mã vai trò" />
                </Form.Item>
            </Col>
            <Col span={12} xs={24} lg={12}>
                <Form.Item
                    name="ten_vai_tro"
                    label="Tên vai trò"
                    rules={[
                        {
                            required: true,
                            message: "Tên vai trò không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên vai trò" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Typography.Title level={5} style={{ marginBottom: "0" }}>
                    Phân quyền
                </Typography.Title>
            </Col>
            <Col span={24}>
                <Row justify="space-between" gutter={[10, 10]}>
                    {vaiTroMacDinh &&
                        vaiTroMacDinh.map((item: any, index: number) => {
                            return (
                                <Fragment key={index}>
                                    <Col
                                        md={4}
                                        xs={10}
                                        style={{ textAlign: "left" }}
                                    >
                                        <Typography.Text
                                            style={{ fontSize: "13px" }}
                                        >
                                            {item.name}
                                        </Typography.Text>
                                    </Col>
                                    <Col md={20} xs={14}>
                                        <Row justify="end">
                                            {Object.entries(item.actions).map(
                                                ([key, value]: any) => (
                                                    <Col
                                                        md={3}
                                                        xs={12}
                                                        key={key}
                                                        style={{
                                                            textAlign: "left",
                                                        }}
                                                    >
                                                        <Form.Item
                                                            name={`${item.name}_${key}`}
                                                            valuePropName="checked"
                                                            initialValue={value}
                                                        >
                                                            <Checkbox
                                                                onChange={onChange(
                                                                    item,
                                                                    key
                                                                )}
                                                            >
                                                                <Typography.Text
                                                                    style={{
                                                                        fontSize:
                                                                            "13px",
                                                                    }}
                                                                >
                                                                    {ConvertTextCheckBox(
                                                                        key
                                                                    )}
                                                                </Typography.Text>
                                                            </Checkbox>
                                                        </Form.Item>
                                                    </Col>
                                                )
                                            )}
                                            <Col md={3} xs={12}>
                                                <Form.Item
                                                    name={`checkall_${item.name}`}
                                                    valuePropName="checked"
                                                >
                                                    <Checkbox
                                                        onChange={handleCheckAllItem(
                                                            item
                                                        )}
                                                    >
                                                        <Typography.Text
                                                            style={{
                                                                fontSize:
                                                                    "13px",
                                                            }}
                                                        >
                                                            Tất cả
                                                        </Typography.Text>
                                                    </Checkbox>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Fragment>
                            );
                        })}
                </Row>
            </Col>
            <Col xs={24} md={12} lg={24} hidden>
                <Form.Item
                    name="trang_thai"
                    label="Trạng thái"
                    initialValue={1}
                >
                    <Select options={trangThaiSelect} />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default FormVaiTro;
