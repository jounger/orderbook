import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SocketRequest, SocketResponse } from "../shared/socket";
import { SocketRequestAction, UNPARSABLE_JSON_OBJECT } from "./constant";

type SocketInformation = {
  readyState: number;
  lastMessage: SocketResponse;
  getWebsocket: WebSocket | null;
  productIds: string[];
  subscribe: (productIds: string[], event?: string) => void;
};

export const SocketContext = React.createContext<SocketInformation>({
  readyState: 0,
  lastMessage: {},
  getWebsocket: null,
  productIds: [],
  subscribe: () => {},
});

const SocketProvider: React.FC = (props) => {
  const socket = useRef<WebSocket | null>(null);
  const [productIds, setProductIds] = useState<string[]>(["PI_XBTUSD"]);
  const [event, setEvent] = useState<string>(SocketRequestAction.SUBSCRIBE);
  const [readyState, setReadyState] = useState<number>(0);
  const [lastMessage, setLastMessage] = useState<
    WebSocketEventMap["message"] | null
  >(null);

  const lastJsonMessage = useMemo(() => {
    try {
      return JSON.parse(lastMessage?.data);
    } catch (e) {
      return UNPARSABLE_JSON_OBJECT;
    }
  }, [lastMessage]);

  const sendMessage = (message: string) => {
    if (socket.current?.readyState === 1) {
      socket.current.send(message);
    }
  };

  const sendMessageJson = useCallback((message: SocketRequest) => {
    sendMessage(JSON.stringify(message));
  }, []);

  useEffect(() => {
    const defaultWSURL = "wss://www.cryptofacilities.com/ws/v1";
    const webSocketURL = process.env.REACT_APP_WS_URL || defaultWSURL;
    socket.current = new WebSocket(webSocketURL);
    socket.current.onopen = function () {
      setReadyState(socket.current?.readyState ?? 0);
      const requests: SocketRequest = {
        event: event || SocketRequestAction.SUBSCRIBE,
        feed: "book_ui_1",
        product_ids: productIds,
      };
      sendMessageJson(requests);
    };
    socket.current.onclose = function (event) {
      setReadyState(socket.current?.readyState ?? 0);
      if (event.wasClean) {
        console.log(
          `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        console.log("[close] Connection died");
      }
    };
    socket.current.onerror = function (error) {
      setReadyState(socket.current?.readyState ?? 0);
      console.log(`[error] ${error}`);
    };
    socket.current.onmessage = function (event) {
      setLastMessage(event);
    };
    return () => {
      socket.current?.close();
    };
  }, [event, productIds, sendMessageJson]);

  const subscribeHandler = useCallback(
    (productIds: string[], event?: string) => {
      setProductIds(productIds);
      setEvent(event || SocketRequestAction.SUBSCRIBE);
    },
    []
  );

  useEffect(() => {
    const requests: SocketRequest = {
      event: event || SocketRequestAction.SUBSCRIBE,
      feed: "book_ui_1",
      product_ids: productIds,
    };
    sendMessageJson(requests);
  }, [productIds, event, readyState, sendMessageJson]);

  const contextValue: SocketInformation = useMemo(() => {
    return {
      readyState: readyState,
      lastMessage: lastJsonMessage,
      getWebsocket: socket.current,
      productIds: productIds,
      subscribe: subscribeHandler,
    };
  }, [readyState, lastJsonMessage, productIds, subscribeHandler]);

  return (
    <SocketContext.Provider value={contextValue}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
