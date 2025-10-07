import { formatter } from "./utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const cardStyles = [
    {
        background: "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)",
        color: "#4a5568",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
        border: "1px solid #bfdbfe",
    },
    {
        background: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)",
        color: "#4a5568",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(236, 72, 153, 0.15)",
        border: "1px solid #f9a8d4",
    },
    {
        background: "linear-gradient(135deg, #cffafe 0%, #e0f2fe 100%)",
        color: "#4a5568",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(6, 182, 212, 0.15)",
        border: "1px solid #67e8f9",
    },
    {
        background: "linear-gradient(135deg, #dcfce7 0%, #ecfdf5 100%)",
        color: "#4a5568",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.15)",
        border: "1px solid #86efac",
    },
    {
        background: "linear-gradient(135deg, #fef3c7 0%, #fef7cd 100%)",
        color: "#4a5568",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)",
        border: "1px solid #fcd34d",
    },
    {
        background: "linear-gradient(135deg, #fed7d7 0%, #fef5e7 100%)",
        color: "#4a5568",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
        border: "1px solid #fca5a5",
    },
    {
        background: "linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 100%)",
        color: "#4a5568",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(147, 51, 234, 0.15)",
        border: "1px solid #c4b5fd",
    },
    {
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        color: "#4a5568",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(14, 165, 233, 0.15)",
        border: "1px solid #7dd3fc",
    },
];

export const sellingProductColumns = [
    {
        title: "STT",
        dataIndex: "index",
        key: "index",
        width: 60,
        align: "center" as const,
        render: (_: any, __: any, index: number) => index + 1,
    },
    {
        title: "Mã sản phẩm",
        dataIndex: "ma_san_pham",
        key: "ma_san_pham",
        width: 120,
    },
    {
        title: "Tên sản phẩm",
        dataIndex: "ten_san_pham",
        key: "ten_san_pham",
        ellipsis: true,
    },
    {
        title: "Số lượng bán",
        dataIndex: "TongSoLuongBan",
        key: "TongSoLuongBan",
        width: 120,
        align: "right" as const,
        render: (value: number) => formatter(value),
    },
];

export const revenueProductColumns = [
    {
        title: "STT",
        dataIndex: "index",
        key: "index",
        width: 60,
        align: "center" as const,
        render: (_: any, __: any, index: number) => index + 1,
    },
    {
        title: "Mã sản phẩm",
        dataIndex: "ma_san_pham",
        key: "ma_san_pham",
        width: 120,
    },
    {
        title: "Tên sản phẩm",
        dataIndex: "ten_san_pham",
        key: "ten_san_pham",
        ellipsis: true,
    },
    {
        title: "Doanh thu",
        dataIndex: "TongDoanhThu",
        key: "TongDoanhThu",
        width: 150,
        align: "right" as const,
        render: (value: number) => formatter(value) + " đ",
    },
];

export const chartDataConfig = (chartData: any) => {
    return {
        labels: chartData.labels,
        datasets: [
            {
                label: "Doanh thu",
                data: chartData.doanhThu,
                backgroundColor: "rgba(59, 130, 246, 0.6)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 2,
                yAxisID: "y",
                barThickness: 30,
            },
            {
                label: "Số lượng đơn hàng",
                data: chartData.donHang,
                backgroundColor: "rgba(34, 197, 94, 0.6)",
                borderColor: "rgba(34, 197, 94, 1)",
                borderWidth: 2,
                yAxisID: "y1",
                barThickness: 30,
            },
        ],
    };
};

export const chartOptions = (selectedYear: number) => {
    return {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: `Biểu đồ Doanh thu và Số lượng đơn hàng theo tháng (${selectedYear})`,
                font: {
                    size: 16,
                    weight: "bold" as const,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const label = context.dataset.label || "";
                        const value = context.parsed.y;
                        if (label === "Doanh thu") {
                            return `${label}: ${formatter(value)} đ`;
                        } else {
                            return `${label}: ${formatter(value)} đơn hàng`;
                        }
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Tháng",
                },
            },
            y: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
                title: {
                    display: true,
                    text: "Doanh thu (VNĐ)",
                },
                ticks: {
                    callback: function (value: any) {
                        return formatter(value) + " đ";
                    },
                },
            },
            y1: {
                type: "linear" as const,
                display: true,
                position: "right" as const,
                title: {
                    display: true,
                    text: "Số lượng đơn hàng",
                },
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    callback: function (value: any) {
                        return formatter(value) + " đơn";
                    },
                },
            },
        },
    };
};
