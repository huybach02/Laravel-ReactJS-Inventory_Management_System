import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "../../utils/toast";

export interface MainState {
    notification: string;
    isLoading: boolean;
    isReload: boolean;
    isModalReload: boolean;
    imageSingle: string;
    imageMultiple: string[];
}

const initialState: MainState = {
    notification: "",
    isLoading: false,
    isReload: false,
    isModalReload: false,
    imageSingle: "",
    imageMultiple: [],
};

export const mainSlice = createSlice({
    name: "main",
    initialState,
    reducers: {
        setNotification: (
            state,
            action: PayloadAction<{
                message: string;
                type: "success" | "error" | "info" | "warning";
            }>
        ) => {
            state.notification = action.payload.message;
            if (state.notification) {
                toast[action.payload.type](state.notification);
                state.notification = "";
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setReload: (state) => {
            state.isReload = !state.isReload;
        },
        setModalReload: (state) => {
            state.isModalReload = !state.isModalReload;
        },
        setImageSingle: (state, action: PayloadAction<string>) => {
            state.imageSingle = action.payload;
        },
        clearImageSingle: (state) => {
            state.imageSingle = "";
        },
        setImageMultiple: (state, action: PayloadAction<string[]>) => {
            state.imageMultiple = action.payload;
        },
        clearImageMultiple: (state) => {
            state.imageMultiple = [];
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setNotification,
    setLoading,
    setReload,
    setModalReload,
    setImageSingle,
    clearImageSingle,
    setImageMultiple,
    clearImageMultiple,
} = mainSlice.actions;

export default mainSlice.reducer;
