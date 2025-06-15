import { gioiTinhSelect } from "../../configs/select-config";
import { passwordPattern, phonePattern } from "../../utils/patterns";
import type { FormInstance } from "antd";
import { Row, Col, Form, Input, DatePicker, Select } from "antd";
import { useState, useEffect } from "react";
import location from "../../utils/location.json";
import { trangThaiSelect } from "../../configs/select-config";
import type {
    IProvinceItem,
    IDistrictItem,
    ILocationItem,
} from "../../types/main.type";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import ImageUploadSingle from "../../components/upload/ImageUploadSingle";
import SelectFormApi from "../../components/select/SelectFormApi";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";

const FormNguoiDung = ({
    isEditing,
    form,
    isUpdateProfile = false,
}: {
    isEditing: boolean;
    form: FormInstance;
    isUpdateProfile?: boolean;
}) => {
    const [provinces, setProvinces] = useState<IProvinceItem[]>([]);
    const [districts, setDistricts] = useState<IDistrictItem[]>([]);
    const [wards, setWards] = useState<ILocationItem[]>([]);
    const [isDisabled, setIsDisabled] = useState(true);

    const { isModalReload } = useSelector((state: RootState) => state.main);

    // Khởi tạo danh sách tỉnh/thành phố
    useEffect(() => {
        setIsDisabled(true);
        setDistricts([]);
        setWards([]);
        if (location && Array.isArray(location)) {
            setProvinces(location);
            const allDistricts = location.flatMap(
                (province) => province.districts
            );
            setDistricts(allDistricts);

            const allWards = allDistricts.flatMap((district) => district.wards);
            setWards(allWards);
        }
    }, [isModalReload]);

    const handleProvinceChange = (value: number) => {
        setIsDisabled(false);
        // Tìm tỉnh/thành phố được chọn
        const selectedProvince = provinces.find(
            (province) => province.code === value
        );

        // Cập nhật danh sách quận/huyện
        if (selectedProvince) {
            setDistricts(selectedProvince.districts);
        } else {
            setDistricts([]);
        }

        setWards([]);

        // Reset giá trị trong form
        form.resetFields(["district_id", "ward_id"]);
    };

    const handleDistrictChange = (value: number) => {
        // Tìm quận/huyện được chọn
        const selectedDistrict = districts.find(
            (district) => district.code === value
        );

        // Cập nhật danh sách xã/phường
        if (selectedDistrict) {
            setWards(selectedDistrict.wards);
        } else {
            setWards([]);
        }

        // Reset xã/phường đã chọn
        form.resetFields(["ward_id"]);
    };

    return (
        <Row gutter={[10, 10]}>
            <Col span={8} xs={24} lg={8}>
                <Form.Item name="avatar" label="Ảnh đại diện">
                    <ImageUploadSingle />
                </Form.Item>
            </Col>
            <Col span={16} xs={24} lg={16}>
                <SelectFormApi
                    name="ma_vai_tro"
                    label="Vai trò"
                    rules={[
                        {
                            required: true,
                            message: "Vai trò không được bỏ trống!",
                        },
                    ]}
                    path={API_ROUTE_CONFIG.VAI_TRO_OPTIONS}
                    placeholder="Chọn vai trò"
                    disabled={isUpdateProfile}
                />
            </Col>
            <Col span={8} xs={24} lg={8}>
                <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[
                        {
                            required: true,
                            message: "Họ và tên không được bỏ trống!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập họ và tên" />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} lg={8}>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        {
                            type: "email",
                            message: "Vui lòng nhập đúng định dạng email",
                        },
                        {
                            required: true,
                            message: "Email không được bỏ trống!",
                        },
                    ]}
                >
                    <Input
                        placeholder="Nhập email"
                        disabled={isUpdateProfile || isEditing}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} lg={8}>
                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                        {
                            required: true,
                            message: "Số điện thoại không được bỏ trống!",
                        },
                        {
                            pattern: phonePattern,
                            message: "Số điện thoại không hợp lệ!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
            </Col>

            {!isEditing && !isUpdateProfile ? (
                <>
                    <Col span={8} xs={24} lg={8}>
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                {
                                    required: true,
                                    message: "Mật khẩu không được bỏ trống!",
                                },
                                {
                                    pattern: passwordPattern,
                                    message: "Mật khẩu không hợp lệ!",
                                },
                            ]}
                        >
                            <Input
                                type={"password"}
                                placeholder="Nhập mật khẩu"
                                disabled={isEditing}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8} xs={24} lg={8}>
                        <Form.Item
                            name="confirm_password"
                            label="Xác nhận mật khẩu"
                            dependencies={["password"]}
                            hidden={isEditing}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Xác nhận mật khẩu không được bỏ trống!",
                                },
                                {
                                    pattern: passwordPattern,
                                    message: "Mật khẩu không hợp lệ!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (
                                            !value ||
                                            getFieldValue("password") === value
                                        ) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error(
                                                "Hai mật khẩu không khớp!"
                                            )
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input
                                type={"password"}
                                placeholder="Nhập xác nhận mật khẩu"
                                disabled={isEditing}
                            />
                        </Form.Item>
                    </Col>
                </>
            ) : (
                ""
            )}
            {!isEditing && !isUpdateProfile && (
                <Col span={8} xs={24} lg={8}></Col>
            )}
            <Col span={8} xs={24} lg={8}>
                <Form.Item
                    name="birthday"
                    label="Ngày sinh"
                    rules={[
                        {
                            required: true,
                            message: "Ngày sinh không được bỏ trống",
                        },
                    ]}
                >
                    <DatePicker
                        placeholder="Chọn ngày sinh"
                        format={"DD/MM/YYYY"}
                        style={{ width: "100%" }}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} lg={8}>
                <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[
                        {
                            required: true,
                            message: "Giới tính không được bỏ trống",
                        },
                    ]}
                >
                    <Select
                        options={gioiTinhSelect}
                        placeholder="Chọn giới tính"
                    />
                </Form.Item>
            </Col>
            {!isEditing && <Col span={8}></Col>}
            <Col span={8} xs={24} lg={8}>
                <Form.Item
                    name="province_id"
                    label="Tỉnh/Thành phố"
                    rules={[
                        {
                            required: true,
                            message: "Tỉnh/Thành phố không được bỏ trống!",
                        },
                    ]}
                >
                    <Select
                        placeholder="Chọn tỉnh/thành phố"
                        onChange={handleProvinceChange}
                        options={provinces.map((province) => ({
                            label: province.name,
                            value: province.code,
                        }))}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} lg={8}>
                <Form.Item
                    name="district_id"
                    label="Quận/Huyện"
                    rules={[
                        {
                            required: true,
                            message: "Quận/Huyện không được bỏ trống!",
                        },
                    ]}
                >
                    <Select
                        placeholder="Chọn quận/huyện"
                        onChange={handleDistrictChange}
                        options={districts.map((district) => ({
                            label: district.name,
                            value: district.code,
                        }))}
                        disabled={isDisabled}
                    />
                </Form.Item>
            </Col>
            <Col span={8} xs={24} lg={8}>
                <Form.Item
                    name="ward_id"
                    label="Xã/Phường"
                    rules={[
                        {
                            required: true,
                            message: "Xã/Phường không được bỏ trống!",
                        },
                    ]}
                >
                    <Select
                        placeholder="Chọn xã/phường"
                        options={wards.map((ward) => ({
                            label: ward.name,
                            value: ward.code,
                        }))}
                        disabled={isDisabled}
                    />
                </Form.Item>
            </Col>
            <Col span={24} xs={24} lg={24}>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[
                        {
                            required: true,
                            message: `Địa chỉ không được bỏ trống!`,
                        },
                    ]}
                >
                    <Input.TextArea placeholder="Nhập số nhà, đường" />
                </Form.Item>
            </Col>
            {!isUpdateProfile && (
                <Col span={24} xs={24} lg={24}>
                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        initialValue={1}
                    >
                        <Select options={trangThaiSelect} />
                    </Form.Item>
                </Col>
            )}
        </Row>
    );
};

export default FormNguoiDung;
