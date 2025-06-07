import { Upload, type GetProp, type UploadProps } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { useState } from "react";
import { toast } from "../../utils/toast";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import axios from "../../configs/axios";
import { useDispatch, useSelector } from "react-redux";
import { setImageSingle } from "../../redux/slices/main.slice";
import type { RootState } from "../../redux/store";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const ImageUploadSingle = () => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const imageUrl = useSelector((state: RootState) => state.main.imageSingle);

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng =
            file.type === "image/jpeg" || file.type === "image/png";
        if (!isJpgOrPng) {
            toast.error("Bạn chỉ được upload file JPG/PNG!");
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            toast.error("Ảnh phải nhỏ hơn 2MB!");
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange: UploadProps["onChange"] = (info) => {
        if (info.file.status === "uploading") {
            setLoading(true);
            return;
        }

        if (info.file.status !== "done") {
            // Chỉ xử lý khi file không ở trạng thái 'done'
            const formData = new FormData();
            formData.append("image", info.file.originFileObj as File);

            axios
                .post(API_ROUTE_CONFIG.UPLOAD_SINGLE, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((res) => {
                    setLoading(false);
                    dispatch(setImageSingle(res.data.url));
                    info.file.status = "done"; // Đánh dấu đã xử lý xong
                })
                .catch((error) => {
                    setLoading(false);
                    toast.error("Upload thất bại");
                    console.error(error);
                });
        }
    };

    const uploadButton = (
        <button style={{ border: 0, background: "none" }} type="button">
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    return (
        <Flex gap="middle" wrap>
            <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleChange}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="avatar"
                        style={{ width: "100%" }}
                    />
                ) : (
                    uploadButton
                )}
            </Upload>
        </Flex>
    );
};

export default ImageUploadSingle;
