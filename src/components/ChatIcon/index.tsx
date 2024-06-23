import React from "react";
import "./style.css";

interface ChatIconProps {
  onClick: () => void;
  className: string;
}

const ChatIcon: React.FC<ChatIconProps> = ({ className, onClick }) => (
  <div className={`chat-icon ${className}`} onClick={onClick}>
    💬
  </div>
);

export default ChatIcon;
