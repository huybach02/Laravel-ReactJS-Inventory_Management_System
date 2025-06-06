/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Flex,
    Modal,
    Row,
    Typography,
    Upload as AntdUpload,
    Table,
} from "antd";
import type { UploadProps } from "antd";
import { Upload } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import ExportTableToExcel from "./ExportTableToExcel";
import { setReload } from "../redux/slices/main.slice";
import { useDispatch } from "react-redux";
import axios from "../configs/axios";
import { toast } from "../utils/toast";

interface ExcelData {
    [key: string]: string | number;
}

// Thêm function để kiểm tra và chuyển đổi ngày tháng Excel
const convertExcelDate = (excelDate: any): string => {
    // Kiểm tra nếu là số và có thể là Excel date serial number
    if (typeof excelDate === "number" && excelDate > 1) {
        try {
            // Chuyển đổi Excel serial number thành JavaScript Date
            const jsDate = XLSX.SSF.parse_date_code(excelDate);
            if (jsDate) {
                const date = new Date(
                    jsDate.y,
                    jsDate.m - 1,
                    jsDate.d,
                    jsDate.H || 0,
                    jsDate.M || 0,
                    jsDate.S || 0
                );
                // Format theo định dạng dd/mm/yyyy hh:mm
                return date.toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });
            }
        } catch (error) {
            console.log("Error converting date:", error);
        }
    }
    return excelDate?.toString() || "";
};

// Function để detect cột ngày tháng
const isDateColumn = (columnName: string): boolean => {
    const dateKeywords = [
        "ngày",
        "date",
        "time",
        "thời gian",
        "tạo",
        "cập nhật",
        "created",
        "updated",
    ];
    return dateKeywords.some((keyword) =>
        columnName.toLowerCase().includes(keyword.toLowerCase())
    );
};

const ImportExcel = ({
    columns,
    path,
    params = {},
}: {
    columns: any[];
    path: string;
    params: any;
}) => {
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [data, setData] = useState<ExcelData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleCancel = () => {
        setIsModalOpen(false);
        setData([]);
    };

    const handleImport: UploadProps["onChange"] = (info) => {
        setIsLoading(true);
        const file = (info.file.originFileObj || info.file) as File;
        setFile(file);

        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet) as ExcelData[];

            // Xử lý chuyển đổi ngày tháng
            const processedData = json.map((row) => {
                const processedRow: ExcelData = {};
                Object.keys(row).forEach((key) => {
                    if (isDateColumn(key)) {
                        processedRow[key] = convertExcelDate(row[key]);
                    } else {
                        processedRow[key] = row[key];
                    }
                });
                return processedRow;
            });

            setData(processedData);
        };
        setIsLoading(false);
    };

    const handleImportExcel = async () => {
        setIsImporting(true);
        const closeModel = () => {
            handleCancel();
            dispatch(setReload());
        };

        const formData = new FormData();
        formData.append("file", file as File);

        axios
            .post(`${path}/import-excel`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res: any) => {
                toast.success(res.message);
                closeModel();
            })
            .catch((error) => {
                toast.error("Upload thất bại");
                console.error(error);
            })
            .finally(() => {
                setIsImporting(false);
            });
    };

    return (
        <div>
            <Button
                type="default"
                icon={<Upload size={14} />}
                onClick={() => setIsModalOpen(true)}
            >
                Import Excel
            </Button>

            <Modal
                title={`Import Excel`}
                open={isModalOpen}
                width={1200}
                onCancel={handleCancel}
                maskClosable={false}
                centered
                footer={[
                    <Row justify="end" key="footer">
                        <Button
                            key="submit"
                            type="primary"
                            size="large"
                            loading={isImporting}
                            onClick={handleImportExcel}
                        >
                            Import
                        </Button>
                    </Row>,
                ]}
            >
                <Flex vertical gap={10}>
                    <Flex align="center" gap={10}>
                        <Typography.Title level={5}>
                            1. Tải xuống file excel mẫu:
                        </Typography.Title>
                        <ExportTableToExcel
                            columns={columns}
                            path={path}
                            params={params}
                        />
                    </Flex>
                    <Flex align="center" gap={10}>
                        <Typography.Title level={5}>
                            2. Tải lên file excel sau khi đã chỉnh sửa
                        </Typography.Title>
                        <AntdUpload
                            onChange={handleImport}
                            beforeUpload={() => false}
                            showUploadList={false}
                        >
                            <Button
                                type="primary"
                                icon={<Upload size={14} />}
                                loading={isLoading}
                            >
                                Tải lên file excel
                            </Button>
                        </AntdUpload>
                    </Flex>

                    {data.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <Typography.Title
                                level={5}
                                style={{ marginBottom: 16 }}
                            >
                                Dữ liệu preview:
                            </Typography.Title>
                            <Table
                                dataSource={data.map((item, index) => ({
                                    ...item,
                                    key: index,
                                }))}
                                columns={Object.keys(data[0]).map((key) => ({
                                    title: key,
                                    dataIndex: key,
                                    key: key,
                                    ellipsis: true,
                                    render: (text: any) => (
                                        <span title={text}>{text}</span>
                                    ),
                                }))}
                                size="small"
                                scroll={{ x: "max-content", y: 400 }}
                                pagination={false}
                                bordered
                                style={{
                                    backgroundColor: "#fafafa",
                                    borderRadius: 8,
                                }}
                            />
                        </div>
                    )}
                </Flex>
            </Modal>
        </div>
    );
};

export default ImportExcel;
