<?php

namespace App\Models;

use App\Traits\DateTimeFormatter;
use App\Traits\UserNameResolver;
use App\Traits\UserTrackable;
use Illuminate\Database\Eloquent\Model;

class ChiTietCongThuc extends Model
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


  // Kết nối sẵn với bảng images để lưu ảnh
  public function images()
  {
    return $this->morphMany(Image::class, 'imageable');
  }

  // Relationship với CongThucSanXuat
  public function congThucSanXuat()
  {
    return $this->belongsTo(CongThucSanXuat::class);
  }

  // Relationship với SanPham
  public function sanPham()
  {
    return $this->belongsTo(SanPham::class);
  }

  // Relationship với DonViTinh
  public function donViTinh()
  {
    return $this->belongsTo(DonViTinh::class);
  }
}