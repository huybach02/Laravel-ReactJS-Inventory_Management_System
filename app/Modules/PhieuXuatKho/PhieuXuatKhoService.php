<?php

namespace App\Modules\PhieuXuatKho;

use App\Models\PhieuXuatKho;
use Illuminate\Support\Facades\DB;
use Exception;
use App\Class\CustomResponse;
use App\Class\FilterWithPagination;
use App\Models\ChiTietDonHang;
use App\Models\ChiTietPhieuNhapKho;
use App\Models\ChiTietPhieuXuatKho;
use App\Models\DonHang;
use App\Models\KhoTong;
use App\Models\SanPham;

class PhieuXuatKhoService
{
  /**
   * Lấy tất cả dữ liệu
   */
  public function getAll(array $params = [])
  {
    try {
      // Tạo query cơ bản
      $query = PhieuXuatKho::query()
        ->withoutGlobalScope('withUserNames')
        ->leftJoin('don_hangs', 'phieu_xuat_khos.don_hang_id', '=', 'don_hangs.id')
        ->leftJoin('users', 'phieu_xuat_khos.nguoi_tao', '=', 'users.id')
        ->leftJoin('users as users_update', 'phieu_xuat_khos.nguoi_cap_nhat', '=', 'users_update.id');

      // Sử dụng FilterWithPagination để xử lý filter và pagination
      $result = FilterWithPagination::findWithPagination(
        $query,
        $params,
        ['phieu_xuat_khos.*', 'don_hangs.ma_don_hang', 'users.name as ten_nguoi_tao', 'users_update.name as ten_nguoi_cap_nhat'] // Columns cần select
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
    $data = PhieuXuatKho::with('images', 'chiTietPhieuXuatKhos')->find($id);
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
      DB::beginTransaction();
      switch ($data['loai_phieu_xuat']) {
        case 1: // Xuất bán theo đơn hàng
          $tongTien = 0;

          $donHang = DonHang::find($data['don_hang_id']);

          foreach ($data['danh_sach_san_pham'] as $sanPham) {
            // Kiểm tra lô sản phẩm tồn tại
            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->first();

            $tongTien += $sanPham['so_luong'] * $loSanPham->gia_ban_le_don_vi;
          }

          $data['tong_tien'] = $tongTien;

          $dataSave = $data;
          unset($dataSave['danh_sach_san_pham']);
          $result = PhieuXuatKho::create($dataSave);

          foreach ($data['danh_sach_san_pham'] as $sanPham) {
            $chiTietDonHang = ChiTietDonHang::where([
              'don_hang_id' => $data['don_hang_id'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->first();

            if (!$chiTietDonHang) {
              return CustomResponse::error('Sản phẩm không tồn tại trong đơn hàng');
            }

            if ($sanPham['so_luong'] > $chiTietDonHang->so_luong) {
              return CustomResponse::error('Số lượng xuất kho không được lớn hơn số lượng trong đơn hàng');
            }

            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->first();

            $soLuongTonTrongKho = KhoTong::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
            ])->first()->so_luong_ton;

            if ($sanPham['so_luong'] > $soLuongTonTrongKho) {
              return CustomResponse::error('Số lượng xuất kho không được lớn hơn số lượng tồn trong kho');
            }

            // Tạo chi tiết phiếu xuất kho
            ChiTietPhieuXuatKho::create([
              'phieu_xuat_kho_id' => $result->id,
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
              'so_luong' => $sanPham['so_luong'],
              'don_gia' => $loSanPham->gia_ban_le_don_vi,
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'tong_tien' => $sanPham['so_luong'] * $loSanPham->gia_ban_le_don_vi
            ]);

            $chiTietDonHang->update([
              'so_luong_da_xuat_kho' => $chiTietDonHang->so_luong_da_xuat_kho + $sanPham['so_luong'],
            ]);

            KhoTong::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
            ])->decrement('so_luong_ton', $sanPham['so_luong']);
          }

          $donHang->refresh();

          $sanPhamConCoTheXuatKho = [];

          foreach ($donHang->chiTietDonHangs as $chiTietDonHang) {
            if ($chiTietDonHang->so_luong_da_xuat_kho < $chiTietDonHang->so_luong) {
              $sanPhamConCoTheXuatKho[] = $chiTietDonHang;
            }
          }

          if (count($sanPhamConCoTheXuatKho) === 0) {
            $donHang->update([
              'trang_thai_xuat_kho' => 2,
            ]);
          } else {
            $donHang->update([
              'trang_thai_xuat_kho' => 1,
            ]);
          }

          break;
        case 2: // Xuất huỷ
          break;
        case 3: // Xuất nguyên liệu sản xuất
          break;
        default:
          return CustomResponse::error('Loại phiếu xuất kho không hợp lệ');
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
    $phieuXuatKho = PhieuXuatKho::find($id);

    if (!$phieuXuatKho) {
      return CustomResponse::error('Phiếu xuất kho không tồn tại');
    }

    try {
      DB::beginTransaction();
      switch ($phieuXuatKho->loai_phieu_xuat) {
        case 1: // Xuất bán theo đơn hàng
          $tongTien = 0;

          $donHang = DonHang::find($data['don_hang_id']);

          foreach ($data['danh_sach_san_pham'] as $sanPham) {
            // Kiểm tra lô sản phẩm tồn tại
            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->first();

            $tongTien += $sanPham['so_luong'] * $loSanPham->gia_ban_le_don_vi;
          }

          $data['tong_tien'] = $tongTien;

          $dataSave = $data;
          unset($dataSave['danh_sach_san_pham']);
          $result = PhieuXuatKho::find($id)->update($dataSave);

          $chiTietPhieuXuatKhos = ChiTietPhieuXuatKho::where('phieu_xuat_kho_id', $id)->get();

          foreach ($chiTietPhieuXuatKhos as $chiTietPhieuXuatKho) {
            $chiTietDonHang = ChiTietDonHang::where([
              'don_hang_id' => $data['don_hang_id'],
              'san_pham_id' => $chiTietPhieuXuatKho->san_pham_id,
              'don_vi_tinh_id' => $chiTietPhieuXuatKho->don_vi_tinh_id,
            ])->first();

            KhoTong::where([
              'ma_lo_san_pham' => $chiTietPhieuXuatKho->ma_lo_san_pham,
              'san_pham_id' => $chiTietPhieuXuatKho->san_pham_id,
            ])->increment('so_luong_ton', $chiTietPhieuXuatKho->so_luong);

            $chiTietDonHang->update([
              'so_luong_da_xuat_kho' => $chiTietDonHang->so_luong_da_xuat_kho - $chiTietPhieuXuatKho->so_luong,
            ]);
          }

          foreach ($chiTietPhieuXuatKhos as $chiTietPhieuXuatKho) {
            $chiTietPhieuXuatKho->delete();
          }

          foreach ($data['danh_sach_san_pham'] as $sanPham) {
            $chiTietDonHang = ChiTietDonHang::where([
              'don_hang_id' => $data['don_hang_id'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->first();

            if (!$chiTietDonHang) {
              return CustomResponse::error('Sản phẩm không tồn tại trong đơn hàng');
            }

            if ($sanPham['so_luong'] > $chiTietDonHang->so_luong) {
              return CustomResponse::error('Số lượng xuất kho không được lớn hơn số lượng trong đơn hàng');
            }

            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->first();

            $soLuongTonTrongKho = KhoTong::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
            ])->first()->so_luong_ton;

            if ($sanPham['so_luong'] > $soLuongTonTrongKho) {
              return CustomResponse::error('Số lượng xuất kho không được lớn hơn số lượng tồn trong kho');
            }

            // Tạo chi tiết phiếu xuất kho
            ChiTietPhieuXuatKho::create([
              'phieu_xuat_kho_id' => $id,
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
              'so_luong' => $sanPham['so_luong'],
              'don_gia' => $loSanPham->gia_ban_le_don_vi,
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'tong_tien' => $sanPham['so_luong'] * $loSanPham->gia_ban_le_don_vi
            ]);

            $chiTietDonHang->update([
              'so_luong_da_xuat_kho' => $chiTietDonHang->so_luong_da_xuat_kho + $sanPham['so_luong'],
            ]);

            KhoTong::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
            ])->decrement('so_luong_ton', $sanPham['so_luong']);
          }

          $donHang->refresh();

          $sanPhamConCoTheXuatKho = [];

          foreach ($donHang->chiTietDonHangs as $chiTietDonHang) {
            if ($chiTietDonHang->so_luong_da_xuat_kho < $chiTietDonHang->so_luong) {
              $sanPhamConCoTheXuatKho[] = $chiTietDonHang;
            }
          }

          if (count($sanPhamConCoTheXuatKho) === 0) {
            $donHang->update([
              'trang_thai_xuat_kho' => 2,
            ]);
          } else {
            $donHang->update([
              'trang_thai_xuat_kho' => 1,
            ]);
          }

          break;
        case 2: // Xuất huỷ
          break;
        case 3: // Xuất nguyên liệu sản xuất
          break;
        default:
          return CustomResponse::error('Loại phiếu xuất kho không hợp lệ');
      }

      DB::commit();
      return $result;
    } catch (Exception $e) {
      DB::rollBack();
      return CustomResponse::error($e->getMessage());
    }
  }


  /**
   * Xóa dữ liệu
   */
  public function delete($id)
  {
    try {
      $model = PhieuXuatKho::findOrFail($id);

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
   * Lấy danh sách PhieuXuatKho dạng option
   */
  public function getOptions()
  {
    return PhieuXuatKho::select('id as value', 'ten_phieu_xuat_kho as label')->get();
  }
}