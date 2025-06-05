import { Button, Form, Row } from "antd";
import Heading from "../components/heading";
import FormNguoiDung from "./nguoi-dung/FormNguoiDung";
import { useState, useEffect } from "react";
import {
    clearImageSingle,
    setImageSingle,
    setReload,
} from "../redux/slices/main.slice";
import { postData } from "../services/postData.api";
import type { INguoiDungFormValues } from "../types/user.type";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { API_ROUTE_CONFIG } from "../configs/api-route-config";
import { AuthService } from "../services/AuthService";

const Profile = () => {
    const dispatch = useDispatch();

    const { imageSingle } = useSelector((state: RootState) => state.main);

    const [isLoading, setIsLoading] = useState(false);

    const [form] = Form.useForm();

    const fetchProfile = async () => {
        setIsLoading(true);
        const response = await AuthService.fetchUser();
        if (response && response.user) {
            const userData = response.user;

            // Xử lý các trường ngày tháng
            Object.entries(userData).forEach(([key, value]) => {
                if (value && typeof value === "string") {
                    if (
                        /ngay_|_ngay/.test(key) ||
                        /ngay/.test(key) ||
                        /thoi_gian|_thoi/.test(key) ||
                        /birthday/.test(key)
                    ) {
                        // Sử dụng cách type-safe để gán giá trị
                        const dateValue = dayjs(value, "YYYY-MM-DD");
                        (userData as unknown as Record<string, unknown>)[key] =
                            dateValue;
                    }
                }
            });

            // Kiểm tra images trước khi truy cập
            if (userData.images && userData.images.length > 0) {
                dispatch(setImageSingle(userData.images[0].path));
            }

            form.setFieldsValue({
                ...userData,
                province_id: +userData.province_id,
                district_id: +userData.district_id,
                ward_id: +userData.ward_id,
            });
        }
        setIsLoading(false);
    };

    // Gọi fetchProfile khi component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const onCreate = async (values: INguoiDungFormValues) => {
        setIsLoading(true);
        const closeModel = () => {
            dispatch(setReload());
        };
        await postData(
            API_ROUTE_CONFIG.PROFILE,
            {
                ...values,
                birthday: dayjs(values.birthday).format("YYYY-MM-DD"),
                image: imageSingle,
            },
            closeModel
        );
        setIsLoading(false);
        dispatch(clearImageSingle());
        fetchProfile();
    };

    return (
        <div>
            <Heading title="Thông tin cá nhân" />

            <Row>
                <Form
                    id="formThemNguoiDung"
                    form={form}
                    layout="vertical"
                    onFinish={onCreate}
                >
                    <FormNguoiDung
                        form={form}
                        isEditing={false}
                        isUpdateProfile={true}
                    />
                </Form>
            </Row>
            <Row justify="end" key="footer">
                <Button
                    key="submit"
                    form="formThemNguoiDung"
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={isLoading}
                >
                    Lưu
                </Button>
            </Row>
        </div>
    );
};

export default Profile;
