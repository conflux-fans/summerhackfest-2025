import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer
  },
});

export default store;
