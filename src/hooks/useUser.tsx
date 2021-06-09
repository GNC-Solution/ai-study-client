import create from "zustand";
import { UserType } from "./useLoginQuery";

type UserState = {
  user: UserType | null;
  setUser: (user: UserType) => void;
};

export const useUser = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user: user })),
}));
