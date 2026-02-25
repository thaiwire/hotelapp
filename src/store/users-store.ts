import { create } from "zustand";

import { IUser } from "@/app/interfaces";

export type UsersStore = {
	loggedInUser: IUser | null;
	setLoggedInUser: (user: IUser | null) => void;
};

export const useUsersStore = create<UsersStore>((set) => ({
	loggedInUser: null,
	setLoggedInUser: (user) => set({ loggedInUser: user }),
}));
