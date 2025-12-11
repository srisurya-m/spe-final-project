import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { orderReducerInitialState } from "../../types/reducerTypes";
import { Service } from "../../types/types";

const initialState: orderReducerInitialState = {
  orders: [],
  loading: true,
};

export const orderReducer = createSlice({
  name: "orderReducer",
  initialState,
  reducers: {
    addService: (state, action: PayloadAction<Service>) => {
      state.loading = true;
      const index = state.orders.findIndex((i) => i._id === action.payload._id);
      if (index !== -1) state.orders[index] = action.payload;
      else {
        state.orders.push(action.payload);
        state.loading = false;
      }
    },
    removeService: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.orders = state.orders.filter((i) => i._id !== action.payload);
      state.loading = false;
    },
    clearOrders: () => initialState,
  },
});

export const { addService, removeService, clearOrders } = orderReducer.actions;
