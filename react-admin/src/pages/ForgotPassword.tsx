import { Button, Form, Input } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setLoading } from "../redux/slices/main.slice";
import { AuthService } from "../services/AuthService";
import type { ForgotPasswordForm } from "../types/auth.type";

const ForgotPassword = () => {
    const dispatch = useDispatch();

    const { isLoading } = useSelector((state: RootState) => state.main);

    const onSubmit = async (data: ForgotPasswordForm) => {
        dispatch(setLoading(true));
        await AuthService.forgotPassword(data);
        dispatch(setLoading(false));
    };

    return (
        <Form
            name="forgot-password-form"
            onFinish={onSubmit}
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
            >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
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

export default ForgotPassword;
