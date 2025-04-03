import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import App from "./App";
import Sender from "./components/sender";
import Receiver from "./components/reciever";

export const routes = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route index element={<Receiver />} />
            <Route path="/robot" element={<Sender />} />
        </Route>
    )
)