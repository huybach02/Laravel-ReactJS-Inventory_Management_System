/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import React from "react";
import { deleteData } from "../services/deleteData.api";

interface IProps {
    id: number;
    path: string;
    onShow: () => void;
    children?: any;
    title?: string;
}

const Delete: React.FC<IProps> = ({ id, onShow, path, children, title }) => {
    const onDelete = async () => {
        await deleteData(path, id);
        onShow();
    };
    return (
        <Popconfirm
            title={`Bạn có muốn xoá ${title ? title : ""} không?`}
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={onDelete}
        >
            {children ? (
                children
            ) : (
                <Button
                    size="small"
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    title="Xoá"
                    style={{ marginLeft: 5 }}
                ></Button>
            )}
        </Popconfirm>
    );
};

export default Delete;
