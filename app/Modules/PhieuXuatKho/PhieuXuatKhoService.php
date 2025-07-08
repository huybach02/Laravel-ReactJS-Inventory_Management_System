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
      $result = DB::transaction(function () use (&$data) {
        if (!in_array($data['loai_phieu_xuat'], [1, 2, 3])) {
          throw new Exception('Loại phiếu xuất kho không hợp lệ');
        }
        $phieuXuatKho = new PhieuXuatKho();
        return $this->processChiTietXuatKho($phieuXuatKho, $data, 'create');
      });
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
    $phieuXuatKho = PhieuXuatKho::with('donHang', 'sanXuat')->find($id);

    if (!$phieuXuatKho) {
      return CustomResponse::error('Phiếu xuất kho không tồn tại');
    }

    try {
      DB::transaction(function () use ($phieuXuatKho, &$data) {
        $this->revertChiTietXuatKho($phieuXuatKho);
        ChiTietPhieuXuatKho::where('phieu_xuat_kho_id', $phieuXuatKho->id)->delete();
        $this->processChiTietXuatKho($phieuXuatKho, $data, 'update');
      });
      return $phieuXuatKho;
    } catch (Exception $e) {
      return CustomResponse::error($e->getMessage());
    }
  }


  /**
   * Xóa dữ liệu
   */
  public function delete($id)
  {
    $phieuXuatKho = PhieuXuatKho::with('donHang', 'sanXuat')->find($id);

    if (!$phieuXuatKho) {
      return CustomResponse::error('Phiếu xuất kho không tồn tại');
    }

    try {
      DB::transaction(function () use ($phieuXuatKho) {
        $this->revertChiTietXuatKho($phieuXuatKho);
        ChiTietPhieuXuatKho::where('phieu_xuat_kho_id', $phieuXuatKho->id)->delete();
        $phieuXuatKho->delete();
      });
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

  /**
   * Xử lý tạo hoặc cập nhật chi tiết phiếu xuất kho và các dữ liệu liên quan.
   *
   * @param PhieuXuatKho $phieuXuatKho
   * @param array $data Dữ liệu đầu vào
   * @param string $mode 'create' hoặc 'update'
   * @return PhieuXuatKho
   * @throws Exception
   */
  private function processChiTietXuatKho(PhieuXuatKho $phieuXuatKho, array &$data, string $mode)
  {
    $danhSachSanPham = collect($data['danh_sach_san_pham']);
    $loaiPhieuXuat = $mode === 'create' ? $data['loai_phieu_xuat'] : $phieuXuatKho->loai_phieu_xuat;

    $maLoSanPhamList = $danhSachSanPham->pluck('ma_lo_san_pham')->unique()->all();
    $sanPhamIds = $danhSachSanPham->pluck('san_pham_id')->unique()->all();
    $donViTinhIds = $danhSachSanPham->pluck('don_vi_tinh_id')->unique()->all();

    if ($data['loai_phieu_xuat'] == 1) {
      $donHangId = $mode === 'create' ? $data['don_hang_id'] : $phieuXuatKho->don_hang_id;
    } elseif ($data['loai_phieu_xuat'] == 3) {
      $sanXuatId = $mode === 'create' ? $data['san_xuat_id'] : $phieuXuatKho->san_xuat_id;
    }

    // Lấy tất cả ChiTietPhieuNhapKho và KhoTong cần thiết và chuyển thành collection có key để tra cứu nhanh
    $chiTietNhapKhoList = ChiTietPhieuNhapKho::whereIn('ma_lo_san_pham', $maLoSanPhamList)  // có thể coi là lô sản phẩm
      ->whereIn('san_pham_id', $sanPhamIds)
      ->whereIn('don_vi_tinh_id', $donViTinhIds)
      ->get()
      ->keyBy(fn($item) => $item->ma_lo_san_pham . '-' . $item->san_pham_id . '-' . $item->don_vi_tinh_id);

    $khoTongList = KhoTong::whereIn('ma_lo_san_pham', $maLoSanPhamList)
      ->whereIn('san_pham_id', $sanPhamIds)
      ->whereIn('don_vi_tinh_id', $donViTinhIds)
      ->get()
      ->keyBy(fn($item) => $item->ma_lo_san_pham . '-' . $item->san_pham_id . '-' . $item->don_vi_tinh_id);

    $chiTietDonHangList = collect([]);
    if ($loaiPhieuXuat == 1) {
      $chiTietDonHangList = ChiTietDonHang::where('don_hang_id', $donHangId)
        ->whereIn('san_pham_id', $sanPhamIds)
        ->whereIn('don_vi_tinh_id', $donViTinhIds)
        ->get()
        ->keyBy(fn($item) => $donHangId . '-' . $item->san_pham_id . '-' . $item->don_vi_tinh_id);
    }
    $chiTietSanXuatList = collect([]);
    if ($loaiPhieuXuat == 3) {
      $chiTietSanXuatList = ChiTietSanXuat::where('san_xuat_id', $sanXuatId)
        ->whereIn('san_pham_id', $sanPhamIds)
        ->whereIn('don_vi_tinh_id', $donViTinhIds)
        ->get()
        ->keyBy(fn($item) => $sanXuatId . '-' . $item->san_pham_id . '-' . $item->don_vi_tinh_id);
    }

    $tongTien = 0;
    $chiTietToInsert = [];

    foreach ($danhSachSanPham as $sanPham) {
      $key = $sanPham['ma_lo_san_pham'] . '-' . $sanPham['san_pham_id'] . '-' . $sanPham['don_vi_tinh_id'];
      $loSanPham = $chiTietNhapKhoList->get($key);
      if (!$loSanPham) {
        throw new Exception('Lô sản phẩm/nguyên liệu ' . $sanPham['ma_lo_san_pham'] . ' không tồn tại.');
      }

      $khoTong = $khoTongList->get($key);
      if (!$khoTong || $sanPham['so_luong'] > $khoTong->so_luong_ton) {
        throw new Exception('Số lượng xuất kho của sản phẩm với lô ' . $sanPham['ma_lo_san_pham'] . ' không được lớn hơn số lượng tồn trong kho.');
      }

      if ($loaiPhieuXuat == 1) {
        $keyChiTiet = $donHangId . '-' . $sanPham['san_pham_id'] . '-' . $sanPham['don_vi_tinh_id'];
        $chiTiet = $chiTietDonHangList->get($keyChiTiet);
        if (!$chiTiet || $sanPham['so_luong'] > $chiTiet->so_luong_con_lai_xuat_kho)
          throw new Exception('Số lượng xuất kho lớn hơn số lượng cần xuất còn lại trong đơn hàng.');
      } elseif ($loaiPhieuXuat == 3) {
        $keyChiTiet = $sanXuatId . '-' . $sanPham['san_pham_id'] . '-' . $sanPham['don_vi_tinh_id'];
        $chiTiet = $chiTietSanXuatList->get($keyChiTiet);
        if (!$chiTiet || $sanPham['so_luong'] > $chiTiet->so_luong_con_lai_xuat_kho)
          throw new Exception('Số lượng xuất kho lớn hơn số lượng cần xuất còn lại trong sản xuất.');
      }

      $donGia = $loaiPhieuXuat == 2 ? $loSanPham->gia_nhap : $loSanPham->gia_ban_le_don_vi;
      $tongTien += $sanPham['so_luong'] * $donGia;

      $chiTietToInsert[] = [
        'san_pham_id' => $sanPham['san_pham_id'],
        'don_vi_tinh_id' => $sanPham['don_vi_tinh_id'],
        'so_luong' => $sanPham['so_luong'],
        'don_gia' => $donGia,
        'ma_lo_san_pham' => $sanPham['ma_lo_san_pham'],
        'tong_tien' => $sanPham['so_luong'] * $donGia,
      ];
    }

    $phieuXuatKhoData = $data;
    $phieuXuatKhoData['tong_tien'] = $tongTien;
    unset($phieuXuatKhoData['danh_sach_san_pham']);

    if ($mode === 'create') {
      $phieuXuatKho->fill($phieuXuatKhoData)->save();
    } else {
      $phieuXuatKho->update($phieuXuatKhoData);
    }
    $phieuXuatKho->refresh();

    $phieuXuatKho->chiTietPhieuXuatKhos()->createMany($chiTietToInsert);

    // Cập nhật các bảng liên quan
    foreach ($danhSachSanPham as $sanPham) {
      $soLuongXuat = $sanPham['so_luong'];
      $keyUpdate = [
        'san_pham_id' => $sanPham['san_pham_id'],
        'don_vi_tinh_id' => $sanPham['don_vi_tinh_id']
      ];
      KhoTong::where('ma_lo_san_pham', $sanPham['ma_lo_san_pham'])->where($keyUpdate)->decrement('so_luong_ton', $soLuongXuat);
      if ($loaiPhieuXuat == 1) {
        ChiTietDonHang::where('don_hang_id', $phieuXuatKho->don_hang_id)->where($keyUpdate)->increment('so_luong_da_xuat_kho', $soLuongXuat);
      } elseif ($loaiPhieuXuat == 3) {
        ChiTietSanXuat::where('san_xuat_id', $phieuXuatKho->san_xuat_id)->where($keyUpdate)->increment('so_luong_xuat_kho', $soLuongXuat);
      }
    }

    // Cập nhật trạng thái cuối cùng
    if ($phieuXuatKho->loai_phieu_xuat == 1) $this->updateTrangThaiDonHang($phieuXuatKho->donHang);
    elseif ($phieuXuatKho->loai_phieu_xuat == 3) $this->updateTrangThaiSanXuat($phieuXuatKho->sanXuat);

    return $phieuXuatKho;
  }

  /**
   * Hoàn tác các thay đổi trên kho, đơn hàng, sản xuất khi xóa/sửa phiếu xuất.
   *
   * @param PhieuXuatKho $phieuXuatKho
   * @return void
   */
  private function revertChiTietXuatKho(PhieuXuatKho $phieuXuatKho)
  {
    $chiTietPhieuXuatKhos = ChiTietPhieuXuatKho::where('phieu_xuat_kho_id', $phieuXuatKho->id)->get();
    if ($chiTietPhieuXuatKhos->isEmpty()) return;

    // Tối ưu: Thực hiện các câu lệnh update trong vòng lặp nhưng đã giảm được truy vấn SELECT N+1
    foreach ($chiTietPhieuXuatKhos as $chiTiet) {
      KhoTong::where('ma_lo_san_pham', $chiTiet->ma_lo_san_pham)
        ->where('san_pham_id', $chiTiet->san_pham_id)
        ->where('don_vi_tinh_id', $chiTiet->don_vi_tinh_id)
        ->increment('so_luong_ton', $chiTiet->so_luong);

      $keyUpdate = [
        'san_pham_id' => $chiTiet->san_pham_id,
        'don_vi_tinh_id' => $chiTiet->don_vi_tinh_id
      ];

      if ($phieuXuatKho->loai_phieu_xuat == 1 && $phieuXuatKho->donHang) {
        ChiTietDonHang::where('don_hang_id', $phieuXuatKho->don_hang_id)->where($keyUpdate)
          ->decrement('so_luong_da_xuat_kho', $chiTiet->so_luong);
      } elseif ($phieuXuatKho->loai_phieu_xuat == 3 && $phieuXuatKho->sanXuat) {
        ChiTietSanXuat::where('san_xuat_id', $phieuXuatKho->san_xuat_id)->where($keyUpdate)
          ->decrement('so_luong_xuat_kho', $chiTiet->so_luong);
      }
    }

    if ($phieuXuatKho->loai_phieu_xuat == 1 && $phieuXuatKho->donHang) {
      $this->updateTrangThaiDonHang($phieuXuatKho->donHang);
    } elseif ($phieuXuatKho->loai_phieu_xuat == 3 && $phieuXuatKho->sanXuat) {
      $this->updateTrangThaiSanXuat($phieuXuatKho->sanXuat);
    }
  }

  /**
   * Cập nhật trạng thái xuất kho của đơn hàng.
   *
   * @param DonHang $donHang
   * @return void
   */
  private function updateTrangThaiDonHang(DonHang $donHang)
  {
    $donHang->refresh();
    $soLuongConLai = $donHang->chiTietDonHangs()->whereRaw('so_luong > so_luong_da_xuat_kho')->count();
    $trangThai = ($soLuongConLai === 0) ? 2 : 1;
    $donHang->update(['trang_thai_xuat_kho' => $trangThai]);
  }

  /**
   * Cập nhật trạng thái xuất kho của phiếu sản xuất.
   *
   * @param SanXuat $sanXuat
   * @return void
   */
  private function updateTrangThaiSanXuat(SanXuat $sanXuat)
  {
    $sanXuat->refresh();
    $soLuongConLai = $sanXuat->chiTietSanXuat()->whereRaw('so_luong_thuc_te > so_luong_xuat_kho')->count();
    $trangThai = ($soLuongConLai === 0) ? 2 : 1;
    $sanXuat->update(['trang_thai_xuat_kho' => $trangThai]);
  }
}