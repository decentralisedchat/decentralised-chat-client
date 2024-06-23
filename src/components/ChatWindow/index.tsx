import React, { useState, useEffect, KeyboardEvent, useRef } from "react";
import {
  getMessagesFilter,
  getUserPublicKey,
  subscribeMessages,
  decryptNip04Content,
  sendMessage,
} from "../../utils/nostr";
import { getAppId } from "../../utils/app";
import { sortArrayByKey } from "../../utils";
import "./style.css";

interface ChatWindowProps {
  onClose: () => void;
  appConfig: {
    displayName: string;
  };
}

interface Message {
  id: string;
  text: string;
  sender: "support" | "user";
  createdAt: number;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ appConfig, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const msgIdMap = useRef<{ [key: string]: boolean }>({});
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const onMessage = async (e: any) => {
    const decryptedMsg = await decryptNip04Content(e, getAppId());
    if (msgIdMap.current[e.id]) return;
    msgIdMap.current[e.id] = true;
    setMessages((preMsg) =>
      sortArrayByKey<Message>(
        [
          ...preMsg,
          {
            id: e.id,
            text: decryptedMsg,
            sender: e.pubkey === getAppId() ? "support" : "user",
            createdAt: e.created_at,
          },
        ],
        "createdAt"
      )
    );
  };

  useEffect(() => {
    setIsVisible(true);
    let closePool;
    const fetchMessages = async () => {
      const userPubKey = await getUserPublicKey();
      const msgFilter = await getMessagesFilter(userPubKey, getAppId());
      closePool = await subscribeMessages(msgFilter.filter, onMessage);
      setLoading(false);
    };
    fetchMessages();
    return closePool;
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    const msg = newMessage.trim();
    if (msg) {
      let msgEvent = await sendMessage(msg, getAppId());
      msgIdMap.current[msgEvent.id] = true;
      setNewMessage("");
      setMessages((preMsg) => [
        ...preMsg,
        {
          id: msgEvent.id,
          text: msg,
          sender: "user",
          createdAt: msgEvent.created_at,
        },
      ]);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // match the timeout with the CSS transition duration
  };

  return (
    <div className={`chat-window ${isVisible ? "open" : "close"}`}>
      <div className="chat-header">
        <span>{appConfig.displayName}</span>
        <button className="close-button" onClick={handleClose}>
          ✖
        </button>
      </div>
      <div className="chat-body" ref={chatBodyRef}>
        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))
        )}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          className="send-button"
          disabled={loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
