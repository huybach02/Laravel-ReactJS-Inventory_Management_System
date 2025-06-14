<?php

namespace App\Modules\QuanLyKho;

use App\Http\Controllers\Controller;
use App\Modules\QuanLyKho\Validates\CreateQuanLyKhoRequest;
use App\Modules\QuanLyKho\Validates\UpdateQuanLyKhoRequest;
use App\Class\CustomResponse;
use App\Class\Helper;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\QuanLyKhoImport;
use Illuminate\Support\Str;

class QuanLyKhoController extends Controller
{
    protected $quanLyKhoService;
    
    public function __construct(QuanLyKhoService $quanLyKhoService)
    {
        $this->quanLyKhoService = $quanLyKhoService;
    }
    
    /**
     * Lấy danh sách QuanLyKhos
     */
    public function index(Request $request)
    {
        $params = $request->all();

        // Xử lý và validate parameters
        $params = Helper::validateFilterParams($params);

        $result = $this->quanLyKhoService->getAll($params);

        return CustomResponse::success([
          'collection' => $result['data'],
          'total' => $result['total'],
          'pagination' => $result['pagination'] ?? null
        ]);
    }
    
    /**
     * Tạo mới QuanLyKho
     */
    public function store(CreateQuanLyKhoRequest $request)
    {
        $result = $this->quanLyKhoService->create($request->validated());
        return CustomResponse::success($result, 'Tạo mới thành công');
    }
    
    /**
     * Lấy thông tin QuanLyKho
     */
    public function show($id)
    {
        $result = $this->quanLyKhoService->getById($id);
        return CustomResponse::success($result);
    }
    
    /**
     * Cập nhật QuanLyKho
     */
    public function update(UpdateQuanLyKhoRequest $request, $id)
    {
        $result = $this->quanLyKhoService->update($id, $request->validated());
        return CustomResponse::success($result, 'Cập nhật thành công');
    }
    
    /**
     * Xóa QuanLyKho
     */
    public function destroy($id)
    {
        $result = $this->quanLyKhoService->delete($id);
        return CustomResponse::success([], 'Xóa thành công');
    }

    /**
     * Lấy danh sách QuanLyKho dạng option
     */
    public function getOptions()
    {
      $result = $this->quanLyKhoService->getOptions();
      return CustomResponse::success($result);
    }

    public function downloadTemplateExcel()
    {
      $path = public_path('mau-excel/QuanLyKho.xlsx');
      return response()->download($path);
    }

    public function importExcel(Request $request)
    {
      $request->validate([
        'file' => 'required|file|mimes:xlsx,xls,csv',
      ]);

    try {
      $data = $request->file('file');
      $filename = Str::random(10) . '.' . $data->getClientOriginalExtension();
      $path = $data->move(public_path('excel'), $filename);

      $import = new QuanLyKhoImport();
      Excel::import($import, $path);

      $thanhCong = $import->getThanhCong();
      $thatBai = $import->getThatBai();

      // Xóa file sau khi import
      if (file_exists($path)) {
        unlink($path);
      }

      if ($thatBai > 0) {
        return CustomResponse::error('Import không thành công. Có ' . $thatBai . ' bản ghi lỗi và ' . $thanhCong . ' bản ghi thành công');
      }

      return CustomResponse::success([
        'success' => $thanhCong,
        'fail' => $thatBai
      ], 'Import thành công ' . $thanhCong . ' bản ghi');
    } catch (\Exception $e) {
      return CustomResponse::error('Lỗi import: ' . $e->getMessage(), 500);
    }
  }
}
