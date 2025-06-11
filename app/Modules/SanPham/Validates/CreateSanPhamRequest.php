<?php

namespace App\Modules\SanPham\Validates;

use Illuminate\Foundation\Http\FormRequest;

class CreateSanPhamRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true;
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      // Thêm các quy tắc validation cho SanPham ở đây
      'ma_san_pham' => 'required|string|max:255|unique:san_phams,ma_san_pham',
      'ten_san_pham' => 'required|string|max:255',
      'image' => 'nullable|string',
      'danh_muc_id' => 'required|integer|exists:danh_muc_san_phams,id',
      'don_vi_tinh_id' => 'nullable|array',
      'nha_cung_cap_id' => 'nullable|array',
      'gia_nhap_mac_dinh' => 'required|numeric',
      'ty_le_chiet_khau' => 'required|numeric|min:0|max:100',
      'muc_loi_nhuan' => 'required|numeric|min:0|max:100',
      'so_luong_canh_bao' => 'required|numeric|min:0',
      'ghi_chu' => 'nullable|string',
      'trang_thai' => 'required|integer|in:0,1',
    ];
  }

  /**
   * Get the error messages for the defined validation rules.
   *
   * @return array<string, string>
   */
  public function messages(): array
  {
    return [
      'ma_san_pham.required' => 'Mã sản phẩm là bắt buộc',
      'ma_san_pham.max' => 'Mã sản phẩm không được vượt quá 255 ký tự',
      'ten_san_pham.required' => 'Tên sản phẩm là bắt buộc',
      'ten_san_pham.max' => 'Tên sản phẩm không được vượt quá 255 ký tự',
      'danh_muc_id.required' => 'Danh mục sản phẩm là bắt buộc',
      'danh_muc_id.integer' => 'Danh mục sản phẩm phải là số nguyên',
      'danh_muc_id.exists' => 'Danh mục sản phẩm không tồn tại',
      'don_vi_tinh_id.required' => 'Đơn vị tính là bắt buộc',
      'don_vi_tinh_id.array' => 'Đơn vị tính phải là mảng',
      'don_vi_tinh_id.min' => 'Đơn vị tính phải có ít nhất 1 phần tử',
      'nha_cung_cap_id.required' => 'Nhà cung cấp là bắt buộc',
      'nha_cung_cap_id.array' => 'Nhà cung cấp phải là mảng',
      'nha_cung_cap_id.min' => 'Nhà cung cấp phải có ít nhất 1 phần tử',
      'gia_nhap_mac_dinh.required' => 'Giá nhập mặc định là bắt buộc',
      'gia_nhap_mac_dinh.numeric' => 'Giá nhập mặc định phải là số',
      'ty_le_chiet_khau.required' => 'Tỷ lệ chiết khấu là bắt buộc',
      'ty_le_chiet_khau.numeric' => 'Tỷ lệ chiết khấu phải là số',
      'ty_le_chiet_khau.min' => 'Tỷ lệ chiết khấu phải lớn hơn 0',
      'ty_le_chiet_khau.max' => 'Tỷ lệ chiết khấu phải nhỏ hơn 100',
      'muc_loi_nhuan.required' => 'Mức lợi nhuận là bắt buộc',
      'muc_loi_nhuan.numeric' => 'Mức lợi nhuận phải là số',
      'muc_loi_nhuan.min' => 'Mức lợi nhuận phải lớn hơn 0',
      'muc_loi_nhuan.max' => 'Mức lợi nhuận phải nhỏ hơn 100',
      'so_luong_canh_bao.required' => 'Số lượng cảnh báo là bắt buộc',
      'so_luong_canh_bao.numeric' => 'Số lượng cảnh báo phải là số',
      'so_luong_canh_bao.min' => 'Số lượng cảnh báo phải lớn hơn 0',
      'trang_thai.required' => 'Trạng thái là bắt buộc',
      'trang_thai.integer' => 'Trạng thái phải là số nguyên',
      'trang_thai.in' => 'Trạng thái phải là 0 hoặc 1',
    ];
  }
}