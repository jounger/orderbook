import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UNPARSABLE_JSON_OBJECT } from "./constant";

type SocketMessage = {
  event?: string;
  version?: number;
  numLevels?: number;
  feed?: string;
  product_id?: string;
  product_ids?: string[];
  bids: number[][];
  asks: number[][];
};

type SocketInformation = {
  readyState: number;
  productIds: string[];
  lastMessage: SocketMessage;
  changeProductIds: (productIds: string[]) => void;
  changeEvent: (eventName: string) => void;
  getWebsocket: () => WebSocket | null;
};

export const SocketContext = React.createContext<SocketInformation>({
  readyState: 0,
  productIds: [],
  lastMessage: {
    bids: [],
    asks: [],
  },
  changeProductIds: () => {},
  changeEvent: () => {},
  getWebsocket: () => null,
});

const SocketProvider: React.FC = (props) => {
  const socket = useRef<WebSocket | null>(null);
  const [event, setEvent] = useState("subscribe");
  const [feed] = useState("book_ui_1");
  const [productIds, setProductIds] = useState(["PI_ETHUSD"]);
  const [readyState, setReadyState] = useState(0);
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

  const changeProductIdsHandler = (productIds: string[]) => {
    setProductIds(productIds);
  };

  const changeEventHandler = (eventName: string) => {
    setEvent(eventName);
  };

  const sendMessage = useCallback((message: string) => {
    if (socket.current?.readyState === 1) {
      socket.current.send(message);
    }
  }, []);

  const sendMessageJson = useCallback(
    (message: {}) => {
      sendMessage(JSON.stringify(message));
    },
    [sendMessage]
  );

  useEffect(() => {
    const defaultWSURL = "wss://www.cryptofacilities.com/ws/v1";
    const webSocketURL = process.env.REACT_APP_WS_URL || defaultWSURL;
    socket.current = new WebSocket(webSocketURL);

    socket.current.onopen = function () {
      setReadyState(socket.current?.readyState ?? 0);
      const requestMessage = {
        event: event,
        feed: feed,
        product_ids: productIds,
      };
      sendMessageJson(requestMessage);
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
      setLastMessage((current) => (current = event));
    };

    return () => {
      socket.current?.close();
    };
  }, [event, feed, productIds, sendMessageJson]);

  const getWebsocket = useCallback(() => {
    return socket.current;
  }, []);

  const contextValue: SocketInformation = {
    readyState: readyState,
    productIds: productIds,
    lastMessage: lastJsonMessage,
    changeProductIds: changeProductIdsHandler,
    changeEvent: changeEventHandler,
    getWebsocket: getWebsocket,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
