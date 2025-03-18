import {pipe} from "fp-ts/function"
import {TaskEither} from "fp-ts/TaskEither"
import * as T from "io-ts"
import {useMemo} from "react"
import {RestClient, ServiceError} from "../../common/Http.ts"
import {TodoItem} from "../state/Todo.ts"

export const AuthenticationError = T.literal("AuthenticationError")

export type AuthenticationError = T.TypeOf<typeof AuthenticationError>

export class TodoService extends RestClient {

    find(): TaskEither<ServiceError, ReadonlyArray<TodoItem>> {
        return this.httpGet("post", "api/todo", T.readonlyArray(TodoItem))
    }

    register(
        title: string
    ): TaskEither<ServiceError, void> {
        const param = {
            "title": title
        }

        return pipe(
            this.httpPostNoReturn("post", "api/todo", JSON.stringify(param))
        )
    }

    changeStatus(
        completed: boolean,
        id: number
    ): TaskEither<ServiceError, TodoItem> {
        const param = {
            "completed": completed
        }

        return pipe(
            this.httpPut("post", "api/todo/" + id + "/status", JSON.stringify(param), TodoItem)
        )
    }

    delete(
        id: number
    ): TaskEither<ServiceError, void> {

        return pipe(
            this.httpDelete("post", "api/todo/" + id)
        )
    }
}

export function useTodoService(): TodoService {

    return useMemo(() => new TodoService(), [])
}
