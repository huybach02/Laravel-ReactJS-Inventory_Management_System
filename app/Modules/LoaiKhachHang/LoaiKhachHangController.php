<?php

namespace App\Modules\LoaiKhachHang;

use App\Http\Controllers\Controller;
use App\Modules\LoaiKhachHang\Validates\CreateLoaiKhachHangRequest;
use App\Modules\LoaiKhachHang\Validates\UpdateLoaiKhachHangRequest;
use App\Class\CustomResponse;
use App\Class\Helper;
use Illuminate\Http\Request;

class LoaiKhachHangController extends Controller
{
    protected $loaiKhachHangService;
    
    public function __construct(LoaiKhachHangService $loaiKhachHangService)
    {
        $this->loaiKhachHangService = $loaiKhachHangService;
    }
    
    /**
     * Lấy danh sách LoaiKhachHangs
     */
    public function index(Request $request)
    {
        $params = $request->all();

        // Xử lý và validate parameters
        $params = Helper::validateFilterParams($params);

        $result = $this->loaiKhachHangService->getAll($params);

        return CustomResponse::success([
          'collection' => $result['data'],
          'total' => $result['total'],
          'pagination' => $result['pagination'] ?? null
        ]);
    }
    
    /**
     * Tạo mới LoaiKhachHang
     */
    public function store(CreateLoaiKhachHangRequest $request)
    {
        $result = $this->loaiKhachHangService->create($request->validated());
        return CustomResponse::success($result, 'Tạo mới thành công');
    }
    
    /**
     * Lấy thông tin LoaiKhachHang
     */
    public function show($id)
    {
        $result = $this->loaiKhachHangService->getById($id);
        return CustomResponse::success($result);
    }
    
    /**
     * Cập nhật LoaiKhachHang
     */
    public function update(UpdateLoaiKhachHangRequest $request, $id)
    {
        $result = $this->loaiKhachHangService->update($id, $request->validated());
        return CustomResponse::success($result, 'Cập nhật thành công');
    }
    
    /**
     * Xóa LoaiKhachHang
     */
    public function destroy($id)
    {
        $result = $this->loaiKhachHangService->delete($id);
        return CustomResponse::success([], 'Xóa thành công');
    }
}
