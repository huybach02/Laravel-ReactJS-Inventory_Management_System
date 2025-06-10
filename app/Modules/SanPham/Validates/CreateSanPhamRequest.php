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
            'name' => 'required|string|max:255',
            // 'description' => 'nullable|string',
            // 'active' => 'boolean',
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
            'name.required' => 'Tên SanPham là bắt buộc',
            'name.max' => 'Tên SanPham không được vượt quá 255 ký tự',
        ];
    }
}
