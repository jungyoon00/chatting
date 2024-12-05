import { create } from "zustand";

const useGlobalState = create((set) => ({
    userID: "Guest",
    userName: "Guest",
    activate: false,
    setUserID: (userID) => set(() => ({ userID })),
    setUserName: (userName) => set(() => ({ userName })),
    setActivate: (activate) => set(() => ({ activate })),
}));

export default useGlobalState;