import * as T from "io-ts"
import {DateFromISOString} from "io-ts-types"

export const Post = T.readonly(T.type({
    id: T.number,
    title: T.string,
    content: T.string,
    created: DateFromISOString
}), "Post")

export const DefaultPost = {
    title: "",
    content: ""
}

export type Post = T.TypeOf<typeof Post>
