import {ArrowBackIosNewRounded, ArrowForwardIosRounded, EditCalendar} from "@mui/icons-material"
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardMedia,
    Grid2,
    IconButton,
    Skeleton,
    Stack,
    Typography
} from "@mui/material"
import {DateCalendar} from "@mui/x-date-pickers"
import {PickersToolbar} from "@mui/x-date-pickers/internals"
import dayjs from "dayjs"
import {pipe} from "fp-ts/function"
import * as A from "fp-ts/ReadonlyArray"
import {Fragment, useCallback, useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import Reference from "../../public/asset/image/reference.jpg"
import TitleBar from "../common/compoent/TitleBar.tsx"
import {useHandleCallback} from "../common/Http.ts"
import ButtonBadge from "./Badge.tsx"
import {usePostService} from "./service/PostService.ts"
import {Post} from "./state/Post.ts"
import Dayjs = dayjs.Dayjs

// TODO: 더미 데이터 제거
const TEMP_POSTS: ReadonlyArray<Post> = [
    {
        id: 1,
        title: "포스트 1",
        content: "포스트 1 입니다",
        created: new Date()
    },
    {
        id: 2,
        title: "포스트 2",
        content: "포스트 2 입니다",
        created: new Date()
    },
    {
        id: 3,
        title: "포스트 3",
        content: "포스트 3 입니다",
        created: new Date()
    },
    {
        id: 3,
        title: "포스트 3",
        content: "포스트 3 입니다",
        created: new Date()
    },
    {
        id: 2,
        title: "포스트 2",
        content: "포스트 2 입니다",
        created: new Date()
    }
]

const PostSpace = () => {
    const navigate = useNavigate()

    const service = usePostService()
    const handleResponse = useHandleCallback()

    const [busy, setBusy] = useState(false)
    const [date, setDate] = useState(dayjs())
    const [items, setItems] = useState<ReadonlyArray<Post>>(TEMP_POSTS)

    const appendItems = useCallback((value: Dayjs) => {
        setBusy(true)
        const dateFilter = value.format("YYYY/MM/DD")
        console.log("기준 일자: ", dateFilter)

        const request = pipe(
            service.find(value.toISOString()),
            handleResponse((res) => {
                console.log("포스트들: ", res)
                setItems(res)
            })
        )

        request().finally(() => setBusy(false))
    }, [handleResponse, service])

    useEffect(() => {
        appendItems(date)
    }, [appendItems, date])

    const [open, setOpen] = useState(false)

    const handleCalendar = useCallback((value: Dayjs) => {
        console.log("선택일자: ", value.format("YYYY/MM/DD"))

        setDate(value)
        setOpen(false)
    }, [])

    return <>
        <TitleBar title={"기록하는 공간"}/>
        <Stack id={"post-space"} height={"inherit"} pt={"64px"} direction={"row"}>
            <Stack flexGrow={1} pt={"10px"}>
                <Stack className={"post-space-nav"} direction={"row"} justifyContent={"flex-end"}
                       pt={"20px"}
                       px={"50px"} gap={"10px"}>
                    <Box flexGrow={1}/>
                    <Button
                        variant={"outlined"}
                        color={"primary"}
                        size={"medium"}
                        disableElevation
                        onClick={() => navigate("/post/edit")}
                        sx={{
                            color: "#6cb6ff",
                            borderRadius: "50px"
                        }}>
                        <DriveFileRenameOutlineIcon fontSize={"medium"}/>
                    </Button>
                </Stack>

                <Stack className={"calendar"} direction={"row"} justifyContent={"center"}
                       paddingBottom={"50px"}>

                    <IconButton
                        size={"small"}
                        onClick={() => setDate(date.subtract(1, "d"))}
                        sx={{borderRadius: "16px"}}>
                        <ArrowBackIosNewRounded/>
                    </IconButton>
                    <Stack className={"post-calendar"} position={"relative"} marginX={"80px"}
                           alignItems={"center"}>
                        <Stack className={"post-calendar-header"} direction={"row"}>
                            <PickersToolbar toolbarTitle={"Select Date 🍀"} isLandscape={true}
                                            landscapeDirection={"column"}/>
                            <IconButton
                                size={"large"}
                                onClick={() => setOpen(!open)}
                                sx={{borderRadius: "16px"}}>
                                <EditCalendar/>
                            </IconButton>
                        </Stack>

                        <Typography fontSize={"36px"} fontFamily={"Donoun-Medium"}
                                    fontWeight={"700"}>
                            {date.format("ddd, MMM DD")}
                        </Typography>

                        <DateCalendar disableFuture
                                      value={date}
                                      onChange={(value) => handleCalendar(value)}
                                      sx={{
                                          position: "absolute",
                                          top: "118px",
                                          zIndex: open ? 1 : 0,
                                          borderRadius: "8px",
                                          boxShadow: "0px 0px 5px #44444485",
                                          backgroundColor: "#fafbff",
                                          opacity: open ? 1 : 0,
                                          transition: `z-index, opacity .5s ease-in-out`
                                      }}/>
                    </Stack>
                    <IconButton
                        size={"small"}
                        onClick={() => setDate(date.add(1, "d"))}
                        sx={{borderRadius: "16px"}}>
                        <ArrowForwardIosRounded/>
                    </IconButton>
                </Stack>

                <Stack className={"post-space-main"} flexGrow={1} px={"50px"}>
                    {A.isEmpty(items) ?
                        <Typography position={"relative"} top={"30%"}
                                    style={{
                                        color: "#9c9a9a",
                                        fontFamily: "GowunBatang-Regular",
                                        fontSize: "46px",
                                        fontWeight: "100"
                                    }}>
                            그동안 어떤 일들이 있었나요?
                        </Typography> :
                        <Grid2 container rowSpacing={{xs: 1, sm: 5}}
                               columnSpacing={{xs: 1, sm: 5}}>
                            {items.map((item) => (
                                <Card sx={{width: 350}}>
                                    {busy ? (
                                        <Fragment>
                                            <Skeleton sx={{height: 200, marginBottom: 3}}
                                                      animation="wave"
                                                      variant="rectangular"/>
                                            <CardContent>
                                                <Skeleton animation="wave" height={10}
                                                          style={{marginBottom: 6}}/>
                                                <Skeleton animation="wave" height={10}
                                                          width="80%"/>
                                            </CardContent>
                                        </Fragment>
                                    ) : (
                                        <CardActionArea
                                            onClick={() => navigate("/post/" + item.id)}>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={Reference}
                                                alt="default image"
                                            />
                                            <CardContent sx={{textAlign: "left"}}>
                                                <Typography gutterBottom sx={{
                                                    color: "text.primary",
                                                    fontSize: 18
                                                }}>
                                                    A beautiful day
                                                </Typography>
                                                <Typography sx={{
                                                    color: "text.secondary",
                                                    fontSize: 14
                                                }}>
                                                    Lorem Ipsum is simply dummy text of the printing
                                                    and typesetting industry.
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    )}
                                    <CardActions>
                                        {!busy && <>
                                          <ButtonBadge label={"핑핑"}/>
                                          <ButtonBadge label={"모히또"}/>
                                        </>}
                                    </CardActions>
                                </Card>
                            ))}
                        </Grid2>
                    }
                </Stack>
            </Stack>
        </Stack>
    </>
}

export default PostSpace
