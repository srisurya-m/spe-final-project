import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { userReducerInitialState } from "../../types/reducerTypes";
import { User } from "../../types/types";

const initialState: userReducerInitialState = {
  user: null,
  loading: true,
};

export const userReducer = createSlice({
  name: "userReducer",
  initialState,
  reducers: {
    userExist: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
    },
    userNotExist: (state) => {
      state.loading = false;
      state.user = null;
    },

    updateUser: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
    },
  },
});

export const { userExist, userNotExist, updateUser } = userReducer.actions;
