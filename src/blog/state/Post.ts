import * as T from "io-ts"

export const Post = T.readonly(T.type({
    id: T.number,
    title: T.string,
    content: T.string
}), "Post")

export const DefaultPost = {
    title: "",
    content: ""
}

export type Post = T.TypeOf<typeof Post>
