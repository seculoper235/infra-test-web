import {atom} from "recoil"

export const globalLoadingState = atom<boolean>({
    key: "globalLoadingState",
    default: false
})
