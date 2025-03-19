import {identity} from "fp-ts/function"
import * as T from "io-ts"
import {UUID, withMessage} from "io-ts-types"
import NoImage from "../../../public/asset/image/reference.jpg"

export const FileReference = withMessage(
    T.readonly(T.type({
            id: UUID,
            name: T.string,
            path: T.string
        }, "FileReference")
    ),
    () => "올바르지 않은 파일 참조입니다.")

export type FileReference = T.TypeOf<typeof FileReference>

export const FileData = new T.Type<File>(
    "FileData",
    (u): u is File => u instanceof File,
    (u, c) => u instanceof File ? T.success(u) : T.failure(u, c),
    identity
)

export type FileData = T.TypeOf<typeof FileData>

export function getImageUrl(file: FileReference | undefined) {
    if (!file) {
        return NoImage
    }
    const {path} = file

    const env = import.meta.env

    const prefix = env.VITE_S3_URL

    return [prefix, path].join("/")
}

export function getImagePath(path: string | undefined) {
    if (!path) {
        return NoImage
    }

    const env = import.meta.env

    const prefix = env.VITE_S3_URL

    return [prefix, path].join("/")
}
