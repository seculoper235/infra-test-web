import {RouteObject} from "react-router-dom"
import PostPage from "./blog/PostPage.tsx"
import PostSpace from "./blog/PostSpace.tsx"
import EditPostPage from "./blog/EditPostPage.tsx"
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
        {
            path: "/post",
            element: <PostSpace/>
        },
        {
            path: "/post/:id",
            element: <PostPage/>
        },
        {
            path: "/post/edit",
            element: <EditPostPage/>
        },
    ]
}
