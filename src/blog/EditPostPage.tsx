import {Button, Stack, TextField, Typography} from "@mui/material"
import {pipe} from "fp-ts/function"
import * as O from "fp-ts/Option"
import {none} from "fp-ts/Option"
import * as A from "fp-ts/ReadonlyArray"
import {UUID} from "io-ts-types"
import * as Parchment from "parchment"
import Op from "quill-delta/src/Op.ts"
import {CSSProperties, forwardRef, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Controller, useForm} from "react-hook-form"
import ReactQuill, {DeltaStatic, EmitterSource} from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import {useNavigate, useSearchParams} from "react-router-dom"
import {useSetRecoilState} from "recoil"
import {useHandleCallback} from "../common/Http.ts"
import {useFileService} from "../common/service/FileService.ts"
import {FileData, FileReference, getImageUrl} from "../common/state/File.ts"
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
                    modules: ["Resize", "DisplaySize"]
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
        defaultValues: post ?? DefaultPost,
        values: post
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
                setPost(res)
            })
        )

        request().finally(() => setBusy(false))
    }, [id, setBusy, postService, handleResponse])

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
                fileService.upload("post/image", file as FileData),
                handleResponse((res) => {
                    console.log("이미지 업로드 완료: ", res.id)

                    setImages(images => [...images, res])
                    editor.insertEmbed(range.index, "image", getImageUrl(res))
                    editor.insertText(range.index + 1, "/n")
                    editor.setSelection(range.index + 2)
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
            editor.getContents().ops,
            A.filterMap<Op, string>(a => {
                return (a.insert !== undefined) && (typeof a.insert === "object") ? O.some(a.insert["image"] as string) : none
            })
        )

        const uploads = pipe(
            images,
            A.filter(image => files.includes(image.path)),
            A.map(upload => upload.id)
        )

        console.log("포스트 저장할 내용: ", item)
        console.log("현재 파일 목록: ", files)

        const request = pipe(
            !id ? postService.register(item, summary, uploads)
                : postService.update(item, summary, uploads),
            handleResponse((res) => {
                console.log("포스트 저장되었습니다: ", res)
                navigate("post/" + res.id)
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
              style={{height: "inherit", margin: "30px 80px", paddingTop: "60px"}}>
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
