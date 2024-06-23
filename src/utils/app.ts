import { npubToHex } from "./nostr";

export const getParentWindow = () => window.parent;

export const getAppId = () => {
  const appId = getParentWindow().decenChat?.appId;
  if(appId.startsWith('npub')) {
    return npubToHex(appId);
  }
  return appId;
};
