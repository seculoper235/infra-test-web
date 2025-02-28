import {identity} from "fp-ts/function"
import * as T from "io-ts"
import {withMessage} from "io-ts-types"
import {NonEmptyString} from "io-ts-types/NonEmptyString"
import NoImage from "../../../public/asset/image/reference.jpg"

export const FileReference = withMessage(
    T.readonly(T.type({
            id: T.number,
            name: NonEmptyString
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
    const {id, name} = file

    const env = import.meta.env

    const prefix = env.VITE_S3_URL

    return [prefix, id, name].join("/")
}
