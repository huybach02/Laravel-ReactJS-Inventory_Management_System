<?php

namespace App\Imports;

use App\Models\KhachHang;
use App\Modules\KhachHang\Validates\CreateKhachHangRequest;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Exception;
use Illuminate\Support\Facades\Validator;
use App\Models\LichSuImport;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class KhachHangImport implements ToCollection, WithMultipleSheets
{
  // TODO: Config các thông tin cần thiết cho import
  protected $muc_import = 'Khách hàng';
  protected $model_class = KhachHang::class;
  protected $createRequest = CreateKhachHangRequest::class;

  protected $thanh_cong = 0;
  protected $that_bai = 0;
  protected $ket_qua_import = [];
  protected $validated_data = [];
  protected $filePath;
  protected $tong_so_luong = 0;

  public function sheets(): array
  {
    return [
      0 => $this // Chỉ đọc sheet đầu tiên (index 0)
    ];
  }

  /**
   * Validate tất cả dữ liệu
   * @param array $data
   * @return void
   */
  protected function validateAllData(array $data)
  {
    // Lấy rules từ Request
    $createRequest = new $this->createRequest();
    $rules = $createRequest->rules();
    $messages = $createRequest->messages();

    foreach ($data as $index => $item) {
      try {
        // |--------------------------------------------------------|
        // TODO: THAY ĐỔI CHO PHÙ HỢP VỚI CÁC TRƯỜNG TRONG createRequest VÀ TRONG DATABASE
        $rowData = [
          'ten_khach_hang' => $item[0],
          'email' => $item[1],
          'so_dien_thoai' => $item[2],
          'dia_chi' => $item[3],
          'loai_khach_hang_id' => $item[4],
          'cong_no' => $item[5] ?? 0,
          'doanh_thu_tich_luy' => $item[6] ?? 0,
          'ghi_chu' => $item[7] ?? null,
        ];

        // |--------------------------------------------------------|

        // Validate dữ liệu
        $validator = Validator::make($rowData, $rules, $messages);

        if ($validator->fails()) {
          $this->addFailedResult($index, $item, 'Lỗi dữ liệu không hợp lệ', $validator->errors()->all());
        } else {
          $this->validated_data[] = [
            'rowData' => $rowData,
            'index' => $index,
            'item' => $item
          ];
        }
      } catch (Exception $e) {
        $this->logAndAddFailedResult($index, $item, 'Lỗi hệ thống', [$e->getMessage()]);
      }
    }
  }

  public function __construct($filePath = null)
  {
    $this->filePath = $filePath;
  }

  /**
   * @param Collection $collection
   */
  public function collection(Collection $collection)
  {
    $data = array_slice($collection->toArray(), 1); // Bỏ qua dòng đầu tiên (header)

    $this->validateAllData($data);
    $this->tong_so_luong = count($data);

    // Chỉ tạo bản ghi khi tất cả dữ liệu đều hợp lệ
    if ($this->that_bai === 0 && count($this->validated_data) > 0) {
      $this->createRecords();
    }

    $this->saveLichSuImport();
  }

  /**
   * Tạo các bản ghi từ dữ liệu đã validate
   * @return void
   */
  protected function createRecords()
  {
    foreach ($this->validated_data as $valid_item) {
      try {
        $model = $this->model_class::create($valid_item['rowData']);
        $this->thanh_cong++;

        $this->ket_qua_import[] = [
          'dong' => $valid_item['index'] + 2,
          'du_lieu' => $valid_item['item'],
          'trang_thai' => 'thanh_cong',
          'thong_bao' => 'Import thành công',
          'id' => $model->id
        ];
      } catch (Exception $e) {
        $this->logAndAddFailedResult($valid_item['index'] + 2, $valid_item['item'], 'Lỗi hệ thống khi tạo bản ghi', [$e->getMessage()]);
      }
    }
  }

  /**
   * Thêm kết quả thất bại vào danh sách
   * @param int $index
   * @param array $item
   * @param string $message
   * @param array $errors
   * @return void
   */
  protected function addFailedResult($index, $item, $message, $errors)
  {
    $this->that_bai++;
    $this->ket_qua_import[] = [
      'dong' => $index + 2,
      'du_lieu' => $item,
      'trang_thai' => 'that_bai',
      'thong_bao' => $message,
      'loi' => $errors
    ];
  }

  /**
   * Ghi log và thêm kết quả thất bại
   * @param int $index
   * @param array $item
   * @param string $message
   * @param array $errors
   * @return void
   */
  protected function logAndAddFailedResult($index, $item, $message, $errors)
  {
    logger()->error($errors[0] ?? 'Lỗi không xác định');
    $this->addFailedResult($index, $item, $message, $errors);
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

  /**
   * Lấy kết quả import
   * @return array
   */
  public function getKetQuaImport()
  {
    return $this->ket_qua_import;
  }

  /**
   * Lưu lịch sử import
   * @return void
   */
  public function saveLichSuImport()
  {
    LichSuImport::create([
      'muc_import' => $this->muc_import,
      'tong_so_luong' => $this->tong_so_luong,
      'so_luong_thanh_cong' => $this->thanh_cong,
      'so_luong_that_bai' => $this->that_bai,
      'ket_qua_import' => json_encode($this->ket_qua_import, JSON_UNESCAPED_UNICODE),
      'file_path' => $this->filePath,
    ]);
  }
}