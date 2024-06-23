import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/Application";

function initApp() {
  const chatContainer = document.getElementById("root");
  const root = ReactDOM.createRoot(chatContainer!);
  root.render(<App />);
}

export default initApp;
