import * as T from "io-ts"
import {DateFromISOString, optionFromNullable, UUID} from "io-ts-types"
import {FileReference} from "../../common/state/File.ts"

export const Post = T.readonly(T.type({
    id: UUID,
    title: T.string,
    contents: T.string,
    images: T.readonlyArray(FileReference),
    createdAt: DateFromISOString
}), "Post")

export type Post = T.TypeOf<typeof Post>

export const PostText = T.readonly(T.type({
    id: UUID,
    title: T.string,
    contents: T.string,
    createdAt: DateFromISOString
}), "PostText")

export type PostText = T.TypeOf<typeof PostText>

export const PostInfo = T.readonly(T.type({
    id: UUID,
    title: T.string,
    thumbnail: optionFromNullable(T.string),
    summary: T.string,
    createdAt: DateFromISOString
}), "PostInfo")

export type PostInfo = T.TypeOf<typeof PostInfo>

export const DefaultPost = {
    title: "",
    contents: ""
}
