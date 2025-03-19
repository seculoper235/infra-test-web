import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import {Box, Button, Skeleton, Stack, Typography} from "@mui/material"
import dayjs from "dayjs"
import {pipe} from "fp-ts/function"
import * as O from "fp-ts/Option"
import {UUID} from "io-ts-types"
import {useCallback, useEffect, useRef, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import {useHandleCallback} from "../common/Http.ts"
import {usePostService} from "./service/PostService.ts"
import {Post} from "./state/Post.ts"

const PostPage = () => {
    const params = useParams()
    const navigate = useNavigate()

    const service = usePostService()
    const handleResponse = useHandleCallback()

    const [busy, setBusy] = useState(false)
    const [post, setPost] = useState<Post>()
    const hasLoaded = useRef(false)

    const onDelete = useCallback((id: UUID) => {
        setBusy(true)

        const request = pipe(
            service.delete(id),
            handleResponse(() => {
                console.log("포스트가 삭제되었습니다")
                navigate("/post")
            })
        )

        request().finally(() => setBusy(false))
    }, [handleResponse, navigate, service])

    const append = useCallback(() => {
        if (!params.id) return

        const uuid = pipe(
            UUID.decode(params.id),
            O.fromEither,
            O.toUndefined
        )

        if (!uuid) return

        setBusy(true)

        const request = pipe(
            service.findById(uuid),
            handleResponse((res) => {
                setPost(res)
            })
        )

        request().finally(() => setBusy(false))
    }, [handleResponse, params.id, service])

    useEffect(() => {
        if (!hasLoaded.current) {
            append()
            hasLoaded.current = true
        } else {
            hasLoaded.current = false
        }
    }, [append])

    return <>
        {post && <>
          <Stack className={"post-action"} direction={"row"} justifyContent={"flex-end"} py={"30px"}
                 px={"50px"} gap={"10px"}>
            <Button
                variant={"text"}
                color={"primary"}
                size={"small"}
                disableElevation
                onClick={() => navigate("/post")}
                sx={{
                    color: "#6cb6ff",
                    borderRadius: "16px"
                }}>
              <ArrowBackIcon/>
            </Button>
            <Box flexGrow={1}/>
            <Button
                variant={"outlined"}
                color={"primary"}
                size={"small"}
                disableElevation
                onClick={() => navigate("/post/edit?id=" + post.id)}
                sx={{
                    color: "#6cb6ff",
                    borderRadius: "16px"
                }}>
              <Typography style={{
                  fontFamily: "GowunBatang-Regular",
                  fontSize: "14px",
                  fontWeight: 700,
                  borderRadius: "16px"
              }}>
                수정
              </Typography>
            </Button>
            <Button
                variant={"outlined"}
                color={"primary"}
                size={"small"}
                disableElevation
                onClick={() => onDelete(post.id)}
                sx={{
                    color: "#6cb6ff",
                    borderRadius: "16px"
                }}>
              <Typography style={{
                  fontFamily: "GowunBatang-Regular",
                  fontSize: "14px",
                  fontWeight: 700,
                  borderRadius: "16px"
              }}>
                삭제
              </Typography>
            </Button>
          </Stack>
          <Stack className={"post-contents"} alignItems={"center"}>
            <Stack maxWidth={"820px"}>
              <Stack className={"post-header"}>
                  {busy ? (
                      <Skeleton sx={{width: "820px", height: 30, marginBottom: 3}}
                                animation="wave"
                                variant="rectangular"/>
                  ) : (
                      <Typography sx={{
                          fontFamily: "GowunBatang-Regular",
                          fontSize: "30px",
                          fontWeight: 700,
                          p: "20px"
                      }}>
                          {post.title}
                      </Typography>
                  )}
                  {busy ? (
                      <Skeleton animation="wave"
                                variant="rectangular"
                                sx={{
                                    width: "100%", height: 13, marginBottom: 3
                                }}/>
                  ) : <Stack>
                      <Typography sx={{
                          fontFamily: "GowunBatang-Regular",
                          fontSize: "13px",
                          fontWeight: 500,
                          px: "10px",
                          textAlign: "right"
                      }}>
                          {dayjs(post.createdAt).format("YYYY년 MM월 DD일")}
                      </Typography>
                      <Box flexGrow={1}/>
                      <Typography sx={{
                          fontFamily: "GowunBatang-Regular",
                          fontSize: "13px",
                          fontWeight: 500,
                          py: "20px", px: "10px",
                          textAlign: "right"
                      }}>
                          by 핑핑
                      </Typography>
                  </Stack>}
              </Stack>
                {busy ? (
                    <Skeleton animation="wave"
                              variant="rectangular"
                              sx={{
                                  width: "100%", height: 800, marginBottom: 3
                              }}/>
                ) : (
                    <Box component={"main"} textAlign={"left"} marginY={"45px"}
                         dangerouslySetInnerHTML={{__html: post.contents}}/>
                )}
            </Stack>
          </Stack>
        </>}
    </>
}

export default PostPage
