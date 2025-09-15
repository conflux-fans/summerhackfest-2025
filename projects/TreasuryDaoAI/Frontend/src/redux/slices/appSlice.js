import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  storageInitiated: false,
};

const authSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setInit: (state) => {
        state.storageInitiated = true;
    },
  },
});

export const { setInit} = authSlice.actions;
export default authSlice.reducer;
