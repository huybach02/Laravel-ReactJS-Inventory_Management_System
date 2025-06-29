export const KEY_URL_VALID = ["dashboard", "profile", "lich-su-import"];

export const DATA_CONSTANTS = {
    WEBSITE_NAME: "IMS",
    PANEL_NAME: "Trang quản trị",
};

export const OPTIONS_STATUS = [
    { value: "1", label: "Hoạt động" },
    { value: "0", label: "Không hoạt động" },
];

export const OPTIONS_STATUS_TON_KHO = [
    { value: "0", label: "Hết hàng" },
    { value: "1", label: "Sắp hết hàng" },
    { value: "2", label: "Ổn định" },
];

export const OPTIONS_CHO_PHEP_NGOAI_GIO = [
    { value: "1", label: "Cho phép" },
    { value: "0", label: "Không cho phép" },
];

export const OPTIONS_GIOI_TINH = [
    { value: "Nam", label: "Nam" },
    { value: "Nữ", label: "Nữ" },
];

export const OPTIONS_LOAI_PHIEU_NHAP = [
    { value: 1, label: "Nhập từ nhà cung cấp" },
    { value: 2, label: "Nhập đổi hàng" },
    { value: 3, label: "Nhập từ sản xuất" },
];

export const OPTIONS_LOAI_PHIEU_XUAT = [
    { value: 1, label: "Xuất theo đơn hàng" },
    { value: 2, label: "Xuất hủy" },
    { value: 3, label: "Xuất nguyên liệu sản xuất" },
];

export const OPTIONS_LOAI_PHIEU_CHI = [
    { value: 1, label: "Thanh toán phiếu nhập kho" },
    { value: 4, label: "Thanh toán nhiều phiếu nhập kho" },
    { value: 2, label: "Thanh toán công nợ nhà cung cấp" },
    { value: 3, label: "Chi khác" },
];

export const OPTIONS_PHUONG_THUC_THANH_TOAN = [
    { value: 1, label: "Tiền mặt" },
    { value: 2, label: "Chuyển khoản" },
];

export const OPTIONS_LOAI_KHACH_HANG = [
    { value: 0, label: "Khách hàng hệ thống" },
    { value: 1, label: "Khách hàng vãng lai" },
];

export const OPTIONS_LOAI_THANH_TOAN = [
    { value: 0, label: "Chưa thanh toán" },
    { value: 1, label: "Thanh toán một phần - đặt cọc" },
    { value: 2, label: "Thanh toán toàn bộ" },
];

export const OPTIONS_TRANG_THAI_THANH_TOAN = [
    { value: 0, label: "Chưa hoàn thành" },
    { value: 1, label: "Đã hoàn thành" },
];

export const OPTIONS_TRANG_THAI_XUAT_KHO = [
    { value: 0, label: "Chưa xuất kho" },
    { value: 1, label: "Đã có xuất kho" },
    { value: 2, label: "Đã hoàn thành" },
];

export const OPTIONS_LOAI_PHIEU_THU = [
    { value: 1, label: "Thu cho đơn hàng" },
    { value: 2, label: "Thu cho nhiều đơn hàng theo khách hàng" },
    { value: 3, label: "Thu công nợ khách hàng" },
    { value: 4, label: "Thu khác" },
];
