import ResizeModule from "@botom/quill-resize-module"
import {Button, Stack, TextField, Typography} from "@mui/material"
import {pipe} from "fp-ts/function"
import * as O from "fp-ts/Option"
import {none} from "fp-ts/Option"
import * as A from "fp-ts/ReadonlyArray"
import {UUID} from "io-ts-types"
import {DeltaOperation, DeltaStatic, Sources} from "quill"
import {CSSProperties, forwardRef, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Controller, useForm} from "react-hook-form"
import ReactQuill, {Quill} from "react-quill"
import "react-quill/dist/quill.snow.css"
import {useNavigate, useSearchParams} from "react-router-dom"
import {useSetRecoilState} from "recoil"
import {useHandleCallback} from "../common/Http.ts"
import {useFileService} from "../common/service/FileService.ts"
import {FileData, FileReference, getImageUrl} from "../common/state/File.ts"
import {globalLoadingState} from "../common/state/Loading.ts"
import {usePostService} from "./service/PostService.ts"
import {DefaultPost, Post, PostText} from "./state/Post.ts"
import UnprivilegedEditor = ReactQuill.UnprivilegedEditor

interface ReactQuillEditorProps {
    style?: CSSProperties
    defaultValue?: string
    placeholder?: string
    value?: string
    handleImage: () => void
    onChange: (value: string, delta: DeltaStatic, source: Sources, editor: ReactQuill.UnprivilegedEditor) => void
}

const FONT_LIST = ["SansSerif", "Pretendard", "GowunBatang"]

const ReactQuillEditor = forwardRef<ReactQuill, ReactQuillEditorProps>(
    ({
         style,
         placeholder,
         defaultValue,
         value,
         handleImage,
         onChange
     }: ReactQuillEditorProps, ref) => {
        const fontAttributor = Quill.import("attributors/class/font") as {
            whitelist: string[]
        }
        fontAttributor.whitelist = FONT_LIST

        Quill.register(fontAttributor, true)
        Quill.register("modules/resize", ResizeModule)

        const formats = [
            "bold",
            "italic",
            "underline",
            "strike",
            "blockquote",
            "align",
            "height",
            "width",
            "font",
            "header",
            "image",
            "video",
            "clean",
            "size",
            "color",
            "background"
        ]

        const modules = useMemo(() => ({
            resize: {
                toolbar: {
                    alignTools: false
                }
            },
            toolbar: {
                container: [
                    [
                        {font: FONT_LIST},
                        {header: [1, 2, 3, false]},
                        {size: ["small", false, "large", "huge"]}
                    ],

                    ["bold", "italic", "underline", "strike"],
                    ["blockquote"],

                    ["image", "video", "link"],

                    [{list: "ordered"}, {list: "bullet"}],
                    [{indent: "-1"}, {indent: "+1"}],
                    [{align: []}],

                    [{color: []}, {background: []}]
                ],
                handlers: {
                    image: handleImage
                },
                imageResize: {
                    modules: ["Resize", "DisplaySize"]
                }
            }
        }), [handleImage])

        return <>
            <ReactQuill theme={"snow"} ref={ref} style={style} modules={modules} value={value}
                        placeholder={placeholder}
                        formats={formats}
                        defaultValue={defaultValue}
                        onChange={onChange}/>
        </>
    })

const EditPostPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const quillRef = useRef<ReactQuill | null>(null)

    const setBusy = useSetRecoilState(globalLoadingState)
    const [text, setText] = useState<PostText>()
    const [images, setImages] = useState<ReadonlyArray<FileReference>>(A.empty)
    const id = useMemo(() => searchParams.get("id"), [searchParams])
    const hasLoaded = useRef(false)

    const postService = usePostService()
    const fileService = useFileService()
    const handleResponse = useHandleCallback()

    const {
        handleSubmit,
        control,
        formState: {errors}
    } = useForm<Post>({
        mode: "all",
        defaultValues: (text || {images: images}) ?? DefaultPost,
        values: text ? (text || {images: images}) as Post : undefined
    })

    const isValid = useMemo(() =>
            !errors.title && !errors.contents
        , [errors.title, errors.contents])

    // 초기 로딩 시
    const append = useCallback(() => {

        const uuid = pipe(
            O.fromNullable(id),
            O.map(i => pipe(
                UUID.decode(i),
                O.fromEither,
                O.toUndefined
            )),
            O.toUndefined
        )

        if (!uuid) return

        setBusy(true)

        const request = pipe(
            postService.findById(uuid),
            handleResponse<Post>((res) => {
                setText({
                    id: res.id,
                    title: res.title,
                    contents: res.contents,
                    createdAt: res.createdAt
                })
                setImages(res.images)
            })
        )

        request().finally(() => setBusy(false))
    }, [id, setBusy, postService, handleResponse])

    useEffect(() => {
        if (!hasLoaded.current) {
            append()
            console.log("Post: ", text)
            hasLoaded.current = true
        } else {
            hasLoaded.current = false
        }
    }, [append, text])

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
                fileService.upload("post/image", file as FileData),
                handleResponse((res) => {
                    console.log("이미지 업로드 완료: ", res.id)

                    setImages(images => [...images, res])
                    editor.insertEmbed(range.index, "image", getImageUrl(res))
                    editor.formatText(0, 1, "width", "100%")
                    editor.formatText(0, 1, "height", "100%")
                    editor.insertText(range.index + 2, "\n")
                    editor.setSelection(range.index + 2, 2)
                })
            )()
        })
    }, [handleResponse, fileService])

    const onSubmit = useCallback((item: Post) => {
        if (!quillRef.current) return

        setBusy(true)

        const editor = quillRef.current.getEditor()

        const summary = editor.getText(0, 100)

        const files = pipe(
            editor.getContents().ops ?? A.empty,
            A.filterMap<DeltaOperation, string>(a => {
                return (a.insert !== undefined) && (typeof a.insert === "object") ? O.some(a.insert["image"] as string) : none
            })
        )

        const uploads = pipe(
            images,
            A.filter(image => files.includes(getImageUrl(image))),
            A.map(upload => upload.id)
        )

        console.log("포스트 저장할 내용: ", item)
        console.log("현재 파일 목록: ", files)
        console.log("현재 파일 아이디: ", uploads)

        const request = pipe(
            !id ? postService.register(item, summary, uploads)
                : postService.update(item, summary, uploads),
            handleResponse((res) => {
                console.log("포스트 저장되었습니다: ", res)
                navigate("/post/" + res.id)
            })
        )

        request().finally(() => setBusy(false))
    }, [handleResponse, id, images, navigate, postService, setBusy])

    const onChange = useCallback((onChange: (input: string) => void, value: string, editor: UnprivilegedEditor) => {
        console.log(editor.getText())

        onChange(value)
    }, [])

    const onClosed = useCallback(() => {
        console.log("포스트 취소")
        navigate("/post")
    }, [navigate])

    return <>
        <form onSubmit={handleSubmit(onSubmit)}
              style={{
                  boxSizing: "border-box",
                  height: "100%",
                  margin: "0px 80px",
                  paddingTop: "60px"
              }}
        >
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

            <Controller name={"contents"}
                        control={control}
                        rules={{required: true}}
                        render={({field}) => (
                            <ReactQuillEditor
                                ref={quillRef}
                                placeholder={"오늘 나의 하루는..."}
                                value={field.value}
                                handleImage={handleImage}

                                onChange={(value: string, _delta: DeltaStatic, _source: Sources, editor: UnprivilegedEditor) => onChange(
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
