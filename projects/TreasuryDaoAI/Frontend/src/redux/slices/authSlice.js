import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  isAdmin: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, { payload }) => {
      if (payload.val) {
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
    },
    setAdmin: (state, { payload }) => {
      if (payload.val) {
        state.isAdmin = true;
      }
    },
  },
});

export const { setAuth, setAdmin } = authSlice.actions;
export default authSlice.reducer;
