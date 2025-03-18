import {pipe} from "fp-ts/function"
import {TaskEither} from "fp-ts/TaskEither"
import * as T from "io-ts"
import {UUID} from "io-ts-types"
import {useMemo} from "react"
import {RestClient, ServiceError} from "../../common/Http.ts"
import {Post, PostInfo} from "../state/Post.ts"

export class PostService extends RestClient {

    find(
        created: string
    ): TaskEither<ServiceError, ReadonlyArray<PostInfo>> {
        const params = {
            "date": created
        }

        return this.httpGet("post", "api/post", T.readonlyArray(PostInfo), params)
    }

    findById(
        id: UUID
    ): TaskEither<ServiceError, Post> {
        return this.httpGet("post", "api/post/" + id, Post)
    }

    register(
        post: Post,
        summary: string,
        files: ReadonlyArray<UUID>
    ): TaskEither<ServiceError, Post> {
        const param = {
            "title": post.title,
            "summary": summary,
            "content": post.content,
            "images": files
        }

        return pipe(
            this.httpPost("post", "api/post", JSON.stringify(param), Post)
        )
    }

    update(
        post: Post,
        summary: string,
        files: ReadonlyArray<UUID>
    ): TaskEither<ServiceError, Post> {
        const param = {
            "id": post.id,
            "title": post.title,
            "summary": summary,
            "content": post.content,
            "images": files
        }

        return pipe(
            this.httpPut("post", "api/post/" + post.id, JSON.stringify(param), Post)
        )
    }

    delete(
        id: UUID
    ): TaskEither<ServiceError, void> {

        return pipe(
            this.httpDelete("post", "api/post/" + id)
        )
    }
}

export function usePostService(): PostService {

    return useMemo(() => new PostService(), [])
}
