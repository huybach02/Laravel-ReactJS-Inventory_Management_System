/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, type CSSProperties } from "react";
import { useDownloadExcel } from "react-export-table-to-excel";
import { v4 as uuidv4 } from "uuid";
import { camelCasePathUrl } from "../utils/utils";
import { getListData } from "../services/getData.api";
import { toast } from "../utils/toast";
import { Button } from "antd";
import excelIcon from "../assets/excel.svg";

interface Column {
    title: string;
    dataIndex?: string;
    align?: "left" | "right" | "center";
    width?: string;
    render?: (value: any, record: any, index: number) => React.ReactNode;
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
    const tableRef = useRef<any>(null);
    const [dataExport, setDataExport] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { onDownload } = useDownloadExcel({
        currentTableRef: tableRef.current,
        filename: fileName ? fileName : camelCasePathUrl(path),
        sheet: "Sheet1",
    });

    const exportTable = async () => {
        try {
            setIsLoading(true);
            const danhSach = await getListData(path, { ...params, limit: -1 });
            setDataExport(danhSach.data);
        } catch {
            toast.error("Có lỗi xảy ra vui lòng thử lại sau");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (dataExport?.length > 0) {
            onDownload();
            setDataExport([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataExport]);

    return (
        <>
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

            <div
                style={{
                    display: "none",
                    width: "100%",
                    height: "50vh",
                    overflowX: "auto",
                    overflowY: "auto",
                    border: "1px solid #ccc",
                }}
            >
                <table
                    border={1}
                    ref={tableRef}
                    style={{ width: "100%", borderCollapse: "collapse" }}
                >
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={uuidv4()}
                                    align="center"
                                    style={{
                                        width: column.width || "auto",
                                        padding: "10px",
                                    }}
                                >
                                    {column.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataExport.map((record, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((column) => {
                                    const { dataIndex, render } = column;
                                    const value = dataIndex
                                        ? record[dataIndex]
                                        : record;
                                    return (
                                        <td
                                            key={uuidv4()}
                                            style={{
                                                textAlign:
                                                    column.align || "left",
                                                padding: "10px",
                                            }}
                                        >
                                            {render
                                                ? render(
                                                      value,
                                                      record,
                                                      rowIndex
                                                  )
                                                : value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ExportTableToExcel;
