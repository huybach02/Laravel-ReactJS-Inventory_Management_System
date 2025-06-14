<?php

namespace App\Modules\PhieuNhapKho;

use App\Models\PhieuNhapKho;
use Illuminate\Support\Facades\DB;
use Exception;
use App\Class\CustomResponse;
use App\Class\FilterWithPagination;
use App\Class\Helper;
use App\Models\ChiTietPhieuNhapKho;
use App\Models\KhoTong;
use App\Models\SanPham;

class PhieuNhapKhoService
{
  /**
   * Lấy tất cả dữ liệu
   */
  public function getAll(array $params = [])
  {
    try {
      // Tạo query cơ bản
      $query = PhieuNhapKho::query()->with('images');

      // Sử dụng FilterWithPagination để xử lý filter và pagination
      $result = FilterWithPagination::findWithPagination(
        $query,
        $params,
        ['phieu_nhap_khos.*'] // Columns cần select
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
    return PhieuNhapKho::with('images')->find($id);
  }

  /**
   * Tạo mới dữ liệu
   */
  public function create(array $data)
  {
    try {
      DB::beginTransaction();

      $tongTienHang = 0;
      $tongChietKhau = 0;

      $checkNgayNhapKho = $data['ngay_nhap_kho'] <= date('Y-m-d');

      foreach ($data['danh_sach_san_pham'] as $key => $chiTiet) {
        $sanPham = SanPham::find($chiTiet['san_pham_id']);

        $tongTienNhap = $chiTiet['gia_nhap'] * $chiTiet['so_luong_nhap'];
        $tongChietKhau = $tongTienNhap * $chiTiet['chiet_khau'] / 100;
        $thanhTienSauChietKhau = $tongTienNhap - $tongChietKhau;
        $giaVonDonVi = $thanhTienSauChietKhau / $chiTiet['so_luong_nhap'];
        $giaBanLeDonVi = $giaVonDonVi * (1 + $sanPham->muc_loi_nhuan / 100);
        $loiNhuanBanLe = $giaBanLeDonVi - $giaVonDonVi;

        $tongTienHang += $thanhTienSauChietKhau;
        $tongChietKhau += $tongChietKhau;

        $data['danh_sach_san_pham'][$key]['nha_cung_cap_id'] = $data['nha_cung_cap_id'];
        $data['danh_sach_san_pham'][$key]['tong_tien_nhap'] = $tongTienNhap;
        $data['danh_sach_san_pham'][$key]['gia_von_don_vi'] = $giaVonDonVi;
        $data['danh_sach_san_pham'][$key]['gia_ban_le_don_vi'] = $giaBanLeDonVi;
        $data['danh_sach_san_pham'][$key]['loi_nhuan_ban_le'] = $loiNhuanBanLe;
      }

      $tongTienTruocThueVAT = $tongTienHang + ($data['chi_phi_nhap_hang'] ?? 0) - ($data['giam_gia_nhap_hang'] ?? 0);
      $tongThueVat = $tongTienTruocThueVAT * ($data['thue_vat'] ?? 0) / 100;
      $tongTien = $tongTienTruocThueVAT + $tongThueVat;

      $data['tong_tien_hang'] = $tongTienHang;
      $data['tong_chiet_khau'] = $tongChietKhau;
      $data['tong_tien'] = $tongTien;

      $dataCreate = $data;
      unset($dataCreate['danh_sach_san_pham']);
      $result = PhieuNhapKho::create($dataCreate);

      foreach ($data['danh_sach_san_pham'] as $chiTiet) {
        $chiTiet['phieu_nhap_kho_id'] = $result->id;
        $chiTiet['ma_lo_san_pham'] = Helper::generateMaLoSanPham();
        ChiTietPhieuNhapKho::create($chiTiet);
        if ($checkNgayNhapKho) {
          KhoTong::create([
            'ma_lo_san_pham' => $chiTiet['ma_lo_san_pham'],
            'san_pham_id' => $chiTiet['san_pham_id'],
            'so_luong_ton' => $chiTiet['so_luong_nhap'],
          ]);
        }
      }

      DB::commit();
      return $result;
    } catch (Exception $e) {
      DB::rollBack();
      return CustomResponse::error($e->getMessage());
    }
  }

  /**
   * Cập nhật dữ liệu
   */
  public function update($id, array $data)
  {
    try {
      $model = PhieuNhapKho::findOrFail($id);
      $model->update($data);

      // TODO: Cập nhật ảnh vào bảng images (nếu có)
      // if ($data['image']) {
      //   $model->images()->get()->each(function ($image) use ($data) {
      //     $image->update([
      //       'path' => $data['image'],
      //     ]);
      //   });
      // }


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
      $model = PhieuNhapKho::findOrFail($id);

      // TODO: Xóa ảnh vào bảng images (nếu có)
      // $model->images()->get()->each(function ($image) {
      //   $image->delete();
      // });

      return $model->delete();
    } catch (Exception $e) {
      return CustomResponse::error($e->getMessage());
    }
  }

  /**
   * Lấy danh sách PhieuNhapKho dạng option
   */
  public function getOptions()
  {
    return PhieuNhapKho::select('id as value', 'ten_phieu_nhap_kho as label')->get();
  }
}