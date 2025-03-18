import {string} from "fp-ts"
import * as E from "fp-ts/Either"
import {constVoid, flow, identity, pipe} from "fp-ts/function"
import * as A from "fp-ts/ReadonlyArray"
import * as R from "fp-ts/ReadonlyRecord"
import {ReadonlyRecord} from "fp-ts/ReadonlyRecord"
import * as TS from "fp-ts/Task"
import {Task} from "fp-ts/Task"
import * as TE from "fp-ts/TaskEither"
import {TaskEither, tryCatch} from "fp-ts/TaskEither"
import * as T from "io-ts"
import {Decoder} from "io-ts"
import {PathReporter} from "io-ts/PathReporter"
import {useCallback} from "react"

export const HttpError = T.readonly(T.type({
    status: T.number,
    message: T.string
}), "HttpError")

export type HttpError = T.TypeOf<typeof HttpError>

export type ServiceError = HttpError | Error

export function getEndPoint(service: string) {
    const env = import.meta.env

    if (service == "file") {
        return env.VITE_FILE_API_HOST
    } else if (service == "post") {
        return env.VITE_POST_API_HOST
    } else {
        return env.VITE_TODO_API_HOST
    }
}

const handleResponse: (te: TaskEither<ServiceError, Response>) => TaskEither<ServiceError, Response> = flow(
    TE.filterOrElseW((r): r is Response => r.ok, identity),
    TE.orLeft<ServiceError | Response, ServiceError>(r => {
        if (r instanceof Response) {
            return pipe(() => r.text(), TS.map(text => ({
                status: r.status,
                message: text && text.length > 0 ? text : r.statusText
            })))
        }

        // 서버 응답 자체는 정상이다!(200 번대)
        return TS.of(r)
    })
)

export abstract class RestClient {

    get headers(): ReadonlyRecord<string, string> {
        return {}
    }

    protected getEndpoint(service: string, uri: string, params: Record<string, unknown> = {}): string {
        const prefix = getEndPoint(service)

        return pipe(
            params,
            R.filter(v => v !== undefined),
            R.toEntries,
            A.chain(([key, value]) =>
                Array.isArray(value) ? pipe(value, A.map(v => [key, v])) : A.of([key, value])
            ),
            A.map(([k, v]) => [k, pipe(v, String, encodeURIComponent)]),
            A.filter(([, v]) => v.length > 0),
            A.map(v => v.join("=")),
            v => {
                if (A.isEmpty(v)) {
                    return [prefix, uri].join("")
                }

                return `${prefix}${uri}?${v.join("&")}`
            }
        )
    }

    protected doFetch(endpoint: string, init?: RequestInit): TaskEither<ServiceError, Response> {
        return pipe(
            tryCatch<ServiceError, Response>(
                () => fetch(endpoint, init),
                e => ({
                    name: "네트워크 오류",
                    message: string.isString(e) ? e : "오류로 인해 서버에 연결 할 수 없습니다."
                })
            ),
            handleResponse
        )
    }

    protected createRequest<T>(
        request: () => TaskEither<ServiceError, T>): TaskEither<ServiceError, T> {
        return pipe(
            request(),
            TE.orElse(this.handleError(request))
        )
    }

    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleError<T>(_request: () => TaskEither<ServiceError, T>): (e: ServiceError) => TaskEither<ServiceError, T> {
        return TE.left
    }

    protected parseJson<T>(codec: Decoder<unknown, T>) {
        return flow(
            TE.chain<ServiceError, Response, unknown>(r => TE.rightTask(() => r.json())),
            TE.chainW<ServiceError, unknown, T>(
                flow(
                    codec.decode,
                    E.mapLeft(E.left),
                    E.mapLeft(PathReporter.report),
                    E.mapLeft(E.toError),
                    TE.fromEither
                )
            )
        )
    }

    protected httpGet<T>(
        service: string,
        url: string,
        codec: Decoder<unknown, T>,
        params: Record<string, unknown> = {}): TaskEither<ServiceError, T> {

        const endpoint = this.getEndpoint(service, url, params)

        return this.createRequest(() => pipe(
            this.doFetch(endpoint, {
                    headers: this.headers
                }
            ),
            this.parseJson(codec))
        )
    }

    protected httpPost<T>(
        service: string,
        url: string,
        body: BodyInit,
        codec: Decoder<unknown, T>): TaskEither<ServiceError, T> {

        return pipe(this.handleUpdateRequest(service, url, "POST", body), this.parseJson(codec))
    }

    protected httpPostNoReturn(service: string, url: string, body: BodyInit): TaskEither<ServiceError, void> {
        return pipe(this.handleUpdateRequest(service, url, "POST", body), TE.map(constVoid))
    }

    protected httpPut<T>(
        service: string,
        url: string,
        body: BodyInit,
        codec: Decoder<unknown, T>): TaskEither<ServiceError, T> {

        return pipe(this.handleUpdateRequest(service, url, "PUT", body), this.parseJson(codec))
    }

    protected httpDelete(service: string, url: string): TaskEither<ServiceError, void> {
        const endpoint = this.getEndpoint(service, url)

        return this.createRequest(() => pipe(
            this.doFetch(endpoint, {method: "DELETE", headers: this.headers}),
            TE.map(constVoid)
        ))
    }

    private handleUpdateRequest(
        service: string,
        url: string,
        method: "POST" | "PUT" | "PATCH",
        body: BodyInit
    ): TaskEither<ServiceError, Response> {

        const endpoint = this.getEndpoint(service, url)

        return this.createRequest(() => {
            let headers: HeadersInit

            if (typeof body === "string") {
                headers = pipe(
                    this.headers,
                    R.upsertAt("Content-Type", "application/json")
                )
            } else {
                headers = this.headers
            }

            return this.doFetch(endpoint, {method, body, headers})
        })
    }
}

export function handleError(error: unknown) {
    console.error(error)
}

export type ServiceCallback =
    <T>(onSuccess: (result: T) => void,
        onError?: (error: unknown) => unknown) => (ma: TaskEither<unknown, T>) => Task<void>

export function useHandleCallback(): ServiceCallback {

    return useCallback(<T, >(
        onSuccess: (result: T) => void,
        onError?: (error: unknown) => unknown) => {

        return TE.match<unknown, void, T>(
            e => {
                const error = onError === undefined ? e : onError.call(null, e)

                handleError(error)
            },
            r => onSuccess(r)
        )
    }, [])
}
