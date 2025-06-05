export const randomPassword = () => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "#?!@$%^&*-";
    const allChars = uppercaseChars + lowercaseChars + numbers + specialChars;

    let password = "";

    //Todo Đảm bảo mật khẩu có ít nhất 1 ký tự in hoa, 1 ký tự thường, 1 số, và 1 ký tự đặc biệt
    password +=
        uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password +=
        lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    //Todo Thêm các ký tự ngẫu nhiên còn lại để đủ 8 ký tự
    while (password.length < 8) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    //Todo Trộn mật khẩu để đảm bảo sự phân phối ngẫu nhiên
    password = password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");

    return password;
};
