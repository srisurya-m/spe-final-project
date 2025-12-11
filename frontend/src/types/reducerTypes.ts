import { Service, User } from "./types";

export interface userReducerInitialState {
  user: User | null;
  loading: boolean;
}

export interface orderReducerInitialState {
  orders: Service[];
  loading: boolean;
}

export type UserResponse = {
  success: boolean;
  user: User;
};
