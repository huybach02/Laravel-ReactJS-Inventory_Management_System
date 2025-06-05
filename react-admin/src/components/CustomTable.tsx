/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatter, parser } from "../utils/utils";
import {
    DatePicker,
    Form,
    Input,
    InputNumber,
    Pagination,
    Popconfirm,
    Select,
    Table,
} from "antd";
import locale from "antd/es/date-picker/locale/vi_VN";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "../utils/toast";

export type EditableTableProps = Parameters<typeof Table>[0];

export type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

const EditableContext = React.createContext<any>(null);

const EditableRow: React.FC = ({ ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    inputType,
    handleSave,
    data,
    ...restProps
}: any) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<any>(null);
    const form = useContext(EditableContext)!;

    const renderCell = () => {
        switch (inputType) {
            case "number":
                return (
                    <InputNumber
                        size="small"
                        ref={inputRef}
                        onPressEnter={save}
                        onBlur={save}
                        parser={parser}
                        formatter={formatter}
                        className="w-full"
                    />
                );
            case "date":
                return (
                    <DatePicker
                        size="small"
                        locale={locale}
                        ref={inputRef}
                        format="DD/MM/YYYY"
                        onBlur={save}
                        onChange={save}
                        className="w-full"
                    />
                );
            case "select":
                return (
                    <Select
                        options={data}
                        className="w-full"
                        ref={inputRef}
                        size="small"
                        onBlur={save}
                    />
                );
            default:
                return (
                    <Input
                        size="small"
                        ref={inputRef}
                        className="w-full"
                        onPressEnter={save}
                        onBlur={save}
                    />
                );
        }
    };

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        let fieldsValue: any = null;
        if (record) {
            fieldsValue = record;
        } else {
            return false;
        }
        if (inputType === "date") {
            Object.keys(fieldsValue).forEach((key) => {
                if (fieldsValue[key]) {
                    if (
                        /ngay_|_ngay/.test(key) ||
                        /ngay/.test(key) ||
                        /thoi_gian|_thoi/.test(key) ||
                        /birthday/.test(key)
                    ) {
                        fieldsValue[key] = moment(fieldsValue[key], "HH:mm:ss");
                    }
                }
            });
        }
        form.setFieldsValue({ [dataIndex]: fieldsValue[dataIndex] });
    };
    const [open, setOpen] = useState(false);

    const save = () => {
        setOpen(true);
    };

    const onConfirm = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
            setOpen(false);
        } catch (errInfo: any) {
            toast.error(errInfo);
        }
    };

    const onCancel = () => {
        setOpen(false);
        setEditing(false);
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Popconfirm
                title="Bạn có muốn lưu không"
                open={open}
                onConfirm={onConfirm}
                onCancel={onCancel}
            >
                <Form.Item
                    name={dataIndex}
                    rules={[
                        {
                            required: true,
                            message: `${title} không được bỏ trống.`,
                        },
                    ]}
                >
                    {renderCell()}
                </Form.Item>
            </Popconfirm>
        ) : (
            <div
                onClick={toggleEdit}
                className="px-[7px] cursor-pointer"
                role="presentation"
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

const CustomTable = ({
    defaultColumns,
    dataTable,
    handleSave,
    rowKey,
    rowSelection,
    filter,
    loading,
    scroll = { x: 1000 },
    handlePageChange,
    handleLimitChange,
    total,
    hidePagination = false,
}: any) => {
    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const columns = defaultColumns.map((col: any) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: any) => {
                return {
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    inputType: col.inputType,
                    data: col.data,
                    handleSave,
                };
            },
        };
    });

    return (
        <>
            <Table
                scroll={scroll}
                components={components}
                rowClassName={() => "editable-row"}
                bordered
                loading={loading}
                pagination={false}
                dataSource={dataTable}
                columns={columns as ColumnTypes}
                rowKey={rowKey}
                rowSelection={rowSelection}
            />
            {total && !hidePagination ? (
                <Pagination
                    current={filter?.page}
                    total={total}
                    pageSize={filter?.limit}
                    onChange={handlePageChange}
                    onShowSizeChange={(_current: any, pageSize: any) => {
                        if (filter && handleLimitChange) {
                            handleLimitChange(pageSize);
                        }
                    }}
                    showSizeChanger
                    defaultPageSize={filter?.limit}
                    showTotal={(total: any) => `Tổng cộng ${total} bản ghi`}
                />
            ) : null}
        </>
    );
};

export default CustomTable;
