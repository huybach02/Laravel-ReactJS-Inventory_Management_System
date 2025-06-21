<?php

namespace App\Modules\PhieuChi;

use App\Models\PhieuChi;
use Illuminate\Support\Facades\DB;
use Exception;
use App\Class\CustomResponse;
use App\Class\FilterWithPagination;
use App\Models\ChiTietPhieuChi;
use App\Models\PhieuNhapKho;
use App\Class\Helper;

class PhieuChiService
{
  /**
   * Lấy tất cả dữ liệu
   */
  public function getAll(array $params = [])
  {
    try {
      // Tạo query cơ bản
      $query = PhieuChi::query()->with('images');

      // Sử dụng FilterWithPagination để xử lý filter và pagination
      $result = FilterWithPagination::findWithPagination(
        $query,
        $params,
        ['phieu_chis.*'] // Columns cần select
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
    $phieuChi = PhieuChi::find($id);

    if ($phieuChi->loai_phieu_chi == 2 || $phieuChi->loai_phieu_chi == 4) {
      $query = "
      SELECT
        phieu_nhap_khos.ma_phieu_nhap_kho,
        phieu_nhap_khos.tong_tien - COALESCE((SELECT SUM(so_tien) FROM chi_tiet_phieu_chis WHERE phieu_nhap_kho_id = phieu_nhap_khos.id AND phieu_chi_id < $id), 0) as tong_tien_can_thanh_toan,
        chi_tiet_phieu_chis.so_tien as tong_tien_da_thanh_toan,
        (phieu_nhap_khos.tong_tien - COALESCE((SELECT SUM(so_tien) FROM chi_tiet_phieu_chis WHERE phieu_nhap_kho_id = phieu_nhap_khos.id AND phieu_chi_id < $id), 0) - chi_tiet_phieu_chis.so_tien) as so_tien_con_lai
      FROM phieu_chis
      LEFT JOIN chi_tiet_phieu_chis ON phieu_chis.id = chi_tiet_phieu_chis.phieu_chi_id
      LEFT JOIN phieu_nhap_khos ON chi_tiet_phieu_chis.phieu_nhap_kho_id = phieu_nhap_khos.id
      WHERE phieu_chis.id = $id";

      $data = DB::select($query);

      $phieuChi->chi_tiet_phieu_chi = $data;
    }

    if (!$phieuChi) {
      return CustomResponse::error('Dữ liệu không tồn tại');
    }

    return $phieuChi;
  }

  /**
   * Tạo mới dữ liệu
   */
  public function create(array $data)
  {
    try {
      DB::beginTransaction();

      switch ($data['loai_phieu_chi']) {
        case 1: // chi thanh toán cho phiếu nhập kho
          $phieuNhapKho = PhieuNhapKho::find($data['phieu_nhap_kho_id']);
          if (!$phieuNhapKho) {
            throw new Exception('Phiếu nhập kho không tồn tại');
          }

          if ($data['so_tien'] > $phieuNhapKho->tong_tien - $phieuNhapKho->da_thanh_toan) {
            return CustomResponse::error('Số tiền thanh toán nhiều hơn số tiền cần thanh toán nhà cung cấp');
          }

          $daThanhToan = $phieuNhapKho->da_thanh_toan + $data['so_tien'];

          $phieuNhapKho->update([
            'da_thanh_toan' => $daThanhToan,
            'trang_thai' => $daThanhToan < $phieuNhapKho->tong_tien ? 1 : ($daThanhToan == $phieuNhapKho->tong_tien ? 2 : 0), // 1: đã thanh toán, 2: chưa thanh toán, 0: hủy
          ]);

          // Tạo phiếu chi
          $phieuChi = PhieuChi::create($data);

          break;
        case 2: // thanh toán công nợ
          if (empty($data['nha_cung_cap_id'])) {
            return CustomResponse::error('Nhà cung cấp không được để trống');
          }

          // Lấy các phiếu nhập kho chưa thanh toán đủ
          $phieuNhapKhos = PhieuNhapKho::where('nha_cung_cap_id', $data['nha_cung_cap_id'])
            ->whereRaw('da_thanh_toan < tong_tien')
            ->orderBy('id', 'asc')
            ->get();

          if ($phieuNhapKhos->isEmpty()) {
            return CustomResponse::error('Không tìm thấy công nợ của nhà cung cấp này');
          }

          // Tính tổng số tiền cần thanh toán
          $tongTienCanThanhToan = $phieuNhapKhos->sum(function ($phieu) {
            return $phieu->tong_tien - $phieu->da_thanh_toan;
          });

          $soTienThanhToan = $data['so_tien'];

          if ($tongTienCanThanhToan < $soTienThanhToan) {
            return CustomResponse::error('Số tiền thanh toán nhiều hơn số tiền cần thanh toán nhà cung cấp');
          }

          // Tạo phiếu chi
          $phieuChi = PhieuChi::create($data);

          // Phân bổ tiền thanh toán cho từng phiếu
          foreach ($phieuNhapKhos as $phieu) {
            if ($soTienThanhToan <= 0) break;

            $soTienCanThanhToan = $phieu->tong_tien - $phieu->da_thanh_toan;
            $soTienThanhToanPhieu = min($soTienCanThanhToan, $soTienThanhToan);

            $daThanhToanMoi = $phieu->da_thanh_toan + $soTienThanhToanPhieu;
            $trangThaiMoi = $this->getTrangThaiThanhToan($daThanhToanMoi, $phieu->tong_tien);

            $phieu->update([
              'da_thanh_toan' => $daThanhToanMoi,
              'trang_thai' => $trangThaiMoi
            ]);

            $soTienThanhToan -= $soTienThanhToanPhieu;

            ChiTietPhieuChi::create([
              'phieu_chi_id' => $phieuChi->id,
              'phieu_nhap_kho_id' => $phieu->id,
              'so_tien' => $soTienThanhToanPhieu
            ]);
          }
          break;
        case 3: // chi khác
          $phieuChi = PhieuChi::create($data);
          break;
        case 4: // chi thanh toán cho nhiều phiếu nhập kho chỉ định
          if (empty($data['phieu_nhap_kho_ids'])) {
            return CustomResponse::error('Danh sách phiếu nhập kho không được để trống');
          }

          $phieuNhapKhoIds = collect($data['phieu_nhap_kho_ids'])->map(function ($item) {
            return (int) $item['id'];
          })->toArray();
          // Lấy các phiếu nhập kho chưa thanh toán đủ
          $phieuNhapKhos = PhieuNhapKho::whereIn('id', $phieuNhapKhoIds)
            ->whereRaw('da_thanh_toan < tong_tien')
            ->orderBy('id', 'asc')
            ->get();

          if ($phieuNhapKhos->isEmpty()) {
            return CustomResponse::error('Không tìm thấy công nợ của nhà cung cấp này');
          }

          // Lưu lại danh sách phiếu nhập kho trước khi unset
          $phieuNhapKhoList = $data['phieu_nhap_kho_ids'];

          // Tạo phiếu chi
          unset($data['phieu_nhap_kho_ids']);
          $phieuChi = PhieuChi::create($data);

          // Phân bổ tiền thanh toán cho từng phiếu nhập kho
          foreach ($phieuNhapKhos as $phieu) {
            // Tìm số tiền thanh toán từ dữ liệu đầu vào
            $soTienThanhToan = 0;

            foreach ($phieuNhapKhoList as $item) {
              if ((int)$item['id'] === $phieu->id && isset($item['so_tien_thanh_toan'])) {
                if ($phieu->tong_tien - $phieu->da_thanh_toan < $item['so_tien_thanh_toan']) {
                  return CustomResponse::error('Số tiền thanh toán nhiều hơn số tiền công nợ');
                }
                $soTienThanhToan = $item['so_tien_thanh_toan'];
                break;
              }
            }

            if ($soTienThanhToan <= 0) {
              continue; // Bỏ qua nếu không có số tiền thanh toán
            }

            $phieu->update([
              'da_thanh_toan' => $phieu->da_thanh_toan + $soTienThanhToan,
              'trang_thai' => $this->getTrangThaiThanhToan($phieu->da_thanh_toan + $soTienThanhToan, $phieu->tong_tien),
            ]);

            ChiTietPhieuChi::create([
              'phieu_chi_id' => $phieuChi->id,
              'phieu_nhap_kho_id' => $phieu->id,
              'so_tien' => $soTienThanhToan
            ]);
          }
          break;
        default:
          return CustomResponse::error('Loại phiếu chi không hợp lệ');
      }
      DB::commit();
      return $phieuChi;
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
    return CustomResponse::error('Không thể cập nhật phiếu chi');
  }


  /**
   * Xóa dữ liệu
   */
  public function delete($id)
  {
    try {
      $model = PhieuChi::findOrFail($id);

      if (!Helper::checkIsToday($model->created_at)) {
        return CustomResponse::error('Chỉ được xóa phiếu chi trong ngày hôm nay');
      }

      DB::beginTransaction();

      switch ($model->loai_phieu_chi) {

        case 1: // chi thanh toán cho phiếu nhập kho
          $phieuNhapKho = PhieuNhapKho::find($model->phieu_nhap_kho_id);
          $phieuNhapKho->update([
            'da_thanh_toan' => $phieuNhapKho->da_thanh_toan - $model->so_tien,
          ]);
          break;
        case 2:
        case 4: // thanh toán công nợ
          $chiTietPhieuChi = ChiTietPhieuChi::where('phieu_chi_id', $id)->get();
          foreach ($chiTietPhieuChi as $chiTiet) {
            $phieuNhapKho = PhieuNhapKho::find($chiTiet->phieu_nhap_kho_id);
            $daThanhToan = $phieuNhapKho->da_thanh_toan - $chiTiet->so_tien;
            $phieuNhapKho->update([
              'da_thanh_toan' => $daThanhToan,
              'trang_thai' => $this->getTrangThaiThanhToan($daThanhToan, $phieuNhapKho->tong_tien),
            ]);
          }
          // Xóa các chi tiết phiếu chi
          ChiTietPhieuChi::where('phieu_chi_id', $id)->delete();
          break;
        case 3: // chi khác
          break;
        default:
          return CustomResponse::error('Loại phiếu chi không hợp lệ');
      }
      $model->delete();
      DB::commit();
      return $model;
    } catch (Exception $e) {
      DB::rollBack();
      return CustomResponse::error($e->getMessage());
    }
  }

  /**
   * Lấy danh sách PhieuChi dạng option
   */
  public function getOptions()
  {
    return PhieuChi::select('id as value', 'ten_phieu_chi as label')->get();
  }

  /**
   * Tính trạng thái thanh toán dựa trên số tiền đã thanh toán và tổng tiền
   */
  private function getTrangThaiThanhToan($daThanhToan, $tongTien)
  {
    if ($daThanhToan < $tongTien) {
      return 1; // Chưa thanh toán đủ
    } elseif ($daThanhToan == $tongTien) {
      return 2; // Đã thanh toán đủ
    } else {
      return 0; // Thanh toán thừa (lỗi)
    }
  }
}