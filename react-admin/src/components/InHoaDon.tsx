import React from "react";
import { Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { xemTruocHoaDon } from "../services/invoice";

interface InvoicePrintButtonProps {
    donHangId: number;
    disabled?: boolean;
}

const InHoaDon: React.FC<InvoicePrintButtonProps> = ({
    donHangId,
    disabled = false,
}) => {
    const handleXemTruoc = () => {
        xemTruocHoaDon(donHangId);
    };

    return (
        <Button
            type="primary"
            icon={<PrinterOutlined />}
            disabled={disabled}
            size="small"
            style={{
                marginRight: 5,
            }}
            onClick={handleXemTruoc}
        />
    );
};

export default InHoaDon;
