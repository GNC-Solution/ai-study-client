import create from "zustand";
import { combine } from "zustand/middleware";
import { UserType } from "../model";
import Cookies from "universal-cookie";
import { USER_KEY } from "../constants";

type UserState = {
  user: UserType | null;
  setUser: (user: UserType) => void;
};

function getDefaultValue() {
  const cookies = new Cookies();
  return {
    user: cookies.get(USER_KEY),
  };
}

export const useUserStore = create<UserState>(
  combine(getDefaultValue(), (set) => ({
    setUser: (user) => set(() => ({ user })),
  }))
);
