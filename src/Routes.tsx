import {RouteObject} from "react-router-dom"
import {Layout} from "./common/layout/Layout.tsx"
import TodoSpace from "./todo/TodoSpace.tsx"

export const mainRoutes: RouteObject = {
    path: "/",
    element: <Layout/>,
    children: [
        {
            path: "/todo",
            element: <TodoSpace/>
        },
    ]
}
