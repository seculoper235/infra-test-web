import {Components} from "@mui/material/styles/components"

export const BorderRadius = "8px"

export const ComponentStyle: Components = {
    MuiAppBar: {
        defaultProps: {
            elevation: 0
        }
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: BorderRadius,
                whiteSpace: "nowrap"
            },
        },
        defaultProps: {
            disableElevation: true
        }
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                ":focus": {
                    outline: "unset"
                }
            }
        }
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: BorderRadius
            }
        }
    }
}
