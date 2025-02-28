import {createTheme, Theme} from "@mui/material"
import {koKR} from "@mui/material/locale"
import {selector} from "recoil"
import {ComponentStyle} from "./ComponentStyle.ts"
import {DefaultTypography} from "./Typography.ts"

export const themeState = selector<Theme>({
    key: "theme",
    get: () => {
        const options = {
            components: ComponentStyle,
            shape: {
                borderRadius: 8
            },
            typography: {
                ...DefaultTypography
            }
        }

        return createTheme(options, koKR)
    }
})
