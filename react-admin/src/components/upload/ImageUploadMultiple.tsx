import { Button, Image, Upload, type GetProp, type UploadProps } from "antd";
import {
    DeleteOutlined,
    LoadingOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { Flex } from "antd";
import { useState } from "react";
import { toast } from "../../utils/toast";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";
import axios from "../../configs/axios";
import { useDispatch, useSelector } from "react-redux";
import { setImageMultiple } from "../../redux/slices/main.slice";
import type { RootState } from "../../redux/store";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const ImageUploadMultiple = () => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const imageMultiple = useSelector(
        (state: RootState) => state.main.imageMultiple
    );

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
            info.fileList.forEach((file) => {
                formData.append("images[]", file.originFileObj as File);
            });

            axios
                .post(API_ROUTE_CONFIG.UPLOAD_MULTIPLE, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((res) => {
                    setLoading(false);
                    dispatch(setImageMultiple(res.data.urls));
                    info.file.status = "done"; // Đánh dấu đã xử lý xong
                })
                .catch((error) => {
                    setLoading(false);
                    toast.error("Upload thất bại");
                    console.error(error);
                });
        }
    };

    const handleDeleteImage = (imageToDelete: string) => {
        // Lọc ra các ảnh còn lại (không bao gồm ảnh cần xóa)
        const updatedImages = imageMultiple.filter(
            (image) => image !== imageToDelete
        );
        // Cập nhật lại state trong Redux
        dispatch(setImageMultiple(updatedImages));
        toast.success("Đã xóa ảnh");
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
                multiple
            >
                {uploadButton}
            </Upload>
            <Flex align="center" justify="center" gap="middle" wrap>
                {imageMultiple.length > 0
                    ? imageMultiple.map((image, index) => (
                          <div
                              key={index}
                              style={{
                                  position: "relative",
                                  marginBottom: "10px",
                              }}
                          >
                              <Image
                                  src={image}
                                  alt="avatar"
                                  width={100}
                                  height={100}
                              />
                              <Button
                                  type="primary"
                                  danger
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  onClick={() => handleDeleteImage(image)}
                                  style={{
                                      position: "absolute",
                                      top: "0px",
                                      right: "0px",
                                  }}
                              />
                          </div>
                      ))
                    : null}
            </Flex>
        </Flex>
    );
};

export default ImageUploadMultiple;
