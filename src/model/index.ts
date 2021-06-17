export type LoginResponse = {
  success: boolean;
  message: string;
  user: UserType | null;
};

export type ServerResponse = {
  success: boolean;
  message: string;
}

export type UserType = {
  id: number;
  name: string;
};
