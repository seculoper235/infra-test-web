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

        const request = {
            "path": path
        }

        // TODO: 다른 방법 고민 필요
        formData.append("uploadRequest", new Blob([JSON.stringify(request)],{type:'application/json'}))
        formData.append("multipartFile", file)

        return pipe(
            this.httpPost("file", "api/file/upload", formData, FileReference)
        )
    }
}

export function useFileService(): FileService {

    return useMemo(() => new FileService(), [])
}
