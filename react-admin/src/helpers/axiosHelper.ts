import axios from "../configs/axios";
import { toast } from "../utils/toast";

export const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        console.error("Login error:", error.response?.data);
        if (
            error.response?.data?.errors &&
            typeof error.response?.data?.errors === "object"
        ) {
            Object.keys(error.response?.data?.errors).forEach((key) => {
                const fieldErrors = error.response?.data?.errors[key] || [];
                fieldErrors.forEach((errorMessage: string) => {
                    toast.error(errorMessage);
                });
            });
        } else if (error.response?.data?.message) {
            toast.error(
                error.response?.data?.message || "Something went wrong"
            );
        }
        if (error.response?.data?.error) {
            toast.error(error.response?.data?.error || "Something went wrong");
        }
        return error.response?.data;
    } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
    }
};
