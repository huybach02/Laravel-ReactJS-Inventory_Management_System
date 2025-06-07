/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, type CSSProperties } from "react";
import { camelCasePathUrl } from "../utils/utils";
import { getListData } from "../services/getData.api";
import { toast } from "../utils/toast";
import { Button } from "antd";
import excelIcon from "../assets/excel.svg";
import * as XLSX from "xlsx";

interface Column {
    title: string;
    dataIndex?: string;
    align?: "left" | "right" | "center";
    width?: string;
    render?: (value: any, record: any, index: number) => React.ReactNode;
    exportTitle?: string;
    exportData?: string | ((record: any) => any);
}

interface TableProps {
    columns: Column[];
    fileName?: string;
    path: string;
    params: any;
    style?: CSSProperties;
}

const ExportTableToExcel: React.FC<TableProps> = ({
    columns,
    fileName,
    path,
    params,
    style,
}) => {
    columns = columns.filter(
        (item) => item.title?.toLowerCase() !== "thao tác" && item.title
    );
    const [dataExport, setDataExport] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldExport, setShouldExport] = useState(false);

    const exportToRealExcel = () => {
        // Tạo workbook mới
        const workbook = XLSX.utils.book_new();

        // Tạo header row - sử dụng exportTitle nếu có, không thì dùng title
        const headers = columns.map((col) => col.exportTitle || col.title);

        // Tạo data rows - xử lý cả trường hợp không có dữ liệu
        const rows = dataExport.map((record) =>
            columns.map((column) => {
                const { dataIndex, exportData } = column;
                // Chỉ lấy dữ liệu gốc từ API, bỏ qua render function
                return exportData
                    ? typeof exportData === "function"
                        ? exportData(record)
                        : record[exportData]
                    : dataIndex
                    ? record[dataIndex]
                    : "";
            })
        );

        // Kết hợp header và data - luôn có ít nhất header
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Export file Excel binary thật sự
        XLSX.writeFile(workbook, `${fileName || camelCasePathUrl(path)}.xlsx`);
    };

    const exportTable = async () => {
        try {
            setIsLoading(true);
            const danhSach = await getListData(path, { ...params, limit: -1 });
            setDataExport(danhSach.data);
            setShouldExport(true);
        } catch {
            toast.error("Có lỗi xảy ra vui lòng thử lại sau");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (shouldExport) {
            exportToRealExcel();
            setDataExport([]);
            setShouldExport(false);
        }
    }, [shouldExport, dataExport]);

    return (
        <Button
            icon={
                <img
                    src={excelIcon}
                    alt="excel"
                    style={{ width: "35px", height: "35px" }}
                />
            }
            onClick={exportTable}
            style={style ? style : { float: "right", border: "none" }}
            loading={isLoading}
        />
    );
};

export default ExportTableToExcel;
