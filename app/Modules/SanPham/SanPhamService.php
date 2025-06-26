<?php

namespace App\Modules\SanPham;

use App\Models\SanPham;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;
use App\Class\CustomResponse;
use App\Class\FilterWithPagination;
use App\Models\KhoTong;

class SanPhamService
{
  /**
   * Lấy tất cả dữ liệu
   */
  public function getAll(array $params = [])
  {
    try {
      // Tạo query cơ bản
      $query = SanPham::query()->with('images', 'danhMuc:id,ten_danh_muc');

      // Sử dụng FilterWithPagination để xử lý filter và pagination
      $result = FilterWithPagination::findWithPagination(
        $query,
        $params,
        ['san_phams.*'] // Columns cần select
      );

      return [
        'data' => $result['collection'],
        'total' => $result['total'],
        'pagination' => [
          'current_page' => $result['current_page'],
          'last_page' => $result['last_page'],
          'from' => $result['from'],
          'to' => $result['to'],
          'total_current' => $result['total_current']
        ]
      ];
    } catch (Exception $e) {
      throw new Exception('Lỗi khi lấy danh sách: ' . $e->getMessage());
    }
  }

  /**
   * Lấy dữ liệu theo ID
   */
  public function getById($id)
  {
    $data = SanPham::with([
      'images',
      'donViTinhs' => function ($query) {
        $query->withoutGlobalScope('withUserNames')->select('don_vi_tinhs.id as value', 'ten_don_vi as label');
      },
      'nhaCungCaps' => function ($query) {
        $query->withoutGlobalScope('withUserNames')->select('nha_cung_caps.id as value', 'ten_nha_cung_cap as label');
      },
      'danhMuc'
    ])->find($id);
    if (!$data) {
      return CustomResponse::error('Dữ liệu không tồn tại');
    }
    return $data;
  }

  /**
   * Tạo mới dữ liệu
   */
  public function create(array $data)
  {
    try {
      $result = SanPham::create([
        'ma_san_pham' => $data['ma_san_pham'],
        'ten_san_pham' => $data['ten_san_pham'],
        'danh_muc_id' => $data['danh_muc_id'],
        'gia_nhap_mac_dinh' => $data['gia_nhap_mac_dinh'],
        'ty_le_chiet_khau' => $data['ty_le_chiet_khau'],
        'muc_loi_nhuan' => $data['muc_loi_nhuan'],
        'so_luong_canh_bao' => $data['so_luong_canh_bao'],
        'ghi_chu' => $data['ghi_chu'] ?? null,
        'trang_thai' => $data['trang_thai'],
      ]);

      if (isset($data['don_vi_tinh_id'])) {
        $result->donViTinhs()->attach($data['don_vi_tinh_id'], [
          'nguoi_tao' => Auth::user()->id,
          'nguoi_cap_nhat' => Auth::user()->id
        ]);
      }

      if (isset($data['nha_cung_cap_id'])) {
        $result->nhaCungCaps()->attach($data['nha_cung_cap_id'], [
          'nguoi_tao' => Auth::user()->id,
          'nguoi_cap_nhat' => Auth::user()->id
        ]);
      }

      // TODO: Thêm ảnh vào bảng images (nếu có)
      if ($data['image']) {
        $result->images()->create([
          'path' => $data['image'],
        ]);
      }

      return $result;
    } catch (Exception $e) {
      return CustomResponse::error($e->getMessage());
    }
  }

  /**
   * Cập nhật dữ liệu
   */
  public function update($id, array $data)
  {
    try {
      $model = SanPham::findOrFail($id);

      $sanPhamData = $data;
      unset($sanPhamData['don_vi_tinh_id']);
      unset($sanPhamData['nha_cung_cap_id']);

      $model->update($sanPhamData);

      // TODO: Cập nhật ảnh vào bảng images (nếu có)
      if ($data['image']) {
        $model->images()->get()->each(function ($image) use ($data) {
          $image->update([
            'path' => $data['image'],
          ]);
        });
      }

      if (isset($data['don_vi_tinh_id'])) {
        $model->donViTinhs()->sync($data['don_vi_tinh_id'], [
          'nguoi_tao' => Auth::user()->id,
          'nguoi_cap_nhat' => Auth::user()->id
        ]);
      }

      if (isset($data['nha_cung_cap_id'])) {
        $model->nhaCungCaps()->sync($data['nha_cung_cap_id'], [
          'nguoi_tao' => Auth::user()->id,
          'nguoi_cap_nhat' => Auth::user()->id
        ]);
      }

      return $model->fresh();
    } catch (Exception $e) {
      return CustomResponse::error($e->getMessage());
    }
  }


  /**
   * Xóa dữ liệu
   */
  public function delete($id)
  {
    try {
      $model = SanPham::findOrFail($id);

      // TODO: Xóa ảnh vào bảng images (nếu có)
      $model->images()->get()->each(function ($image) {
        $image->delete();
      });

      $model->donViTinhs()->detach();
      $model->nhaCungCaps()->detach();

      return $model->delete();
    } catch (Exception $e) {
      return CustomResponse::error($e->getMessage());
    }
  }

  /**
   * Lấy danh sách SanPham dạng option
   */
  public function getOptions()
  {
    return SanPham::select('id as value', 'ten_san_pham as label')->get();
  }

  /**
   * Lấy danh sách SanPham dạng option theo NhaCungCap
   */
  public function getOptionsByNhaCungCap($nhaCungCapId)
  {
    return SanPham::whereHas('nhaCungCaps', function ($query) use ($nhaCungCapId) {
      $query->withoutGlobalScope('withUserNames')
        ->where('nha_cung_caps.id', $nhaCungCapId);
    })
      ->withoutGlobalScope('withUserNames')
      ->select('san_phams.id as value', 'san_phams.ten_san_pham as label')
      ->get();
  }

  /**
   * Lấy danh sách LoSanPham dạng option theo SanPham
   */
  public function getOptionsLoSanPhamBySanPhamId($sanPhamId)
  {
    $loSanPham = KhoTong::where('kho_tongs.san_pham_id', $sanPhamId)
      ->leftJoin('chi_tiet_phieu_nhap_khos', 'kho_tongs.ma_lo_san_pham', '=', 'chi_tiet_phieu_nhap_khos.ma_lo_san_pham')
      ->withoutGlobalScope('withUserNames')
      ->select(
        'kho_tongs.ma_lo_san_pham as value',
        DB::raw('CONCAT(kho_tongs.ma_lo_san_pham, " - NSX: ", DATE_FORMAT(chi_tiet_phieu_nhap_khos.ngay_san_xuat, "%d/%m/%Y"), " - HSD: ", DATE_FORMAT(chi_tiet_phieu_nhap_khos.ngay_het_han, "%d/%m/%Y"), " - SL Tồn: ", kho_tongs.so_luong_ton, " - HSD Còn lại: ", DATEDIFF(chi_tiet_phieu_nhap_khos.ngay_het_han, CURDATE()), " ngày") as label'),
        DB::raw('DATEDIFF(chi_tiet_phieu_nhap_khos.ngay_het_han, CURDATE()) as hsd_con_lai')
      )
      ->orderBy('hsd_con_lai', 'asc')
      ->get();

    return $loSanPham;
  }
}