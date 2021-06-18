import create from "zustand";
import { UserType } from "../model";

type UserState = {
  user: UserType | null;
  setUser: (user: UserType) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user: user }))
}));
