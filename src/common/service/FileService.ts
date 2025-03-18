import {pipe} from "fp-ts/function"
import {TaskEither} from "fp-ts/TaskEither"
import {useMemo} from "react"
import {RestClient, ServiceError} from "../Http.ts"
import {FileData, FileReference} from "../state/File.ts"

export class FileService extends RestClient {

    upload(
        path: string,
        file: FileData
    ): TaskEither<ServiceError, FileReference> {
        const formData = new FormData()

        formData.append("path", path)
        formData.append("multipartFile", file)

        return pipe(
            this.httpPut("post", "api/file/upload", formData, FileReference)
        )
    }
}

export function useFileService(): FileService {

    return useMemo(() => new FileService(), [])
}
