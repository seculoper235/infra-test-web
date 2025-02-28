import {createRoot} from "react-dom/client"
import "./index.css"
import {RecoilRoot} from "recoil"
import App from "./App.tsx"
import {LoadingProvider} from "./common/compoent/Loader.tsx"

createRoot(document.getElementById("root")!).render(
    <RecoilRoot>
        <LoadingProvider/>
        <App/>
    </RecoilRoot>
)
