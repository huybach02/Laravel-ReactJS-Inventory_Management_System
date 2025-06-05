/* eslint-disable @typescript-eslint/no-explicit-any */
export const optionDateTime = [
    {
        value: "equal_to",
        label: "Ngày",
    },
    {
        value: "less_than",
        label: "Nhỏ hơn ngày",
    },
    {
        value: "greater_than",
        label: "Lớn hơn ngày",
    },
    {
        value: "less_than_or_equal_to",
        label: "Nhỏ hơn hoặc bằng ngày",
    },
    {
        value: "greater_than_or_equal_to",
        label: "Lớn hơn hoặc bằng ngày",
    },
    {
        value: "between",
        label: "Từ ngày đến ngày",
    },
];

export const gioiTinhSelect = [
    {
        value: "Nam",
        label: "Nam",
    },
    {
        value: "Nữ",
        label: "Nữ",
    },
];

export const ngaySelect: any[] = [{ value: 0, label: "Tất cả" }];
export const thangSelect: any[] = [{ value: 0, label: "Tất cả" }];

for (let i = 1; i <= 31; i++) {
    ngaySelect.push({ value: i, label: `Ngày ${i}` });
}

for (let i = 1; i <= 12; i++) {
    thangSelect.push({ value: i, label: `Tháng ${i}` });
}

export const mucDoThaoTac = [
    { value: "Bình thường", label: "Bình thường", color: "green" },
    { value: "Cao", label: "Cao", color: "orange" },
    { value: "Nghiêm trọng", label: "Nghiêm trọng", color: "red" },
];

export const validDay = [
    "thứ 2",
    "thứ 3",
    "thứ 4",
    "thứ 5",
    "thứ 6",
    "thứ 7",
    "chủ nhật",
];

export const trangThaiSelect = [
    {
        label: "Kích hoạt",
        value: 1,
    },
    {
        label: "Không kích hoạt",
        value: 0,
    },
];
