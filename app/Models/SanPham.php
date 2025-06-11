<?php

namespace App\Models;

use App\Traits\DateTimeFormatter;
use App\Traits\UserNameResolver;
use App\Traits\UserTrackable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SanPham extends Model
{
  //

  use UserTrackable, UserNameResolver, DateTimeFormatter;

  protected $guarded = [];

  protected static function boot()
  {
    parent::boot();

    static::saving(function ($model) {
      unset($model->attributes['image']);
    });
  }

  public function donViTinhs(): BelongsToMany
  {
    return $this->belongsToMany(DonViTinh::class, 'don_vi_tinh_san_phams', 'san_pham_id', 'don_vi_tinh_id')->withTimestamps();
  }

  public function donViTinhSanPhams(): HasMany
  {
    return $this->hasMany(DonViTinhSanPham::class);
  }

  public function nhaCungCaps(): BelongsToMany
  {
    return $this->belongsToMany(NhaCungCap::class, 'nha_cung_cap_san_phams', 'san_pham_id', 'nha_cung_cap_id')->withTimestamps();
  }

  public function nhaCungCapSanPhams(): HasMany
  {
    return $this->hasMany(NhaCungCapSanPham::class);
  }

  public function danhMuc(): BelongsTo
  {
    return $this->belongsTo(DanhMucSanPham::class);
  }


  // Kết nối sẵn với bảng images để lưu ảnh
  public function images()
  {
    return $this->morphMany(Image::class, 'imageable');
  }
}