// includes both atoms and selector

import { atom, selector } from "recoil";

export const userTokenAtom = atom({
    key: "userTokenAtom",
    default : localStorage.getItem('token') || null,
})

export const isAuthenticated = selector({
    key: "isAuthenticated",
    get: ({get})=>{
        const user = get(userTokenAtom);
        if(user != null){
            return true;
        }
        return false;
    }
})