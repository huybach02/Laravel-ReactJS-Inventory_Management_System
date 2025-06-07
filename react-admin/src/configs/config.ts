export const apiURL = import.meta.env.VITE_API_URL || "https://ims.test/api";

export const perPage = import.meta.env.VITE_PER_PAGE || 20;
export const sortColumn = import.meta.env.VITE_COLUMN_SORT || "id";
export const sortDirection = import.meta.env.VITE_DIRECTION_SORT || "desc";

export const scales = ["", "nghìn", "triệu", "tỷ"];
export const ones = [
    "",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
];
export const tens = [
    "",
    "mười",
    "hai mươi",
    "ba mươi",
    "bốn mươi",
    "năm mươi",
    "sáu mươi",
    "bảy mươi",
    "tám mươi",
    "chín mươi",
];
