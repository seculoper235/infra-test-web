import MailIcon from "@mui/icons-material/Mail"
import InboxIcon from "@mui/icons-material/MoveToInbox"
import {
    Box,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar
} from "@mui/material"
import {useOutlet} from "react-router-dom"

const drawerWidth = 240

export const Layout = () => {
    const outlet = useOutlet()

    return <>
        <Box sx={{display: "flex"}}>
            {/*Drawer*/}
            {/*<CssBaseline />
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Permanent drawer
                    </Typography>
                </Toolbar>
            </AppBar>*/}

            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box"
                    }
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar/>
                <Divider/>
                <List>
                    {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon/> : <MailIcon/>}
                                </ListItemIcon>
                                <ListItemText primary={text}/>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider/>
                <List>
                    {["All mail", "Trash", "Spam"].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon/> : <MailIcon/>}
                                </ListItemIcon>
                                <ListItemText primary={text}/>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </Box>

        <Stack className={"space-content"} alignItems={"center"} justifyContent={"center"} pl={`${drawerWidth}px`}
               height={"100vh"}>
            {/*메인*/}
            {outlet}
        </Stack>
    </>
}
