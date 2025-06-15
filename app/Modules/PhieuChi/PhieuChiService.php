<?php

namespace App\Modules\PhieuChi;

use App\Models\PhieuChi;
use Illuminate\Support\Facades\DB;
use Exception;
use App\Class\CustomResponse;
use App\Class\FilterWithPagination;
use App\Models\PhieuNhapKho;

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
    return PhieuChi::with('images')->find($id);
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
          }
          break;
        case 3: // chi khác
          break;
        default:
          return CustomResponse::error('Loại phiếu chi không hợp lệ');
      }

      $result = PhieuChi::create($data);

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
      $model = PhieuChi::findOrFail($id);
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
      $model = PhieuChi::findOrFail($id);

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