<?php

namespace App\Modules\PhieuNhapKho\Validates;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePhieuNhapKhoRequest extends FormRequest
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
      // Thêm các quy tắc validation cho cập nhật PhieuNhapKho ở đây
      'ma_phieu_nhap_kho' => 'required|string|max:255|unique:phieu_nhap_khos,ma_phieu_nhap_kho,' . $this->id,
      'ngay_nhap_kho' => 'required|date',
      'nha_cung_cap_id' => 'required|exists:nha_cung_caps,id,trang_thai,1',
      'so_hoa_don_nha_cung_cap' => 'required|string|max:255',
      'nguoi_giao_hang' => 'required|string|max:255',
      'so_dien_thoai_nguoi_giao_hang' => 'required|string|max:255',
      'thue_vat' => 'required|integer|min:0|max:100',
      'chi_phi_nhap_hang' => 'required|integer|min:0',
      'giam_gia_nhap_hang' => 'required|integer|min:0',
      'ghi_chu' => 'nullable|string',
      'chi_tiet_phieu_nhap_kho' => 'required|array|min:1',
      'chi_tiet_phieu_nhap_kho.*.san_pham_id' => 'required|exists:san_phams,id,trang_thai,1',
      'chi_tiet_phieu_nhap_kho.*.nha_cung_cap_id' => 'required|exists:nha_cung_caps,id,trang_thai,1',
      'chi_tiet_phieu_nhap_kho.*.don_vi_tinh_id' => 'required|exists:don_vi_tinhs,id,trang_thai,1',
      'chi_tiet_phieu_nhap_kho.*.ngay_san_xuat' => 'required|date|before:ngay_het_han',
      'chi_tiet_phieu_nhap_kho.*.ngay_het_han' => 'required|date|after:ngay_san_xuat',
      'chi_tiet_phieu_nhap_kho.*.gia_nhap' => 'required|integer|min:0',
      'chi_tiet_phieu_nhap_kho.*.so_luong_nhap' => 'required|integer|min:0',
      'chi_tiet_phieu_nhap_kho.*.chiet_khau' => 'required|integer|min:0|max:100',
      'chi_tiet_phieu_nhap_kho.*.ghi_chu' => 'nullable|string',
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
      'ma_phieu_nhap_kho.required' => 'Mã phiếu nhập kho là bắt buộc',
      'ma_phieu_nhap_kho.max' => 'Mã phiếu nhập kho không được vượt quá 255 ký tự',
      'ma_phieu_nhap_kho.unique' => 'Mã phiếu nhập kho đã tồn tại',
      'ngay_nhap_kho.required' => 'Ngày nhập kho là bắt buộc',
      'ngay_nhap_kho.date' => 'Ngày nhập kho không hợp lệ',
      'nha_cung_cap_id.required' => 'Nhà cung cấp là bắt buộc',
      'nha_cung_cap_id.exists' => 'Nhà cung cấp không tồn tại',
      'so_hoa_don_nha_cung_cap.required' => 'Số hóa đơn nhà cung cấp là bắt buộc',
      'so_hoa_don_nha_cung_cap.max' => 'Số hóa đơn nhà cung cấp không được vượt quá 255 ký tự',
      'nguoi_giao_hang.required' => 'Người giao hàng là bắt buộc',
      'nguoi_giao_hang.max' => 'Người giao hàng không được vượt quá 255 ký tự',
      'so_dien_thoai_nguoi_giao_hang.required' => 'Số điện thoại người giao hàng là bắt buộc',
      'so_dien_thoai_nguoi_giao_hang.max' => 'Số điện thoại người giao hàng không được vượt quá 255 ký tự',
      'thue_vat.required' => 'Thuế VAT là bắt buộc',
      'thue_vat.integer' => 'Thuế VAT phải là số nguyên',
      'thue_vat.min' => 'Thuế VAT phải lớn hơn 0',
      'thue_vat.max' => 'Thuế VAT phải nhỏ hơn 100',
      'chi_phi_nhap_hang.required' => 'Chi phí nhập hàng là bắt buộc',
      'chi_phi_nhap_hang.integer' => 'Chi phí nhập hàng phải là số nguyên',
      'chi_phi_nhap_hang.min' => 'Chi phí nhập hàng phải lớn hơn 0',
      'giam_gia_nhap_hang.required' => 'Giảm giá nhập hàng là bắt buộc',
      'giam_gia_nhap_hang.integer' => 'Giảm giá nhập hàng phải là số nguyên',
      'giam_gia_nhap_hang.min' => 'Giảm giá nhập hàng phải lớn hơn 0',
      'ghi_chu.string' => 'Ghi chú phải là chuỗi',
      'chi_tiet_phieu_nhap_kho.required' => 'Chi tiết phiếu nhập kho là bắt buộc',
      'chi_tiet_phieu_nhap_kho.array' => 'Chi tiết phiếu nhập kho phải là mảng',
      'chi_tiet_phieu_nhap_kho.min' => 'Chi tiết phiếu nhập kho phải có ít nhất 1 phần tử',
      'chi_tiet_phieu_nhap_kho.*.san_pham_id.required' => 'Mã sản phẩm là bắt buộc',
      'chi_tiet_phieu_nhap_kho.*.san_pham_id.exists' => 'Mã sản phẩm không tồn tại',
      'chi_tiet_phieu_nhap_kho.*.nha_cung_cap_id.required' => 'Mã nhà cung cấp là bắt buộc',
      'chi_tiet_phieu_nhap_kho.*.nha_cung_cap_id.exists' => 'Mã nhà cung cấp không tồn tại',
      'chi_tiet_phieu_nhap_kho.*.don_vi_tinh_id.required' => 'Mã đơn vị tính là bắt buộc',
      'chi_tiet_phieu_nhap_kho.*.don_vi_tinh_id.exists' => 'Mã đơn vị tính không tồn tại',
      'chi_tiet_phieu_nhap_kho.*.ngay_san_xuat.required' => 'Ngày sản xuất là bắt buộc',
      'chi_tiet_phieu_nhap_kho.*.ngay_san_xuat.date' => 'Ngày sản xuất không hợp lệ',
      'chi_tiet_phieu_nhap_kho.*.ngay_san_xuat.before' => 'Ngày sản xuất phải trước ngày hết hạn',
      'chi_tiet_phieu_nhap_kho.*.ngay_san_xuat.after' => 'Ngày sản xuất phải sau ngày nhập kho',
      'chi_tiet_phieu_nhap_kho.*.ngay_het_han.required' => 'Ngày hết hạn là bắt buộc',
      'chi_tiet_phieu_nhap_kho.*.ngay_het_han.date' => 'Ngày hết hạn không hợp lệ',
      'chi_tiet_phieu_nhap_kho.*.ngay_het_han.after' => 'Ngày hết hạn phải sau ngày sản xuất',
      'chi_tiet_phieu_nhap_kho.*.gia_nhap.required' => 'Giá nhập là bắt buộc',
      'chi_tiet_phieu_nhap_kho.*.gia_nhap.integer' => 'Giá nhập phải là số nguyên',
      'chi_tiet_phieu_nhap_kho.*.gia_nhap.min' => 'Giá nhập phải lớn hơn 0',
      'chi_tiet_phieu_nhap_kho.*.so_luong_nhap.required' => 'Số lượng nhập là bắt buộc',
      'chi_tiet_phieu_nhap_kho.*.so_luong_nhap.integer' => 'Số lượng nhập phải là số nguyên',
      'chi_tiet_phieu_nhap_kho.*.so_luong_nhap.min' => 'Số lượng nhập phải lớn hơn 0',
      'chi_tiet_phieu_nhap_kho.*.chiet_khau.required' => 'Chiết khấu là bắt buộc',
      'chi_tiet_phieu_nhap_kho.*.chiet_khau.integer' => 'Chiết khấu phải là số nguyên',
      'chi_tiet_phieu_nhap_kho.*.chiet_khau.min' => 'Chiết khấu phải lớn hơn 0',
      'chi_tiet_phieu_nhap_kho.*.chiet_khau.max' => 'Chiết khấu phải nhỏ hơn 100',
      'chi_tiet_phieu_nhap_kho.*.ghi_chu.string' => 'Ghi chú phải là chuỗi',
    ];
  }
}