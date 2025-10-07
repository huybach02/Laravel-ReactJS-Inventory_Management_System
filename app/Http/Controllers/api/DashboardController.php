<?php

namespace App\Http\Controllers\api;

use App\Class\CustomResponse;
use App\Http\Controllers\Controller;
use App\Models\CauHinhChung;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
  public function index(Request $request)
  {
    try {
      // Lấy năm từ request, mặc định là năm hiện tại
      $year = $request->get('year', date('Y'));
      $dashboardData = DB::select("
        SELECT
            'Đơn hàng hôm nay' as chi_so,
            COUNT(*) as gia_tri,
            'đơn' as don_vi
        FROM don_hangs
        WHERE DATE(ngay_tao_don_hang) = CURDATE()

        UNION ALL

        SELECT
            'Doanh thu hôm nay',
            COALESCE(SUM(tong_tien_can_thanh_toan), 0),
            'VNĐ'
        FROM don_hangs
        WHERE DATE(ngay_tao_don_hang) = CURDATE()

        UNION ALL

        SELECT
            'Tổng số khách hàng',
            COUNT(*),
            'khách'
        FROM khach_hangs
        WHERE trang_thai = 1

        UNION ALL

        SELECT
            'Khách hàng mới hôm nay',
            COUNT(*),
            'khách'
        FROM khach_hangs
        WHERE DATE(created_at) = CURDATE()

        UNION ALL

        SELECT
            'Số nhà cung cấp',
            COUNT(*),
            'nhà cung cấp'
        FROM nha_cung_caps
        WHERE trang_thai = 1

        UNION ALL

        SELECT
            'Tổng số sản phẩm',
            COUNT(*),
            'sản phẩm'
        FROM san_phams
        WHERE trang_thai = 1

        UNION ALL

        SELECT
            'Sản phẩm sắp hết hàng',
            COUNT(DISTINCT sp.id),
            'sản phẩm'
        FROM san_phams sp
        LEFT JOIN (
            SELECT
                san_pham_id,
                SUM(so_luong_ton) as tong_so_luong_thuc_te
                FROM kho_tongs
                GROUP BY san_pham_id
        ) kt ON sp.id = kt.san_pham_id
        WHERE COALESCE(kt.tong_so_luong_thuc_te, 0) <= sp.so_luong_canh_bao
          AND sp.trang_thai = 1

        UNION ALL

        SELECT
            'Số công thức sản xuất',
            COUNT(*),
            'công thức'
        FROM cong_thuc_san_xuats
        WHERE trang_thai = 1
      ");

      // Tạo dữ liệu cho tất cả 12 tháng
      $allMonths = [];
      for ($i = 1; $i <= 12; $i++) {
        $month = str_pad($i, 2, '0', STR_PAD_LEFT);
        $allMonths[] = (object)[
          'Thang' => $year . '-' . $month,
          'TongDoanhThu' => 0,
          'SoLuongDonHang' => 0
        ];
      }

      // Lấy dữ liệu biểu đồ theo tháng từ database
      $chartDataFromDB = DB::select("
        SELECT
            DATE_FORMAT(ngay_tao_don_hang, '%Y-%m') AS Thang,
            SUM(tong_tien_can_thanh_toan) AS TongDoanhThu,
            COUNT(id) AS SoLuongDonHang
        FROM
            don_hangs
        WHERE
            YEAR(ngay_tao_don_hang) = ?
        GROUP BY
            Thang
        ORDER BY
            Thang
      ", [$year]);

      // Gộp dữ liệu thực tế với dữ liệu mặc định
      $chartData = $allMonths;
      foreach ($chartDataFromDB as $dbItem) {
        foreach ($chartData as $index => $item) {
          if ($item->Thang === $dbItem->Thang) {
            $chartData[$index] = $dbItem;
            break;
          }
        }
      }

      // Chuyển đổi dữ liệu thành format dễ sử dụng cho frontend
      $formattedData = [];
      foreach ($dashboardData as $item) {
        $formattedData[$item->chi_so] = [
          'gia_tri' => $item->gia_tri,
          'don_vi' => $item->don_vi
        ];
      }

      // Format dữ liệu biểu đồ với tên tháng tiếng Việt
      $monthNames = [
        '01' => 'Tháng 1', '02' => 'Tháng 2', '03' => 'Tháng 3', '04' => 'Tháng 4',
        '05' => 'Tháng 5', '06' => 'Tháng 6', '07' => 'Tháng 7', '08' => 'Tháng 8',
        '09' => 'Tháng 9', '10' => 'Tháng 10', '11' => 'Tháng 11', '12' => 'Tháng 12'
      ];

      $formattedChartData = [
        'labels' => [],
        'doanhThu' => [],
        'donHang' => [],
        'year' => $year
      ];

      foreach ($chartData as $item) {
        $monthNumber = substr($item->Thang, -2);
        $formattedChartData['labels'][] = $monthNames[$monthNumber];
        $formattedChartData['doanhThu'][] = (float) $item->TongDoanhThu;
        $formattedChartData['donHang'][] = (int) $item->SoLuongDonHang;
      }

      // Lấy top 10 sản phẩm bán chạy nhất
      $topSellingProducts = DB::select("
        SELECT
            sp.ma_san_pham,
            sp.ten_san_pham,
            SUM(ctdh.so_luong) AS TongSoLuongBan
        FROM
            chi_tiet_don_hangs ctdh
        JOIN
            san_phams sp ON ctdh.san_pham_id = sp.id
        GROUP BY
            sp.id, sp.ma_san_pham, sp.ten_san_pham
        ORDER BY
            TongSoLuongBan DESC
        LIMIT 10
      ");

      // Lấy top 10 sản phẩm có doanh thu cao nhất
      $topRevenueProducts = DB::select("
        SELECT
            sp.ma_san_pham,
            sp.ten_san_pham,
            SUM(ctdh.thanh_tien) AS TongDoanhThu
        FROM
            chi_tiet_don_hangs ctdh
        JOIN
            san_phams sp ON ctdh.san_pham_id = sp.id
        GROUP BY
            sp.id, sp.ma_san_pham, sp.ten_san_pham
        ORDER BY
            TongDoanhThu DESC
        LIMIT 10
      ");

      $result = [
        'statistics' => $formattedData,
        'chartData' => $formattedChartData,
        'topSellingProducts' => $topSellingProducts,
        'topRevenueProducts' => $topRevenueProducts
      ];

      return CustomResponse::success($result, 'Lấy dữ liệu thống kê thành công');
    } catch (\Exception $e) {
      return CustomResponse::error('Có lỗi xảy ra khi lấy dữ liệu thống kê: ' . $e->getMessage());
    }
  }
}