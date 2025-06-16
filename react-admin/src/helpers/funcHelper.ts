/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
// import location from "../configs/location.json";

export const limitText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + "...";
};

export const formatTime = (time: string) => {
    return time ? dayjs(time, "HH:mm").format("HH:mm") : null;
};

export const formatDate = (date: string) => {
    return date ? dayjs(date, "YYYY-MM-DD").format("YYYY-MM-DD") : null;
};

export const formatDateTime = (date: string) => {
    return date
        ? dayjs(date, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm")
        : null;
};

export const formatTimeFromTimestamp = (timestamp: number) => {
    // Timestamp đã ở dạng giây
    const currentTime = Math.floor(Date.now() / 1000);
    // Lấy giá trị tuyệt đối của chênh lệch thời gian
    const timeDiff = Math.abs(timestamp - currentTime);

    const hours = Math.floor(timeDiff / 3600);
    const minutes = Math.floor((timeDiff % 3600) / 60);
    const seconds = timeDiff % 60;

    return hours > 0
        ? `${hours}h ${minutes}m ${seconds}s`
        : minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;
};

export const checkLoginLockout = (): number | null => {
    const storedTimeLockout = localStorage.getItem("time_lockout");

    if (storedTimeLockout) {
        const lockoutTimestamp = parseInt(storedTimeLockout, 10);
        const currentTime = Math.floor(Date.now() / 1000);

        // Nếu thời gian khóa vẫn còn hiệu lực
        if (lockoutTimestamp > currentTime) {
            return lockoutTimestamp;
        } else {
            // Nếu thời gian khóa đã hết
            localStorage.removeItem("time_lockout");
        }
    }

    return null;
};

export const setLoginLockout = (timestamp: number): void => {
    localStorage.setItem("time_lockout", String(timestamp));
};

export const clearLoginLockout = (): void => {
    localStorage.removeItem("time_lockout");
};

export const isLockoutActive = (timestamp: number): boolean => {
    const currentTime = Math.floor(Date.now() / 1000);
    return timestamp > currentTime;
};

export const ConvertTextCheckBox = (key: string): string => {
    switch (key) {
        case "export":
            return "Xuất file";
        case "index":
            return "Xem";
        case "create":
            return "Thêm";
        case "show":
            return "Chi tiết";
        case "edit":
            return "Sửa";
        case "delete":
            return "Xóa";
        case "import":
            return "Nhập file";
        case "showMenu":
            return "Hiện menu";
        default:
            return key;
    }
};

export function mergeArrays(arr1: any, arr2: any) {
    const merged = JSON.parse(JSON.stringify(arr1));

    // Lặp lại từng mục trong arr2 và merge
    arr2.forEach((item2: any) => {
        const item1 = merged.find((item: any) => item.name === item2.name); // Tìm một mục phù hợp trong arr1
        if (item1) {
            item1.actions = { ...item1.actions, ...item2.actions };
        } else {
            merged.push(JSON.parse(JSON.stringify(item2)));
        }
    });

    return merged;
}

export const generateMaPhieu = (prefix: string) => {
    const currentDate = dayjs().format("YYYYMMDD");
    const timeCreate = dayjs().format("HHmmss");
    return `${prefix}-${currentDate}-${timeCreate}`;
};

export const checkIsToday = (date: string) => {
    const parsedDate = dayjs(date, "DD/MM/YYYY HH:mm:ss");
    return parsedDate.isValid() && parsedDate.isSame(dayjs(), "day");
};
