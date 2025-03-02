import {Button, Stack, TextField, Typography} from "@mui/material"
import {pipe} from "fp-ts/function"
import * as O from "fp-ts/Option"
import {none} from "fp-ts/Option"
import * as A from "fp-ts/ReadonlyArray"
import * as Parchment from "parchment"
import Op from "quill-delta/src/Op.ts"
import {CSSProperties, forwardRef, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Controller, useForm} from "react-hook-form"
import ReactQuill, {DeltaStatic, EmitterSource} from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import {useNavigate, useSearchParams} from "react-router-dom"
import {useSetRecoilState} from "recoil"
import {useHandleCallback} from "../common/Http.ts"
import {getImageUrl} from "../common/state/File.ts"
import {globalLoadingState} from "../common/state/Loading.ts"
import {usePostService} from "./service/PostService.ts"
import {DefaultPost, Post} from "./state/Post.ts"
import UnprivilegedEditor = ReactQuill.UnprivilegedEditor

interface ReactQuillEditorProps {
    style?: CSSProperties
    defaultValue?: string
    placeholder?: string
    value?: string
    handleImage: () => void
    onChange: (value: string, delta: DeltaStatic, source: EmitterSource, editor: ReactQuill.UnprivilegedEditor) => void
}

const fonts = ["Pretendard", "GowunBatang"]

const ReactQuillEditor = forwardRef<ReactQuill, ReactQuillEditorProps>(
    ({
         style,
         placeholder,
         defaultValue,
         value,
         handleImage,
         onChange
     }: ReactQuillEditorProps, ref) => {
        const Quill = ReactQuill.Quill
        const FontAttributor = Quill.import("attributors/class/font") as { whitelist: string[] }

        FontAttributor.whitelist = fonts
        Quill.register(FontAttributor as Parchment.RegistryDefinition, true)

        const modules = useMemo(() => ({
            toolbar: {
                container: [
                    [{"font": fonts}],
                    ["image", "video"],
                    [{header: [1, 2, 3, 4, 5, false]}],
                    ["link"],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    ["clean"]
                ],
                handlers: {
                    image: handleImage
                },
                ImageResize: {
                    modules: ["Resize"]
                }
            }
        }), [handleImage])

        return <>
            <ReactQuill ref={ref} style={style} modules={modules} value={value}
                        placeholder={placeholder}
                        defaultValue={defaultValue}
                        onChange={onChange}/>
        </>
    })

const EditPostPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const quillRef = useRef<ReactQuill | null>(null)

    const setBusy = useSetRecoilState(globalLoadingState)
    const [post, setPost] = useState<Post>()
    const hasLoaded = useRef(false)

    const service = usePostService()
    const handleResponse = useHandleCallback()

    const {
        handleSubmit,
        control,
        formState: {errors}
    } = useForm<Post>({
        mode: "all",
        defaultValues: post ?? DefaultPost,
        values: post
    })

    const isValid = useMemo(() =>
            !errors.title && !errors.content
        , [errors.title, errors.content])

    // 초기 로딩 시
    const append = useCallback(() => {
        const id = searchParams.get("id")

        if (!id) return

        setBusy(true)

        const request = pipe(
            service.findById(Number(id)),
            handleResponse<Post>((res) => {
                setPost(res)
            })
        )

        request().finally(() => setBusy(false))

        const item = {
            id: 1,
            content: "<p><strong style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\">Lorem Ipsum</strong><span style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\"> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span></p><p><br></p><p><strong style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\">Lorem Ipsum</strong><span style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\"> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span></p><p><br></p><p><strong style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\">Lorem Ipsum</strong><span style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\"> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span></p><p><br></p><p><strong style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\">Lorem Ipsum</strong><span style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\"> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span></p><p><br></p><p><strong style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\">Lorem Ipsum</strong><span style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\"> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span></p>",
            title: "오늘의 하루는 어땠나요...?"
        }

        setPost(item)
    }, [handleResponse, searchParams, service, setBusy])

    useEffect(() => {
        if (!hasLoaded.current) {
            append()
            console.log("Post: ", post)
            hasLoaded.current = true
        } else {
            hasLoaded.current = false
        }
    }, [append, post])

    // 이미지 업로드
    const handleImage = useCallback(() => {
        const input = document.createElement("input")
        input.setAttribute("type", "file")
        input.setAttribute("accept", "image/*")
        input.click()

        input.addEventListener("change", () => {
            if (!quillRef.current || !input.files) return

            const file = input.files[0]

            const editor = quillRef.current.getEditor()
            const range = editor.getSelection(true)

            pipe(
                service.upload(file),
                handleResponse((res) => {
                    console.log("이미지 업로드 완료: ", getImageUrl(res))
                    editor.insertEmbed(range.index, "image", defaultUrl)
                    editor.setSelection(range.index + 1)
                })
            )()

            const defaultUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1c9zAnn02wcDmYlMABoRgWoxn4wccXzUpUg&s"
            editor.insertEmbed(range.index, "image", defaultUrl)
            editor.insertText(range.index + 1, "/n")
            editor.setSelection(range.index + 2)
        })
    }, [handleResponse, service])

    const onSubmit = useCallback((item: Post) => {
        if (!quillRef.current) return

        setBusy(true)

        const editor = quillRef.current.getEditor()

        console.log("포스트 저장되었습니다: ", item)
        const files = pipe(
            editor.getContents().ops,
            A.filterMap<Op, string>(a => {
                return (a.insert !== undefined) && (typeof a.insert === "object") ? O.some(a.insert["image"] as string) : none
            })
        )

        console.log("현재 파일 목록: ", files)

        const request = pipe(
            service.register(item, files),
            handleResponse((res) => {
                console.log("포스트 저장되었습니다: ", res)
                navigate("post/" + res.id)
            })
        )

        request().finally(() => setBusy(false))
    }, [handleResponse, navigate, service, setBusy])

    const onChange = useCallback((onChange: (input: string) => void, value: string, editor: UnprivilegedEditor) => {
        console.log(editor.getText())

        onChange(value)
    }, [])

    const onClosed = useCallback(() => {
        console.log("포스트 취소")
        navigate("/post")
    }, [navigate])

    return <>
        <form onSubmit={handleSubmit(onSubmit)} style={{height: "100vh", margin: "30px"}}>
            <Controller name={"title"}
                        control={control}
                        rules={{required: true}}
                        render={({field}) => (
                            <TextField fullWidth
                                       variant="standard"
                                       placeholder={"오늘의 하루는 어땠나요?"}
                                       type="text"
                                       slotProps={{
                                           input: {
                                               disableUnderline: true,
                                               sx: {
                                                   fontFamily: "GowunBatang-Regular",
                                                   fontSize: "24px",
                                                   fontWeight: 700,
                                                   p: "20px"
                                               }
                                           }
                                       }}
                                       {...field}/>
                        )}/>

            <Controller name={"content"}
                        control={control}
                        rules={{required: true}}
                        render={({field}) => (
                            <ReactQuillEditor
                                ref={quillRef}
                                placeholder={"오늘 나의 하루는..."}
                                value={field.value}
                                handleImage={handleImage}

                                onChange={(value: string, _delta: DeltaStatic, _source: EmitterSource, editor: UnprivilegedEditor) => onChange(
                                    field.onChange, value, editor)
                                }
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                    height: "80%"
                                }}
                            />
                        )}/>

            <Stack direction={"row"} justifyContent={"flex-end"} p={"20px"} gap={"10px"}>
                <Button
                    type={"submit"}
                    variant={"contained"}
                    color={"primary"}
                    size={"small"}
                    disabled={!isValid}
                    disableElevation
                    sx={{
                        backgroundColor: "#6cb6ff",
                        borderRadius: "16px"
                    }}>
                    <Typography style={{
                        fontFamily: "GowunBatang-Regular",
                        fontSize: "14px",
                        fontWeight: 700,
                        borderRadius: "16px"
                    }}>
                        등록
                    </Typography>
                </Button>
                <Button
                    variant={"outlined"}
                    color={"primary"}
                    size={"small"}
                    disableElevation
                    onClick={onClosed}
                    sx={{
                        borderColor: "#6cb6ff",
                        borderRadius: "16px"
                    }}>
                    <Typography style={{
                        fontFamily: "GowunBatang-Regular",
                        fontSize: "14px",
                        fontWeight: 700,
                        borderRadius: "16px"
                    }}>
                        취소
                    </Typography>
                </Button>
            </Stack>
        </form>
    </>
}

export default EditPostPage
