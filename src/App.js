import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import "./App.css";
import Scene from "./components/Scene";
function App() {
    return (_jsx(_Fragment, { children: _jsx("div", { className: "canvas-container", children: _jsx(Scene, {}) }) }));
}
export default App;
