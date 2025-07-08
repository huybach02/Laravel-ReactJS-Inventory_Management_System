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
use App\Models\ChiTietSanXuat;
use App\Models\DonHang;
use App\Models\KhoTong;
use App\Models\SanPham;
use App\Models\SanXuat;

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

            if (!$loSanPham) {
              return CustomResponse::error('Lô sản phẩm ' . $sanPham['ma_lo_san_pham'] . ' không tồn tại');
            }

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
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
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
          $tongTien = 0;

          foreach ($data['danh_sach_san_pham'] as $sanPham) {
            // Kiểm tra lô sản phẩm tồn tại
            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->first();

            if (!$loSanPham) {
              return CustomResponse::error('Lô nguyên liệu ' . $sanPham['ma_lo_san_pham'] . ' không tồn tại');
            }

            $tongTien += $sanPham['so_luong'] * $loSanPham->gia_nhap;
          }

          $data['tong_tien'] = $tongTien;

          $dataSave = $data;
          unset($dataSave['danh_sach_san_pham']);
          $result = PhieuXuatKho::create($dataSave);

          foreach ($data['danh_sach_san_pham'] as $sanPham) {
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

            KhoTong::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->decrement('so_luong_ton', $sanPham['so_luong']);
          }
          break;
        case 3: // Xuất nguyên liệu sản xuất
          $tongTien = 0;

          $sanXuat = SanXuat::find($data['san_xuat_id']);

          foreach ($data['danh_sach_san_pham'] as $sanPham) {
            // Kiểm tra lô sản phẩm tồn tại
            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->first();

            if (!$loSanPham) {
              return CustomResponse::error('Lô nguyên liệu ' . $sanPham['ma_lo_san_pham'] . ' không tồn tại');
            }

            $tongTien += $sanPham['so_luong'] * $loSanPham->gia_ban_le_don_vi;
          }

          $data['tong_tien'] = $tongTien;

          $dataSave = $data;
          unset($dataSave['danh_sach_san_pham']);
          $result = PhieuXuatKho::create($dataSave);

          foreach ($data['danh_sach_san_pham'] as $nguyenLieu) {
            $chiTietSanXuat = ChiTietSanXuat::where([
              'san_xuat_id' => $data['san_xuat_id'],
              'san_pham_id' => $nguyenLieu['san_pham_id'],
              'don_vi_tinh_id' => $nguyenLieu['don_vi_tinh_id'],
            ])->first();

            if (!$chiTietSanXuat) {
              return CustomResponse::error('Nguyên liệu không tồn tại trong sản xuất');
            }

            if ($nguyenLieu['so_luong'] > $chiTietSanXuat->so_luong_thuc_te) {
              return CustomResponse::error('Số lượng xuất kho không được lớn hơn số lượng cần cho sản xuất');
            }

            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $nguyenLieu['ma_lo_san_pham'],
              'san_pham_id' => $nguyenLieu['san_pham_id'],
              'don_vi_tinh_id' => $nguyenLieu['don_vi_tinh_id'],
            ])->first();

            $soLuongTonTrongKho = KhoTong::where([
              'ma_lo_san_pham' => $nguyenLieu['ma_lo_san_pham'],
              'san_pham_id' => $nguyenLieu['san_pham_id'],
            ])->first()->so_luong_ton;

            if ($nguyenLieu['so_luong'] > $soLuongTonTrongKho) {
              return CustomResponse::error('Số lượng xuất kho không được lớn hơn số lượng tồn trong kho');
            }

            // Tạo chi tiết phiếu xuất kho
            ChiTietPhieuXuatKho::create([
              'phieu_xuat_kho_id' => $result->id,
              'san_pham_id' => $nguyenLieu['san_pham_id'],
              'don_vi_tinh_id' => $nguyenLieu['don_vi_tinh_id'],
              'so_luong' => $nguyenLieu['so_luong'],
              'don_gia' => $loSanPham->gia_ban_le_don_vi,
              'ma_lo_san_pham' => $nguyenLieu['ma_lo_san_pham'],
              'tong_tien' => $nguyenLieu['so_luong'] * $loSanPham->gia_ban_le_don_vi
            ]);

            $chiTietSanXuat->update([
              'so_luong_xuat_kho' => $chiTietSanXuat->so_luong_xuat_kho + $nguyenLieu['so_luong'],
            ]);

            KhoTong::where([
              'ma_lo_san_pham' => $nguyenLieu['ma_lo_san_pham'],
              'san_pham_id' => $nguyenLieu['san_pham_id'],
              'don_vi_tinh_id' => $nguyenLieu['don_vi_tinh_id'],
            ])->decrement('so_luong_ton', $nguyenLieu['so_luong']);
          }

          $nguyenLieuConCoTheXuatKho = [];

          foreach ($sanXuat->chiTietSanXuat as $chiTietSanXuat) {
            if ($chiTietSanXuat->so_luong_xuat_kho < $chiTietSanXuat->so_luong_thuc_te) {
              $nguyenLieuConCoTheXuatKho[] = $chiTietSanXuat;
            }
          }

          if (count($nguyenLieuConCoTheXuatKho) === 0) {
            $sanXuat->update([
              'trang_thai_xuat_kho' => 2,
            ]);
          } else {
            $sanXuat->update([
              'trang_thai_xuat_kho' => 1,
            ]);
          }

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

            if (!$loSanPham) {
              return CustomResponse::error('Lô sản phẩm ' . $sanPham['ma_lo_san_pham'] . ' không tồn tại');
            }

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
              'don_vi_tinh_id' => $chiTietPhieuXuatKho->don_vi_tinh_id,
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
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
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
          $tongTien = 0;

          foreach ($data['danh_sach_san_pham'] as $sanPham) {
            // Kiểm tra lô sản phẩm tồn tại
            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->first();

            if (!$loSanPham) {
              return CustomResponse::error('Lô nguyên liệu ' . $sanPham['ma_lo_san_pham'] . ' không tồn tại');
            }

            $tongTien += $sanPham['so_luong'] * $loSanPham->gia_nhap;
          }

          $data['tong_tien'] = $tongTien;

          $dataSave = $data;
          unset($dataSave['danh_sach_san_pham']);
          $result = PhieuXuatKho::find($id)->update($dataSave);

          $chiTietPhieuXuatKhos = ChiTietPhieuXuatKho::where('phieu_xuat_kho_id', $id)->get();

          foreach ($chiTietPhieuXuatKhos as $chiTietPhieuXuatKho) {
            $chiTietPhieuXuatKho->delete();
          }

          foreach ($data['danh_sach_san_pham'] as $sanPham) {
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

            KhoTong::where([
              'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
              'san_pham_id' => $sanPham['san_pham_id'],
              'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
            ])->decrement('so_luong_ton', $sanPham['so_luong']);
          }
          break;
        case 3: // Xuất nguyên liệu sản xuất
          $tongTien = 0;

          $sanXuat = SanXuat::find($data['san_xuat_id']);

          foreach ($data['danh_sach_san_pham'] as $nguyenLieu) {
            // Kiểm tra lô sản phẩm tồn tại
            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $nguyenLieu['ma_lo_san_pham'],
              'san_pham_id' => $nguyenLieu['san_pham_id'],
              'don_vi_tinh_id' => $nguyenLieu['don_vi_tinh_id'],
            ])->first();

            if (!$loSanPham) {
              return CustomResponse::error('Lô nguyên liệu ' . $nguyenLieu['ma_lo_san_pham'] . ' không tồn tại');
            }

            $tongTien += $nguyenLieu['so_luong'] * $loSanPham->gia_ban_le_don_vi;
          }

          $data['tong_tien'] = $tongTien;

          $dataSave = $data;
          unset($dataSave['danh_sach_san_pham']);
          $result = PhieuXuatKho::find($id)->update($dataSave);

          $chiTietPhieuXuatKhos = ChiTietPhieuXuatKho::where('phieu_xuat_kho_id', $id)->get();

          foreach ($chiTietPhieuXuatKhos as $chiTietPhieuXuatKho) {
            $chiTietSanXuat = ChiTietSanXuat::where([
              'san_xuat_id' => $data['san_xuat_id'],
              'san_pham_id' => $chiTietPhieuXuatKho->san_pham_id,
              'don_vi_tinh_id' => $chiTietPhieuXuatKho->don_vi_tinh_id,
            ])->first();

            KhoTong::where([
              'ma_lo_san_pham' => $chiTietPhieuXuatKho->ma_lo_san_pham,
              'san_pham_id' => $chiTietPhieuXuatKho->san_pham_id,
              'don_vi_tinh_id' => $chiTietPhieuXuatKho->don_vi_tinh_id,
            ])->increment('so_luong_ton', $chiTietPhieuXuatKho->so_luong);

            $chiTietSanXuat->update([
              'so_luong_xuat_kho' => $chiTietSanXuat->so_luong_xuat_kho - $chiTietPhieuXuatKho->so_luong,
            ]);
          }

          foreach ($chiTietPhieuXuatKhos as $chiTietPhieuXuatKho) {
            $chiTietPhieuXuatKho->delete();
          }

          foreach ($data['danh_sach_san_pham'] as $nguyenLieu) {
            $chiTietSanXuat = ChiTietSanXuat::where([
              'san_xuat_id' => $data['san_xuat_id'],
              'san_pham_id' => $nguyenLieu['san_pham_id'],
              'don_vi_tinh_id' => $nguyenLieu['don_vi_tinh_id'],
            ])->first();

            if (!$chiTietSanXuat) {
              return CustomResponse::error('Nguyên liệu không tồn tại trong sản xuất');
            }

            if ($nguyenLieu['so_luong'] > $chiTietSanXuat->so_luong_thuc_te) {
              return CustomResponse::error('Số lượng xuất kho không được lớn hơn số lượng cần cho sản xuất');
            }

            $loSanPham = ChiTietPhieuNhapKho::where([
              'ma_lo_san_pham' => $nguyenLieu['ma_lo_san_pham'],
              'san_pham_id' => $nguyenLieu['san_pham_id'],
              'don_vi_tinh_id' => $nguyenLieu['don_vi_tinh_id'],
            ])->first();

            $soLuongTonTrongKho = KhoTong::where([
              'ma_lo_san_pham' => $nguyenLieu['ma_lo_san_pham'],
              'san_pham_id' => $nguyenLieu['san_pham_id'],
            ])->first()->so_luong_ton;

            if ($nguyenLieu['so_luong'] > $soLuongTonTrongKho) {
              return CustomResponse::error('Số lượng xuất kho không được lớn hơn số lượng tồn trong kho');
            }

            // Tạo chi tiết phiếu xuất kho
            ChiTietPhieuXuatKho::create([
              'phieu_xuat_kho_id' => $id,
              'san_pham_id' => $nguyenLieu['san_pham_id'],
              'don_vi_tinh_id' => $nguyenLieu['don_vi_tinh_id'],
              'so_luong' => $nguyenLieu['so_luong'],
              'don_gia' => $loSanPham->gia_ban_le_don_vi,
              'ma_lo_san_pham' => $nguyenLieu['ma_lo_san_pham'],
              'tong_tien' => $nguyenLieu['so_luong'] * $loSanPham->gia_ban_le_don_vi
            ]);

            $chiTietSanXuat->update([
              'so_luong_xuat_kho' => $chiTietSanXuat->so_luong_xuat_kho + $nguyenLieu['so_luong'],
            ]);

            KhoTong::where([
              'ma_lo_san_pham' => $nguyenLieu['ma_lo_san_pham'],
              'san_pham_id' => $nguyenLieu['san_pham_id'],
              'don_vi_tinh_id' => $nguyenLieu['don_vi_tinh_id'],
            ])->decrement('so_luong_ton', $nguyenLieu['so_luong']);
          }

          $sanXuat->refresh();

          $nguyenLieuConCoTheXuatKho = [];

          foreach ($sanXuat->chiTietSanXuat as $chiTietSanXuat) {
            if ($chiTietSanXuat->so_luong_xuat_kho < $chiTietSanXuat->so_luong_thuc_te) {
              $nguyenLieuConCoTheXuatKho[] = $chiTietSanXuat;
            }
          }

          if (count($nguyenLieuConCoTheXuatKho) === 0) {
            $sanXuat->update([
              'trang_thai_xuat_kho' => 2,
            ]);
          } else {
            $sanXuat->update([
              'trang_thai_xuat_kho' => 1,
            ]);
          }
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
      $phieuXuatKho = PhieuXuatKho::find($id);

      if (!$phieuXuatKho) {
        return CustomResponse::error('Phiếu xuất kho không tồn tại');
      }

      switch ($phieuXuatKho->loai_phieu_xuat) {
        case 1: // Xuất theo đơn hàng
          $donHang = DonHang::find($phieuXuatKho->don_hang_id);

          if (!$donHang) {
            return CustomResponse::error('Đơn hàng không tồn tại');
          }

          $chiTietPhieuXuatKhos = ChiTietPhieuXuatKho::where('phieu_xuat_kho_id', $id)->get();

          foreach ($chiTietPhieuXuatKhos as $chiTietPhieuXuatKho) {
            $chiTietDonHang = ChiTietDonHang::where([
              'don_hang_id' => $donHang->id,
              'san_pham_id' => $chiTietPhieuXuatKho->san_pham_id,
              'don_vi_tinh_id' => $chiTietPhieuXuatKho->don_vi_tinh_id,
            ])->first();

            if (!$chiTietDonHang) {
              return CustomResponse::error('Sản phẩm không tồn tại trong đơn hàng');
            }

            KhoTong::where([
              'ma_lo_san_pham' => $chiTietPhieuXuatKho->ma_lo_san_pham,
              'san_pham_id' => $chiTietPhieuXuatKho->san_pham_id,
              'don_vi_tinh_id' => $chiTietPhieuXuatKho->don_vi_tinh_id,
            ])->increment('so_luong_ton', $chiTietPhieuXuatKho->so_luong);

            $chiTietDonHang->update([
              'so_luong_da_xuat_kho' => $chiTietDonHang->so_luong_da_xuat_kho - $chiTietPhieuXuatKho->so_luong,
            ]);

            $chiTietPhieuXuatKho->delete();
          }

          $phieuXuatKho->delete();

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
        case 2: // Xuất hủy
          $chiTietPhieuXuatKhos = ChiTietPhieuXuatKho::where('phieu_xuat_kho_id', $id)->get();

          foreach ($chiTietPhieuXuatKhos as $chiTietPhieuXuatKho) {
            KhoTong::where([
              'ma_lo_san_pham' => $chiTietPhieuXuatKho->ma_lo_san_pham,
              'san_pham_id' => $chiTietPhieuXuatKho->san_pham_id,
              'don_vi_tinh_id' => $chiTietPhieuXuatKho->don_vi_tinh_id,
            ])->increment('so_luong_ton', $chiTietPhieuXuatKho->so_luong);

            $chiTietPhieuXuatKho->delete();
          }

          $phieuXuatKho->delete();
          break;
        case 3: // Xuất nguyên liệu sản xuất
          $sanXuat = SanXuat::find($phieuXuatKho->san_xuat_id);

          if (!$sanXuat) {
            return CustomResponse::error('Sản xuất không tồn tại');
          }

          $chiTietPhieuXuatKhos = ChiTietPhieuXuatKho::where('phieu_xuat_kho_id', $id)->get();

          foreach ($chiTietPhieuXuatKhos as $chiTietPhieuXuatKho) {
            $chiTietSanXuat = ChiTietSanXuat::where([
              'san_xuat_id' => $sanXuat->id,
              'san_pham_id' => $chiTietPhieuXuatKho->san_pham_id,
              'don_vi_tinh_id' => $chiTietPhieuXuatKho->don_vi_tinh_id,
            ])->first();

            KhoTong::where([
              'ma_lo_san_pham' => $chiTietPhieuXuatKho->ma_lo_san_pham,
              'san_pham_id' => $chiTietPhieuXuatKho->san_pham_id,
              'don_vi_tinh_id' => $chiTietPhieuXuatKho->don_vi_tinh_id,
            ])->increment('so_luong_ton', $chiTietPhieuXuatKho->so_luong);

            $chiTietSanXuat->update([
              'so_luong_xuat_kho' => $chiTietSanXuat->so_luong_xuat_kho - $chiTietPhieuXuatKho->so_luong,
            ]);

            $chiTietPhieuXuatKho->delete();
          }

          $phieuXuatKho->delete();

          $sanXuat->refresh();

          $nguyenLieuConCoTheXuatKho = [];

          foreach ($sanXuat->chiTietSanXuat as $chiTietSanXuat) {
            if ($chiTietSanXuat->so_luong_xuat_kho < $chiTietSanXuat->so_luong_thuc_te) {
              $nguyenLieuConCoTheXuatKho[] = $chiTietSanXuat;
            }
          }

          if (count($nguyenLieuConCoTheXuatKho) === 0) {
            $sanXuat->update([
              'trang_thai_xuat_kho' => 2,
            ]);
          } else {
            $sanXuat->update([
              'trang_thai_xuat_kho' => 1,
            ]);
          }

          break;
        default:
          return CustomResponse::error('Loại phiếu xuất kho không hợp lệ');
      }

      return $phieuXuatKho;
    } catch (Exception $e) {
      return CustomResponse::error($e->getMessage());
    }
  }

  /**
   * Lấy danh sách PhieuXuatKho dạng option
   */
  public function getOptions()
  {
    return PhieuXuatKho::select('id as value', 'ma_phieu_xuat_kho as label')->get();
  }
}