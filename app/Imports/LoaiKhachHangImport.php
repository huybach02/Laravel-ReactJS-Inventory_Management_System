<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class LoaiKhachHangImport implements ToCollection, WithHeadingRow
{
  /**
   * @param Collection $collection
   */
  public function collection(Collection $collection)
  {
    $data = $collection->toArray();
    foreach ($data as $item) {
      \App\Models\LoaiKhachHang::create([
        'ten_loai_khach_hang' => $item["ten_loai_khach_hang"],
        'nguong_doanh_thu' => $item["nguong_doanh_thu"],
        'trang_thai' => $item["trang_thai"],
      ]);
    }
  }
}