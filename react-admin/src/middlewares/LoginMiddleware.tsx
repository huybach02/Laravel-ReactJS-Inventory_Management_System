import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthService } from "../services/AuthService";
import Loading from "../components/loading";
import { setNavigate } from "../configs/axios";
import { URL_CONSTANTS } from "../configs/api-route-config";

const LoginMiddleware = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [checkLogin, setCheckLogin] = useState(false);

    useEffect(() => {
        // Thiết lập navigate cho axios
        setNavigate(navigate);

        const checkAuth = async () => {
            try {
                if (localStorage.getItem("token")) {
                    const userData = await AuthService.fetchUser();
                    if (userData?.user) {
                        navigate(URL_CONSTANTS.DASHBOARD);
                        return;
                    }
                }
                setCheckLogin(true);
            } catch (error) {
                console.error("Lỗi khi kiểm tra xác thực:", error);
                setCheckLogin(true);
            }
        };

        checkAuth();
    }, []);

    return <>{checkLogin ? children : <Loading />}</>;
};

export default LoginMiddleware;
