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
    Skeleton,
    Stack,
    Typography
} from "@mui/material"
import {pipe} from "fp-ts/function"
import * as A from "fp-ts/ReadonlyArray"
import {Fragment, useCallback, useEffect, useRef, useState} from "react"
import {useNavigate} from "react-router-dom"
import Reference from "../../public/asset/image/reference.jpg"
import TitleBar from "../common/compoent/TitleBar.tsx"
import {useHandleCallback} from "../common/Http.ts"
import ButtonBadge from "./Badge.tsx"
import {usePostService} from "./service/PostService.ts"
import {Post} from "./state/Post.ts"

// TODO: 더미 데이터 제거
const TEMP_POSTS: ReadonlyArray<Post> = [
    {
        id: 1,
        title: "포스트 1",
        content: "포스트 1 입니다"
    },
    {
        id: 2,
        title: "포스트 2",
        content: "포스트 2 입니다"
    },
    {
        id: 3,
        title: "포스트 3",
        content: "포스트 3 입니다"
    },
    {
        id: 3,
        title: "포스트 3",
        content: "포스트 3 입니다"
    },
    {
        id: 2,
        title: "포스트 2",
        content: "포스트 2 입니다"
    }
]

const PostSpace = () => {
    const navigate = useNavigate()

    const service = usePostService()
    const handleResponse = useHandleCallback()

    const [busy, setBusy] = useState(false)
    const [items, setItems] = useState<ReadonlyArray<Post>>(TEMP_POSTS)
    const hasLoaded = useRef(false)

    const appendItems = useCallback(() => {
        setBusy(true)

        const request = pipe(
            service.find(),
            handleResponse((res) => {
                console.log("포스트들: ", res)
                setItems(res)
            })
        )

        request().finally(() => setBusy(false))
    }, [handleResponse, service, setBusy])

    useEffect(() => {
        if (!hasLoaded.current) {
            appendItems()
            hasLoaded.current = true
        } else {
            hasLoaded.current = false
        }
    }, [appendItems])

    return <>
        <TitleBar title={"기록하는 공간"}/>
        <Stack id={"post-space"} height={"100vh"} pt={"64px"} direction={"row"}>
            <Stack flexGrow={1} pt={"10px"}>
                <Stack className={"post-space-nav"} direction={"row"} justifyContent={"flex-end"}
                       py={"30px"}
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
