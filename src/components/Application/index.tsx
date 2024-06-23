import { useState, useEffect } from "react";
import { fetchProfiles } from "../../utils/nostr";
import ChatIcon from "../ChatIcon";
import ChatWindow from "../ChatWindow";
import { getAppId, getParentWindow } from "../../utils/app";
import "./style.css";

function App() {
  const [appConfig, updateAppConfig] = useState<{ displayName: string }>();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchAppConfig = async () => {
      const appId = getAppId();
      const appConfig = await fetchProfiles([appId]);
      updateAppConfig(appConfig[appId]);
    };
    setTimeout(fetchAppConfig, 100);
  }, []);

  if (!appConfig) return null;

  const toggleChatWindow = () => {
    const iframe = getParentWindow().document.getElementById(
      "decentralised-chat"
    ) as HTMLIFrameElement;
    if (iframe) {
      if (!isChatOpen) {
        iframe.style.width = "374px";
        iframe.style.height = "524px";
      } else {
        iframe.style.width = "96px";
        iframe.style.height = "96px";
      }
    }
    setIsChatOpen((pre) => !pre);
  };

  return (
    <div className="App">
      <ChatIcon
        onClick={toggleChatWindow}
        className={isChatOpen ? "hidden" : ""}
      />
      {isChatOpen && (
        <ChatWindow appConfig={appConfig} onClose={toggleChatWindow} />
      )}
    </div>
  );
}

export default App;
