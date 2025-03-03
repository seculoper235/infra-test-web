import {pipe} from "fp-ts/function"
import {TaskEither} from "fp-ts/TaskEither"
import * as T from "io-ts"
import {useMemo} from "react"
import {RestClient, ServiceError} from "../../common/Http.ts"
import {FileData, FileReference} from "../../common/state/File.ts"
import {Post} from "../state/Post.ts"

export const AuthenticationError = T.literal("AuthenticationError")

export type AuthenticationError = T.TypeOf<typeof AuthenticationError>

export class PostService extends RestClient {

    find(
        created: string
    ): TaskEither<ServiceError, ReadonlyArray<Post>> {
        const params = {
            "created": created
        }

        return this.httpGet("api/post", T.readonlyArray(Post), params)
    }

    findById(
        id: number
    ): TaskEither<ServiceError, Post> {
        return this.httpGet("api/post/" + id, Post)
    }

    register(
        post: Post,
        files: ReadonlyArray<string>
    ): TaskEither<ServiceError, Post> {
        const param = {
            "title": post.title,
            "content": post.content,
            "files": files
        }

        return pipe(
            this.httpPost("api/post", JSON.stringify(param), Post)
        )
    }

    upload(
        file: FileData
    ): TaskEither<ServiceError, FileReference> {
        const formData = new FormData()

        formData.append("image", file)

        return pipe(
            this.httpPut("api/file/upload", formData, FileReference)
        )
    }

    delete(
        id: number
    ): TaskEither<ServiceError, void> {

        return pipe(
            this.httpDelete("api/post/" + id)
        )
    }
}

export function usePostService(): PostService {

    return useMemo(() => new PostService(), [])
}
