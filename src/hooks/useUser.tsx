import create from "zustand";
import { UserType } from "./useLoginQuery";

type UserState = {
  user: UserType | null;
  setUser: (user: UserType) => void;
};


export const useUser = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user: user }))
}));

/*
export const useUser = create<UserState>((set) => {}
 const user: UserType | null = Cookies.get('user');

 return {
   user: user,
   setUser: (user) => set(() => ({ user: user }))
 }
});
*/