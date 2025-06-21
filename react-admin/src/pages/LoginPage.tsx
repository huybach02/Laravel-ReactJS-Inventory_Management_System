import { Button, Checkbox, Flex, Form, Input } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../redux/store";
import { setLoading } from "../redux/slices/main.slice";
import { AuthService } from "../services/AuthService";
import type { LoginForm, LoginResponseError } from "../types/auth.type";
import { useEffect, useState } from "react";
import {
    formatTimeFromTimestamp,
    checkLoginLockout,
    setLoginLockout,
    clearLoginLockout,
    isLockoutActive,
} from "../helpers/funcHelper";
import { URL_CONSTANTS } from "../configs/api-route-config";

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [lockoutTime, setLockoutTime] = useState("");
    const [timerId, setTimerId] = useState<ReturnType<
        typeof setInterval
    > | null>(null);

    const { isLoading } = useSelector((state: RootState) => state.main);

    // Hàm cập nhật hiển thị thời gian còn lại
    const updateLockoutTime = (timestamp: number) => {
        setLockoutTime(formatTimeFromTimestamp(timestamp));
    };

    // Hàm thiết lập khóa đăng nhập
    const setupLockout = (timestamp: number) => {
        // Lưu thời gian khóa
        setLoginLockout(timestamp);

        // Cập nhật trạng thái khó
        updateLockoutTime(timestamp);

        // Xóa interval cũ nếu có
        if (timerId) {
            clearInterval(timerId);
        }

        // Tạo interval mới để cập nhật thời gian còn lại mỗi giây
        const intervalId = setInterval(() => {
            if (!isLockoutActive(timestamp)) {
                // Nếu đã hết thời gian khóa
                clearInterval(intervalId);
                setLockoutTime("");
                clearLoginLockout();
            } else {
                // Cập nhật hiển thị thời gian còn lại
                updateLockoutTime(timestamp);
            }
        }, 1000);

        setTimerId(intervalId);
    };

    // Xử lý khi người dùng đăng nhập
    const onFinish = async (values: LoginForm) => {
        dispatch(setLoading(true));
        const response = await AuthService.login(values);
        dispatch(setLoading(false));

        // Đăng nhập thành công
        if (response?.success) {
            if (response?.data?.is_2fa) {
                // Nếu cần xác thực 2 yếu tố
                navigate(URL_CONSTANTS.VERIFY_OTP);
                localStorage.setItem("user_id", response?.data?.user_id || "");
            } else {
                // Chuyển đến trang dashboard
                navigate(URL_CONSTANTS.DASHBOARD);
            }
        } else {
            // Đăng nhập thất bại
            const errorResponse = response as unknown as LoginResponseError;

            // Nếu tài khoản bị khóa
            if (
                errorResponse?.errors?.is_lockout &&
                errorResponse?.errors?.time_lockout
            ) {
                setupLockout(errorResponse.errors.time_lockout);
            }
        }
    };

    // Kiểm tra trạng thái khóa khi tải trang
    useEffect(() => {
        // Kiểm tra xem có đang bị khóa không
        const lockoutTimestamp = checkLoginLockout();

        if (lockoutTimestamp) {
            setupLockout(lockoutTimestamp);
        }

        // Clear interval khi component bị hủy
        return () => {
            if (timerId) {
                clearInterval(timerId);
            }
        };
    }, []);

    return (
        <Form
            name="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
        >
            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                ]}
                initialValue={"huybach2002ct@gmail.com"}
            >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập mật khẩu!",
                    },
                ]}
                initialValue={"password"}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                />
            </Form.Item>

            <Flex justify="space-between" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ tôi</Checkbox>
                </Form.Item>
                <a href={URL_CONSTANTS.FORGOT_PASSWORD}>Quên mật khẩu?</a>
            </Flex>

            <Form.Item style={{ marginTop: 24 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={isLoading}
                    disabled={lockoutTime !== ""}
                >
                    {lockoutTime !== ""
                        ? `Thử lại sau ${lockoutTime}`
                        : "Đăng nhập"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default LoginPage;
