/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Flex,
    Modal,
    Row,
    Typography,
    Upload as AntdUpload,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import { Download, Upload } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import axios from "../configs/axios";
import { toast } from "../utils/toast";
import { Spreadsheet } from "react-spreadsheet";
import { setReload } from "../redux/slices/main.slice";
import { useDispatch } from "react-redux";
import { apiURL } from "../configs/config";

interface Cell {
    value: string;
    readOnly: boolean;
}

type Data = (Cell | undefined)[][];

const ImportExcel = ({ path }: { path: string }) => {
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [data, setData] = useState<Data>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setIsModalOpen(false);
        setData([]);
        setFileList([]);
    };

    const onChange: UploadProps["onChange"] = async ({
        fileList: newFileList,
    }) => {
        // Đặt lại dữ liệu và danh sách tệp
        setData([]);
        setFileList([]);

        const acceptedExtensions = [".xlsx", ".xls"];
        const file = newFileList[0]?.originFileObj;

        if (!file) return;

        const fileExtension = getFileExtension(file.name);
        if (!acceptedExtensions.includes(fileExtension)) {
            return showError("Vui lòng chọn đúng định dạng file excel");
        }

        // Đặt danh sách tệp mới
        setFileList(newFileList);

        // Đọc và xử lý tệp mới
        return new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binaryStr = e.target?.result as string;
                const workbook = XLSX.read(binaryStr, { type: "binary" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];

                // Lấy dữ liệu từ Excel với header là A, B, C...
                const sheetData = XLSX.utils.sheet_to_json(worksheet, {
                    header: "A",
                });

                // Xác định số lượng cột tối đa
                let maxColumns = 0;
                sheetData.forEach((row: any) => {
                    const columnCount = Object.keys(row).length;
                    maxColumns = Math.max(maxColumns, columnCount);
                });

                // Chuyển đổi dữ liệu để hiển thị
                const formattedData = sheetData.map((row: any) => {
                    const rowArray = [];
                    // Đảm bảo tất cả các cột đều được xử lý đúng vị trí
                    for (let i = 0; i < maxColumns; i++) {
                        const columnKey = String.fromCharCode(65 + i); // A, B, C, ...
                        const cellValue = row[columnKey];
                        rowArray.push({
                            value:
                                cellValue !== undefined
                                    ? cellValue.toString()
                                    : "",
                            readOnly: true,
                        });
                    }
                    return rowArray;
                });

                // Cập nhật state với dữ liệu mới
                setData(formattedData);
                resolve();
            };
            reader.readAsBinaryString(file);
        });
    };

    const getFileExtension = (filename: string) =>
        `.${filename.split(".").pop()?.toLowerCase()}`;

    const showError = (message: string) => {
        toast.error(message);
    };

    const handleImport = async () => {
        if (fileList.length > 0) {
            const formData = new FormData();
            const file = fileList[0]?.originFileObj;
            if (!file) return;

            formData.append("file", file);
            try {
                setLoading(true);
                const response = await axios.post(
                    `${path}/import-excel`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                handleImportResponse(response);
            } catch (error: any) {
                toast.error(error.response.data.message);
            } finally {
                setIsModalOpen(false);
                setLoading(false);
            }
        }
    };

    const handleImportResponse = (response: any) => {
        if (response.success) {
            toast.success(response.message);
            dispatch(setReload());
        } else {
            toast.error(response.message);
        }
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
                            onClick={handleImport}
                            loading={loading}
                        >
                            Import
                        </Button>
                    </Row>,
                ]}
            >
                <Flex vertical gap={15}>
                    <Flex align="center" gap={10}>
                        <Typography.Title level={5}>
                            1. Tải xuống file excel mẫu:
                        </Typography.Title>
                        <Button
                            type="primary"
                            icon={<Download size={14} />}
                            onClick={() => {
                                // Kiểm tra và loại bỏ dấu / trùng lặp
                                const baseUrl = apiURL.endsWith("/")
                                    ? apiURL.slice(0, -1)
                                    : apiURL;
                                const pathSegment = path.startsWith("/")
                                    ? path
                                    : `/${path}`;
                                window.open(
                                    `${baseUrl}${pathSegment}/download-template-excel`
                                );
                            }}
                        >
                            Tải xuống file excel mẫu
                        </Button>
                    </Flex>
                    <Typography.Title level={5}>
                        2. Chỉnh sửa dữ liệu trong file excel theo mẫu
                    </Typography.Title>
                    <Flex align="center" gap={10}>
                        <Typography.Title level={5}>
                            3. Tải lên file excel sau khi đã chỉnh sửa
                        </Typography.Title>
                        <AntdUpload
                            onChange={onChange}
                            beforeUpload={() => false}
                            fileList={fileList}
                            accept=".xlsx,.xls"
                            maxCount={1}
                            onRemove={() => {
                                setFileList([]);
                                setData([]);
                                return true;
                            }}
                        >
                            <Button type="primary" icon={<Upload size={14} />}>
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
                            <div
                                style={{ overflowX: "auto", maxWidth: "100%" }}
                            >
                                <Spreadsheet data={data} />
                            </div>
                        </div>
                    )}
                </Flex>
            </Modal>
        </div>
    );
};

export default ImportExcel;
