import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { SnackbarProvider } from "notistack";
import { ConfigProvider } from "antd";
import { router } from "./configs/app-router";

createRoot(document.getElementById("root")!).render(
    <ConfigProvider
        theme={{
            token: {
                // // Seed Token
                // colorPrimary: "#00b96b",
                // borderRadius: 2,
                // // Alias Token
                // colorBgContainer: "#fafafa",
            },
        }}
    >
        <SnackbarProvider
            anchorOrigin={{
                vertical: "top",
                horizontal: "center",
            }}
        >
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>
        </SnackbarProvider>
    </ConfigProvider>
);
