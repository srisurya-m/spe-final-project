import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducer/userReducer";
import { orderReducer } from "./reducer/orderReducer";

export const server = import.meta.env.VITE_SERVER;
export const store = configureStore({
  reducer: {
    [userReducer.name]: userReducer.reducer,
    [orderReducer.name]: orderReducer.reducer,
  }
});

export default store
// export type RootState = ReturnType<typeof store.getState>;
