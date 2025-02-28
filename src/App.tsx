import {GlobalStyles, ThemeProvider} from "@mui/material"
import ModalProvider from "mui-modal-provider"
import {SnackbarProvider} from "notistack"
import {BrowserRouter, useRoutes} from "react-router-dom"
import "./App.css"
import "./Fonts.css"
import {useRecoilValue} from "recoil"
import {themeState} from "./common/theme/Theme.ts"
import {mainRoutes} from "./Routes.tsx"

const Routes = () => {
    return useRoutes([
        mainRoutes
    ])
}

const App = () => {
    const theme = useRecoilValue(themeState)

    return <>
        <ThemeProvider theme={{...theme}}>
            <SnackbarProvider maxSnack={5} preventDuplicate>
                <GlobalStyles
                    styles={{
                        body: {
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary
                        }
                    }}/>
                <BrowserRouter>
                    <ModalProvider>
                        <Routes/>
                    </ModalProvider>
                </BrowserRouter>
            </SnackbarProvider>
        </ThemeProvider>
    </>
}

export default App
