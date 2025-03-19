import * as T from "io-ts"
import {DateFromISOString, optionFromNullable, UUID} from "io-ts-types"

export const Post = T.readonly(T.type({
    id: UUID,
    title: T.string,
    contents: T.string,
    createdAt: DateFromISOString
}), "Post")

export type Post = T.TypeOf<typeof Post>

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
