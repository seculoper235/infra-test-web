import {Checklist} from "@mui/icons-material"
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
import React from "react"
import {useNavigate, useOutlet} from "react-router-dom"

export const drawerWidth = 240

type DrawerMenuProps = {
    label: string
    route: string
    icon: React.ReactNode
}
const DrawerMenu = ({label, route, icon}: DrawerMenuProps) => {
    const navigate = useNavigate()

    return <ListItem key={label} disablePadding>
        <ListItemButton onClick={() => navigate(route)}>
            <ListItemIcon>
                {icon}
            </ListItemIcon>
            <ListItemText primary={label}/>
        </ListItemButton>
    </ListItem>
}

export const Layout = () => {
    const outlet = useOutlet()

    return <>
        <Box sx={{display: "flex"}}>
            {/*Drawer*/}
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
                    <DrawerMenu label={"할 일"} route={"todo"} icon={<Checklist/>}/>
                </List>
                <Divider/>
            </Drawer>
        </Box>

        {/*메인*/}
        <Stack className={"space-content"} alignItems={"stretch"} justifyContent={"center"}
               pl={`${drawerWidth}px`}
               height={"100vh"}>
            {outlet}
        </Stack>
    </>
}
