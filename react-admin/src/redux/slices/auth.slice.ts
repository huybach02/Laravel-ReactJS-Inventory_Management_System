import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/user.type";

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthLogin: (state, action: PayloadAction<AuthState>) => {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.user = action.payload.user;
        },
        setAuthLogout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setAuthLogin, setAuthLogout } = authSlice.actions;

export default authSlice.reducer;
