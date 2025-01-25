import {GlobalStyles, ThemeProvider, useTheme} from "@mui/material"
import ModalProvider from "mui-modal-provider"
import {SnackbarProvider} from "notistack"
import {BrowserRouter, useRoutes} from "react-router-dom"
import "./App.css"
import {mainRoutes} from "./Routes.tsx"

const Routes = () => {
    return useRoutes([
        mainRoutes
    ])
}

const App = () => {
    const theme = useTheme()

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
