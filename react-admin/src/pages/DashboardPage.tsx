/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Select, Table } from "antd";
import { Col } from "antd";
import { Row } from "antd";
import Heading from "../components/heading";
import { API_ROUTE_CONFIG } from "../configs/api-route-config";
import { getListData } from "../services/getData.api";
import { useEffect, useState, useCallback } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
    cardStyles,
    chartDataConfig,
    chartOptions,
    revenueProductColumns,
    sellingProductColumns,
} from "../utils/dashboard";
import { useResponsive } from "../hooks/useReponsive";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const path = API_ROUTE_CONFIG.DASHBOARD;

const DashboardPage = () => {
    const [data, setData] = useState<any>({});
    const [chartData, setChartData] = useState<any>({
        labels: [],
        doanhThu: [],
        donHang: [],
        year: new Date().getFullYear(),
    });
    const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
    const [topRevenueProducts, setTopRevenueProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );
    const { isMobile } = useResponsive();

    // Lấy dữ liệu ban đầu (cards và bảng - không phụ thuộc năm)
    const getInitialData = useCallback(async () => {
        try {
            setLoading(true);
            const currentYear = new Date().getFullYear();
            const url = `${path}?year=${currentYear}`;
            const res: any = await getListData(url);
            if (res) {
                setData(res.statistics || {});
                setChartData(
                    res.chartData || {
                        labels: [],
                        doanhThu: [],
                        donHang: [],
                        year: currentYear,
                    }
                );
                setTopSellingProducts(res.topSellingProducts || []);
                setTopRevenueProducts(res.topRevenueProducts || []);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        } finally {
            setLoading(false);
        }
    }, []); // Không có dependency để tránh chạy lại khi selectedYear thay đổi

    // Lấy dữ liệu biểu đồ theo năm (chỉ chart data)
    const getChartData = useCallback(async (year: number) => {
        try {
            setChartLoading(true);
            const url = `${path}?year=${year}`;
            const res: any = await getListData(url);
            if (res) {
                // Chỉ cập nhật dữ liệu biểu đồ
                setChartData(
                    res.chartData || {
                        labels: [],
                        doanhThu: [],
                        donHang: [],
                        year: year,
                    }
                );
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu biểu đồ:", error);
        } finally {
            setChartLoading(false);
        }
    }, []);

    // Khởi tạo dữ liệu ban đầu
    useEffect(() => {
        getInitialData();
    }, [getInitialData]);

    // Xử lý thay đổi năm - chỉ cập nhật biểu đồ
    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        getChartData(year);
    };

    // Tạo danh sách các năm (từ 2020 đến năm hiện tại + 1)
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 2020; year <= currentYear + 1; year++) {
            years.push({
                label: `Năm ${year}`,
                value: year,
            });
        }
        return years.reverse(); // Năm mới nhất lên đầu
    };

    // Hàm format số tiền VNĐ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    // Hàm format số với dấu phẩy
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("vi-VN").format(num);
    };

    return (
        <>
            <Heading title="Tổng quan" />
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                    <Card
                        title="Đơn hàng hôm nay"
                        variant="borderless"
                        style={cardStyles[1]}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{ color: "#4a5568" }}
                        loading={loading}
                    >
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            {data["Đơn hàng hôm nay"]
                                ? formatNumber(data["Đơn hàng hôm nay"].gia_tri)
                                : "0"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                            {data["Đơn hàng hôm nay"]?.don_vi || "đơn"}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                    <Card
                        title="Doanh thu hôm nay"
                        variant="borderless"
                        style={cardStyles[2]}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{ color: "#4a5568" }}
                        loading={loading}
                    >
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            {data["Doanh thu hôm nay"]
                                ? formatCurrency(
                                      data["Doanh thu hôm nay"].gia_tri
                                  )
                                : "₫0"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                            hôm nay
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                    <Card
                        title="Tổng số khách hàng"
                        variant="borderless"
                        style={cardStyles[0]}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{ color: "#4a5568" }}
                        loading={loading}
                    >
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            {data["Tổng số khách hàng"]
                                ? formatNumber(
                                      data["Tổng số khách hàng"].gia_tri
                                  )
                                : "0"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                            {data["Tổng số khách hàng"]?.don_vi || "khách"}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                    <Card
                        title="Khách hàng mới hôm nay"
                        variant="borderless"
                        style={cardStyles[3]}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{ color: "#4a5568" }}
                        loading={loading}
                    >
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            {data["Khách hàng mới hôm nay"]
                                ? formatNumber(
                                      data["Khách hàng mới hôm nay"].gia_tri
                                  )
                                : "0"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                            {data["Khách hàng mới hôm nay"]?.don_vi || "khách"}{" "}
                            mới
                        </div>
                    </Card>
                </Col>
            </Row>
            <Row
                gutter={[16, 16]}
                style={{ marginTop: isMobile ? "12px" : "16px" }}
            >
                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                    <Card
                        title="Số nhà cung cấp"
                        variant="borderless"
                        style={cardStyles[4]}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{ color: "#4a5568" }}
                        loading={loading}
                    >
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            {data["Số nhà cung cấp"]
                                ? formatNumber(data["Số nhà cung cấp"].gia_tri)
                                : "0"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                            {data["Số nhà cung cấp"]?.don_vi || "nhà cung cấp"}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                    <Card
                        title="Tổng số sản phẩm"
                        variant="borderless"
                        style={cardStyles[6]}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{ color: "#4a5568" }}
                        loading={loading}
                    >
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            {data["Tổng số sản phẩm"]
                                ? formatNumber(data["Tổng số sản phẩm"].gia_tri)
                                : "0"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                            {data["Tổng số sản phẩm"]?.don_vi || "sản phẩm"}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                    <Card
                        title="Sản phẩm/nguyên liệu sắp hết hàng"
                        variant="borderless"
                        style={cardStyles[5]}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{ color: "#4a5568" }}
                        loading={loading}
                    >
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            {data["Sản phẩm sắp hết hàng"]
                                ? formatNumber(
                                      data["Sản phẩm sắp hết hàng"].gia_tri
                                  )
                                : "0"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                            {data["Sản phẩm sắp hết hàng"]?.don_vi ||
                                "sản phẩm"}
                            /nguyên liệu cần nhập thêm
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                    <Card
                        title="Số công thức sản xuất"
                        variant="borderless"
                        style={cardStyles[7]}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{ color: "#4a5568" }}
                        loading={loading}
                    >
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            {data["Số công thức sản xuất"]
                                ? formatNumber(
                                      data["Số công thức sản xuất"].gia_tri
                                  )
                                : "0"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                            {data["Số công thức sản xuất"]?.don_vi ||
                                "công thức"}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ */}
            <Row style={{ marginTop: isMobile ? "16px" : "24px" }}>
                <Col span={24}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            justifyContent: "space-between",
                            alignItems: isMobile ? "flex-start" : "center",
                            marginBottom: "16px",
                            gap: isMobile ? "12px" : "0",
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontSize: isMobile ? "16px" : "18px",
                                fontWeight: "600",
                                color: "#2d3748",
                            }}
                        >
                            Biểu đồ Doanh thu và Đơn hàng theo tháng
                        </h3>
                        <Select
                            value={selectedYear}
                            onChange={handleYearChange}
                            options={generateYearOptions()}
                            style={{ width: isMobile ? "100%" : 150 }}
                            placeholder="Chọn năm"
                            disabled={chartLoading}
                        />
                    </div>
                    <Card
                        title={null}
                        variant="borderless"
                        style={{
                            background:
                                "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                            border: "1px solid #e2e8f0",
                        }}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "1px solid #e2e8f0",
                            fontSize: "18px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{
                            padding: isMobile ? "12px" : "24px",
                            minHeight: isMobile ? "300px" : "400px",
                        }}
                        loading={chartLoading}
                    >
                        {!chartLoading &&
                        !loading &&
                        chartData.labels.length > 0 ? (
                            <div
                                style={{
                                    position: "relative",
                                    height: isMobile ? "250px" : "350px",
                                    width: "100%",
                                }}
                            >
                                <Bar
                                    data={chartDataConfig(chartData, isMobile)}
                                    options={chartOptions(
                                        selectedYear,
                                        isMobile
                                    )}
                                />
                            </div>
                        ) : !chartLoading && !loading ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "60px 0",
                                    color: "#718096",
                                    fontSize: "16px",
                                }}
                            >
                                Không có dữ liệu để hiển thị biểu đồ
                            </div>
                        ) : null}
                    </Card>
                </Col>
            </Row>

            {/* Bảng thống kê sản phẩm */}
            <Row
                gutter={[16, 16]}
                style={{ marginTop: isMobile ? "16px" : "24px" }}
            >
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Card
                        title="Top 10 sản phẩm bán chạy nhất"
                        variant="borderless"
                        style={{
                            background:
                                "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(14, 165, 233, 0.1)",
                            border: "1px solid #bae6fd",
                        }}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "1px solid #bae6fd",
                            fontSize: "14px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{
                            padding: isMobile ? "12px" : "16px",
                        }}
                        loading={loading}
                    >
                        <Table
                            columns={sellingProductColumns}
                            dataSource={topSellingProducts}
                            pagination={false}
                            size="small"
                            rowKey="ma_san_pham"
                            scroll={{
                                y: isMobile ? 300 : 400,
                                x: isMobile ? 300 : undefined,
                            }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Card
                        title="Top 10 sản phẩm có doanh thu cao nhất"
                        variant="borderless"
                        style={{
                            background:
                                "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.1)",
                            border: "1px solid #86efac",
                        }}
                        headStyle={{
                            color: "#2d3748",
                            borderBottom: "1px solid #86efac",
                            fontSize: "14px",
                            fontWeight: "600",
                        }}
                        bodyStyle={{
                            padding: isMobile ? "12px" : "16px",
                        }}
                        loading={loading}
                    >
                        <Table
                            columns={revenueProductColumns}
                            dataSource={topRevenueProducts}
                            pagination={false}
                            size="small"
                            rowKey="ma_san_pham"
                            scroll={{
                                y: isMobile ? 300 : 400,
                                x: isMobile ? 300 : undefined,
                            }}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default DashboardPage;
