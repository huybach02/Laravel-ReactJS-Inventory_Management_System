<?php

namespace App\Modules\SanPham;

use App\Http\Controllers\Controller;
use App\Modules\SanPham\Validates\CreateSanPhamRequest;
use App\Modules\SanPham\Validates\UpdateSanPhamRequest;
use App\Class\CustomResponse;
use App\Class\Helper;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\SanPhamImport;
use Illuminate\Support\Str;

class SanPhamController extends Controller
{
    protected $sanPhamService;
    
    public function __construct(SanPhamService $sanPhamService)
    {
        $this->sanPhamService = $sanPhamService;
    }
    
    /**
     * Lấy danh sách SanPhams
     */
    public function index(Request $request)
    {
        $params = $request->all();

        // Xử lý và validate parameters
        $params = Helper::validateFilterParams($params);

        $result = $this->sanPhamService->getAll($params);

        return CustomResponse::success([
          'collection' => $result['data'],
          'total' => $result['total'],
          'pagination' => $result['pagination'] ?? null
        ]);
    }
    
    /**
     * Tạo mới SanPham
     */
    public function store(CreateSanPhamRequest $request)
    {
        $result = $this->sanPhamService->create($request->validated());
        return CustomResponse::success($result, 'Tạo mới thành công');
    }
    
    /**
     * Lấy thông tin SanPham
     */
    public function show($id)
    {
        $result = $this->sanPhamService->getById($id);
        return CustomResponse::success($result);
    }
    
    /**
     * Cập nhật SanPham
     */
    public function update(UpdateSanPhamRequest $request, $id)
    {
        $result = $this->sanPhamService->update($id, $request->validated());
        return CustomResponse::success($result, 'Cập nhật thành công');
    }
    
    /**
     * Xóa SanPham
     */
    public function destroy($id)
    {
        $result = $this->sanPhamService->delete($id);
        return CustomResponse::success([], 'Xóa thành công');
    }

    /**
     * Lấy danh sách SanPham dạng option
     */
    public function getOptions()
    {
      $result = $this->sanPhamService->getOptions();
      return CustomResponse::success($result);
    }

    public function downloadTemplateExcel()
    {
      $path = public_path('mau-excel/SanPham.xlsx');
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

      $import = new SanPhamImport();
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
