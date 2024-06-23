import { useState, useEffect } from "react";
import { fetchProfiles } from "../../utils/nostr";
import ChatIcon from "../ChatIcon";
import ChatWindow from "../ChatWindow";
import { getAppId } from "../../utils/app";
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

  const handleChatIconClick = () => {
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="App">
      <ChatIcon onClick={handleChatIconClick} className={isChatOpen ? 'hidden' : ''} />
      {isChatOpen && <ChatWindow appConfig={appConfig} onClose={handleChatClose} />}
    </div>
  );
}

export default App;
