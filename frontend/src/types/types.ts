export type User = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: number;
  photo: string;
  role: string;
  pincode: string;
};

export type Service = {
  _id: string;
  photo: string;
  name: string;
  description: string;
};

export type formDataType = {
  photo: string;
  name: string;
  email: string;
  phoneNumber: number;
  pincode: number;
};

export type OrderType = {
  status: string;
  services: {
    name: string;
    photo: string;
  }[];
  orderDate?: string;
  totalPages: number;
};
