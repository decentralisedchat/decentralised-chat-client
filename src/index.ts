import initApp from "./initApp";
import { getAppId } from "./utils/app";

export default function loadApp() {
  if (!getAppId()) {
    return;
  }
  initApp();
}

if (document.readyState !== "loading") {
  loadApp();
} else {
  document.addEventListener("DOMContentLoaded", loadApp);
}
