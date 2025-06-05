import { Button, Input } from "antd";

import { Form } from "antd";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import type { VerifyOTPForm } from "../types/auth.type";
import { setLoading } from "../redux/slices/main.slice";
import { AuthService } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { setAuthLogout } from "../redux/slices/auth.slice";
import { URL_CONSTANTS } from "../configs/api-route-config";

const VerifyOTP = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading } = useSelector((state: RootState) => state.main);

    const onSubmit = async (data: VerifyOTPForm) => {
        dispatch(setLoading(true));
        const user_id = localStorage.getItem("user_id");
        const response = await AuthService.verifyOTP({
            ...data,
            user_id: user_id || "",
        });
        dispatch(setLoading(false));

        if (response?.success) {
            navigate(URL_CONSTANTS.DASHBOARD);
            localStorage.removeItem("user_id");
        } else {
            if (response?.errors?.is_navigate_to_login) {
                navigate(URL_CONSTANTS.LOGIN);
                dispatch(setAuthLogout());
            }
        }
    };

    return (
        <>
            <Form
                name="forgot-password-form"
                onFinish={onSubmit}
                layout="vertical"
                size="large"
            >
                <Form.Item
                    name="otp"
                    label="OTP"
                    rules={[{ required: true, message: "Vui lòng nhập OTP!" }]}
                >
                    <Input.OTP
                        length={6}
                        type="text"
                        inputMode="numeric"
                        className="numeric-only-otp"
                        onKeyPress={(e) => {
                            // Chặn các phím không phải số
                            if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                    />
                </Form.Item>

                <Form.Item style={{ marginTop: 24 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={isLoading}
                    >
                        Xác thực
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default VerifyOTP;
