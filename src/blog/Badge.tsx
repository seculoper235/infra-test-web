import {Button, Typography} from "@mui/material"

type ButtonBadgeProps = {
    label: string
}
const ButtonBadge = ({label}: ButtonBadgeProps) => {
    return <>
        <Button variant={"text"} size="small"
                sx={{backgroundColor: "#edf6ff"}}
        >
            <Typography style={{
                color: "#1976d2",
                fontFamily: "KyoboHandwriting2023wsa",
                fontSize: 14
            }}>
                # {label}
            </Typography>
        </Button>
    </>
}

export default ButtonBadge
