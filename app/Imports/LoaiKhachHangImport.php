<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Exception;

class LoaiKhachHangImport implements ToCollection
{
  protected $thanh_cong = 0;
  protected $that_bai = 0;

  /**
   * @param Collection $collection
   */
  public function collection(Collection $collection)
  {
    logger()->info($collection->toArray());
    $data = $collection->toArray();

    // Bỏ qua dòng đầu tiên (header)
    $data = array_slice($data, 1);

    foreach ($data as $item) {
      try {
        if (empty($item[0])) continue; // Bỏ qua nếu không có tên loại khách hàng

        \App\Models\LoaiKhachHang::create([
          'ten_loai_khach_hang' => $item[0] ?? "", // Cột A - Tên loại khách hàng
          'nguong_doanh_thu' => $item[1] ?? 0,     // Cột B - Ngưỡng doanh thu
          'trang_thai' => $item[2] ?? 1,           // Cột C - Trạng thái
        ]);
        $this->thanh_cong++;
      } catch (Exception $e) {
        logger()->error($e->getMessage());
        $this->that_bai++;
      }
    }
  }

  /**
   * Lấy số bản ghi thành công
   * @return int
   */
  public function getThanhCong()
  {
    return $this->thanh_cong;
  }

  /**
   * Lấy số bản ghi thất bại
   * @return int
   */
  public function getThatBai()
  {
    return $this->that_bai;
  }
}