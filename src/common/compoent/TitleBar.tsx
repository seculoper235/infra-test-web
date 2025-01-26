import {AppBar, CssBaseline, Toolbar, Typography} from "@mui/material"
import {drawerWidth} from "../layout/Layout.tsx"

type AppBarProps = {
    title: string
}
const TitleBar = ({title}: AppBarProps) => {
    return <>
        <CssBaseline/>
        <AppBar
            position="fixed"
            sx={{width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`}}
        >
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    {title} Space
                </Typography>
            </Toolbar>
        </AppBar>
    </>
}

export default TitleBar
