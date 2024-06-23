export const getParentWindow = () => window.parent;

export const getAppId = () => getParentWindow().decenChat?.appId;
