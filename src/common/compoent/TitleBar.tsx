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
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`, px: "10px",
                backgroundColor: "#3097f4"
            }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    {title}
                </Typography>
            </Toolbar>
        </AppBar>
    </>
}

export default TitleBar
