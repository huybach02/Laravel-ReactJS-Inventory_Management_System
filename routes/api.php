<?php

use App\Class\CustomResponse;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\CauHinhChungController;
use App\Http\Controllers\api\LichSuImportController;
use App\Http\Controllers\api\ThoiGianLamViecController;
use App\Http\Controllers\api\UploadController;
use App\Http\Controllers\api\VaiTroController;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
Route::get('/auth/refresh', [AuthController::class, 'refresh'])->name('refresh');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('reset-password');
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOTP'])->name('verify-otp');

Route::group([

  'middleware' => ['jwt', 'permission'],

], function ($router) {

  // Authenticated
  Route::group(['prefix' => 'auth'], function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('me', [AuthController::class, 'me']);
    Route::post('profile', [AuthController::class, 'updateProfile']);
  });

  // Lấy danh sách phân quyền
  Route::get('danh-sach-phan-quyen', function () {
    return CustomResponse::success(config('permission'));
  });

  // Vai trò
  Route::prefix('vai-tro')->group(function () {
    Route::get('/', [VaiTroController::class, 'index']);
    Route::get('/options', [VaiTroController::class, 'options']);
    Route::post('/', [VaiTroController::class, 'store']);
    Route::get('/{id}', [VaiTroController::class, 'show']);
    Route::put('/{id}', [VaiTroController::class, 'update']);
    Route::delete('/{id}', [VaiTroController::class, 'destroy']);
  });

  // Upload
  Route::post('upload/single', [UploadController::class, 'uploadSingle']);
  Route::post('upload/multiple', [UploadController::class, 'uploadMultiple']);

  // Cấu hình chung
  Route::get('cau-hinh-chung', [CauHinhChungController::class, 'index']);
  Route::post('cau-hinh-chung', [CauHinhChungController::class, 'create']);

  // Thời gian làm việc
  Route::get('thoi-gian-lam-viec', [ThoiGianLamViecController::class, 'index']);
  Route::patch('thoi-gian-lam-viec/{id}', [ThoiGianLamViecController::class, 'update']);

  // Lịch sử import
  Route::get('lich-su-import', [LichSuImportController::class, 'index']);
  Route::get('lich-su-import/download-file/{id}', [LichSuImportController::class, 'downloadFile']);

  // NguoiDung
  Route::prefix('nguoi-dung')->group(function () {
    Route::get('/', [\App\Modules\NguoiDung\NguoiDungController::class, 'index']);
    Route::post('/', [\App\Modules\NguoiDung\NguoiDungController::class, 'store']);
    Route::get('/{id}', [\App\Modules\NguoiDung\NguoiDungController::class, 'show']);
    Route::put('/{id}', [\App\Modules\NguoiDung\NguoiDungController::class, 'update']);
    Route::delete('/{id}', [\App\Modules\NguoiDung\NguoiDungController::class, 'destroy']);
    Route::patch('/ngoai-gio/{id}', [\App\Modules\NguoiDung\NguoiDungController::class, 'changeStatusNgoaiGio']);
  });

  // LoaiKhachHang
  Route::prefix('loai-khach-hang')->group(function () {
    Route::get('/', [\App\Modules\LoaiKhachHang\LoaiKhachHangController::class, 'index']);
    Route::get('/download-template-excel', [\App\Modules\LoaiKhachHang\LoaiKhachHangController::class, 'downloadTemplateExcel']);
    Route::post('/', [\App\Modules\LoaiKhachHang\LoaiKhachHangController::class, 'store']);
    Route::get('/{id}', [\App\Modules\LoaiKhachHang\LoaiKhachHangController::class, 'show']);
    Route::put('/{id}', [\App\Modules\LoaiKhachHang\LoaiKhachHangController::class, 'update']);
    Route::delete('/{id}', [\App\Modules\LoaiKhachHang\LoaiKhachHangController::class, 'destroy']);
    Route::post('/import-excel', [\App\Modules\LoaiKhachHang\LoaiKhachHangController::class, 'importExcel']);
  });
});