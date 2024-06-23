import {
  SimplePool,
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip04,
  nip19,
} from "nostr-tools";
import { ProfilePointer } from "nostr-tools/lib/types/nip19";
import { getParentWindow } from "./app";
const PUBLIC_KEY = "pk";
const PRIVATE_KEY = "sk";

const parentWindow = getParentWindow();

declare global {
  interface Window {
    nostr: {
      getPublicKey: () => Promise<string>;
      nip04: {
        encrypt: (pubKey: string, content: string) => string;
        decrypt: (pubKey: string, content: string) => string;
      };
      signEvent: (e: object) => object;
    };
    decenChat: {
      appId: string;
    };
  }
}

const defaultRelays = [
  "wss://relay.damus.io/",
  "wss://relay.primal.net/",
  "wss://nos.lol",
  "wss://relay.nostr.wirednet.jp/",
  "wss://nostr-01.yakihonne.com",
  "wss://relay.hllo.live",
  "wss://relay.nostr.band",
  "wss://relay.mutinywallet.com",
];

let pool: any;
const getPool = () => {
  if (!pool) {
    pool = new SimplePool();
  }
  return pool;
};

export const checkWindowNostr = () => {
  if (!parentWindow?.nostr) {
    throw Error("No method provided to access nostr");
  }
};

export const signEvent = async (event: any) => {
  try {
    checkWindowNostr();
    const signedEvent = await parentWindow.nostr.signEvent(event);
    return signedEvent;
  } catch (e) {
    console.log("Error: ", e);
    const sk = getLocalSecretKey();
    const signedEvent = finalizeEvent(event, sk);
    return signedEvent;
  }
};

export const createAnonymousUser = async (pubkey: string) => {
  const event = {
    kind: 0,
    content: JSON.stringify({
      name: `Anonymous_${pubkey.slice(0, 6)}`,
      display_name: `Anonymous ${pubkey.slice(0, 6)}`,
    }),
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
  };
  const signedEvent = await signEvent(event);
  const pool = getPool();
  pool.publish(defaultRelays, signedEvent);
};

const bufferToHex = (buffer: any) => {
  return Array.prototype.map
    .call(buffer, (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
};

export const generateLocalKeys = () => {
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);
  localStorage.setItem(PUBLIC_KEY, pk);
  localStorage.setItem(PRIVATE_KEY, bufferToHex(sk));
  createAnonymousUser(pk);
  return { sk, pk };
};

export const getLocalPubKey = () => {
  let publicKey = localStorage.getItem(PUBLIC_KEY) || "";
  if (!publicKey) {
    const { pk } = generateLocalKeys();
    return pk;
  }
  return publicKey;
};

export const getLocalSecretKey = () => {
  let secretKey = localStorage.getItem(PRIVATE_KEY) || "";
  if (!secretKey) {
    const { sk } = generateLocalKeys();
    return sk;
  }
  return secretKey;
};

const decodePubKeys = (pubkeys: Array<string>) => {
  const nprofileNpubMap: { [keys: string]: string } = {};
  const newPubkeys = pubkeys.map((npub) => {
    if (npub.startsWith("nprofile")) {
      const { pubkey: profilePubkey } = nip19.decode(npub)
        .data as ProfilePointer;
      nprofileNpubMap[npub] = profilePubkey;
      return profilePubkey;
    }
    return npub;
  });
  return { nprofileNpubMap, newPubkeys };
};

const decodeKind0Content = (content: string) => {
  let data = {};
  try {
    data = JSON.parse(content);
  } catch (e) {
    data = {};
  }
  return data;
};

export async function fetchProfiles(pubkeys: Array<string>) {
  const { nprofileNpubMap, newPubkeys } = decodePubKeys(pubkeys);
  const pool = new SimplePool();
  const filter = {
    kinds: [0],
    authors: newPubkeys,
  };
  const kind0s = await pool.querySync(defaultRelays, filter);
  pool.close(defaultRelays);

  const kind0sMap = kind0s.reduce((map: { [key: string]: any }, kind0: any) => {
    map[kind0.pubkey] = decodeKind0Content(kind0.content);
    return map;
  }, {});
  const profiles = pubkeys.reduce((acc: { [key: string]: any }, p: string) => {
    let pub = p;
    if (nprofileNpubMap[p]) {
      pub = nprofileNpubMap[p];
    }
    acc[p] = kind0sMap[pub] || {
      name: `Anonymous`,
    };
    return acc;
  }, {});
  return profiles;
}

export const getUserPublicKey = async (): Promise<string> => {
  let publicKey = "";

  try {
    checkWindowNostr();
    publicKey = await parentWindow.nostr?.getPublicKey();
  } catch {
    if (!publicKey) {
      publicKey = getLocalPubKey();
    }
  }
  return publicKey;
};

export const getMessagesFilter = (
  authorPublicKey: string,
  recipientPublicKey?: string
) => ({
  filter: [
    {
      ...(recipientPublicKey ? { "#p": [recipientPublicKey] } : {}),
      authors: [authorPublicKey],
      kinds: [4],
    },
    {
      ...(recipientPublicKey ? { authors: [recipientPublicKey] } : {}),
      "#p": [authorPublicKey],
      kinds: [4],
    },
  ],
});

export const subscribeMessages = async (filter: any, onEvent: any) => {
  const pool = getPool();

  pool.subscribeMany(defaultRelays, filter, {
    onevent: onEvent,
    onclose() {
      console.log("closed relay");
    },
  });

  return () => pool.close(defaultRelays);
};

export const decryptNip04Content = async (event: any, appId: string) => {
  try {
    checkWindowNostr();
    const decryptedContent = await parentWindow.nostr.nip04.decrypt(
      appId,
      event.content
    );
    return decryptedContent;
  } catch (e) {
    console.log("Error: ", e);
    const sk = getLocalSecretKey();
    const decryptedContent = await nip04.decrypt(sk, appId, event.content);
    return decryptedContent;
  }
};

export const encryptNip04Msg = async (msg: string, appId: string) => {
  try {
    checkWindowNostr();
    const encryptedMessage = await parentWindow.nostr.nip04.encrypt(appId, msg);
    return encryptedMessage;
  } catch (e) {
    console.log("Error: ", e);
    const sk = getLocalSecretKey();
    const encryptedMessage = await nip04.encrypt(sk, appId, msg);
    return encryptedMessage;
  }
};

const getKind4BaseEvent = async (msg: string, appId: string) => {
  const userPublicKey = await getUserPublicKey();
  const encryptedMessage = await encryptNip04Msg(msg, appId);
  const baseKind4Event = {
    kind: 4,
    pubkey: userPublicKey,
    tags: [["p", appId]],
    content: encryptedMessage,
    created_at: Math.floor(Date.now() / 1000),
    id: "",
    sig: "",
  };
  return baseKind4Event;
};

export const getKind4EEvent = async (msg: string, appId: string) => {
  try {
    const baseKind4Event = await getKind4BaseEvent(msg, appId);
    const kind4Event = await signEvent(baseKind4Event);
    return kind4Event;
  } catch (e) {
    console.log("Error: ", e);
  }
};

export const sendMessage = async (msg: string, appId: string) => {
  const kind4Event = await getKind4EEvent(msg, appId);
  const pool = getPool();
  await pool.publish(defaultRelays, kind4Event);
  return kind4Event;
};
