import { Typography } from "antd";
import { useResponsive } from "../hooks/useReponsive";

const Heading = ({ title }: { title: string }) => {
    const { isMobile } = useResponsive();

    return (
        <div>
            <Typography.Title
                level={isMobile ? 3 : 2}
                style={{ marginBottom: 20 }}
            >
                {title}
            </Typography.Title>
        </div>
    );
};

export default Heading;
