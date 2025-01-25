import * as T from "io-ts"

export const TodoItem = T.readonly(T.type({
    id: T.number,
    title: T.string,
    completed: T.boolean
}), "TodoItem")

export type TodoItem = T.TypeOf<typeof TodoItem>
