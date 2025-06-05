import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RootState } from "../redux/store";
import { setLoading } from "../redux/slices/main.slice";
import { AuthService } from "../services/AuthService";
import type { ResetPasswordForm } from "../types/auth.type";
import { Button, Form, Input } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { URL_CONSTANTS } from "../configs/api-route-config";

const ResetPassword = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const { isLoading } = useSelector((state: RootState) => state.main);

    const onSubmit = async (data: ResetPasswordForm) => {
        dispatch(setLoading(true));
        const response = await AuthService.resetPassword({
            ...data,
            token: token as string,
        });
        dispatch(setLoading(false));

        if (response?.success) {
            navigate(URL_CONSTANTS.LOGIN);
        }
    };

    return (
        <Form
            name="reset-password-form"
            onFinish={onSubmit}
            layout="vertical"
            size="large"
        >
            <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                />
            </Form.Item>

            <Form.Item
                name="password_confirmation"
                label="Nhập lại mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập lại mật khẩu"
                />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={isLoading}
                >
                    Gửi yêu cầu
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ResetPassword;
