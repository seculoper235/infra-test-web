import {Backdrop, CircularProgress} from "@mui/material"
import {useRecoilValue} from "recoil"
import {globalLoadingState} from "../state/Loading.ts"

export const LoadingProvider = () => {
    const busy = useRecoilValue(globalLoadingState)

    return <>
        <div>
            <Backdrop
                sx={{color: "#515151", zIndex: (theme) => theme.zIndex.drawer + 100}}
                open={busy}>
                <CircularProgress size={"100px"} color="primary"/>
            </Backdrop>
        </div>
    </>
}
