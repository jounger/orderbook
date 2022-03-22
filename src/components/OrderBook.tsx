import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "../assets/OrderBook.css";
import { SocketRequestAction } from "../contexts/constant";
import { SocketContext } from "../contexts/SocketProvider";
import { book } from "../shared/book";
import { compare2dASC, compare2dDESC } from "../utils/common";
import BookBids from "./BookBids";
import FeedButton from "./FeedButton";
import GroupSize from "./GroupSize";
import {
  faArrowRightArrowLeft,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type productType = { product_id: string; ticks: number[] };

const OrderBook: React.FC = () => {
  const socketContext = useContext(SocketContext);
  const bids = useRef<number[][]>([]);
  const asks = useRef<number[][]>([]);
  const groupedBids = useRef<book[]>([]);
  const groupedAsks = useRef<book[]>([]);
  const maxTotal = useRef<number>(0);
  const products = useRef<productType[]>([
    {
      product_id: "PI_XBTUSD",
      ticks: [0.5, 1.0, 2.5],
    },
    {
      product_id: "PI_ETHUSD",
      ticks: [0.05, 1.0, 2.5],
    },
  ]);
  const [product, setProduct] = useState<productType>(products.current[0]);
  const [tick, setTick] = useState<number>(0.5);

  const findRowIndex = (rows: number[][], row: number[]) => {
    let start = 0;
    let end = rows.length - 1;
    let pre = -1;
    const target = row[0];
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      pre = mid;
      const midValue = rows[mid][0];
      if (midValue === target) return [mid, pre];
      if (midValue < target) start = mid + 1;
      else end = mid - 1;
    }
    return [-1, pre];
  };

  const updateRows = useCallback(
    (currentRows: number[][], newRows: number[][]) => {
      const rows = [...currentRows].sort(compare2dASC);
      newRows.forEach((row) => {
        const [index, pre] = findRowIndex(rows, row);
        if (index !== -1) {
          if (row[1] > 0) {
            rows.splice(index, 1, row);
          } else {
            rows.splice(index, 1);
          }
        } else {
          if (row[1] > 0) {
            const newIndex = pre > 0 && pre < rows.length ? pre + 1 : pre;
            rows.splice(newIndex, 0, row);
          } else {
            // console.log("NOT EXISTED", row);
          }
        }
      });
      return rows;
    },
    []
  );

  const roundDownToTick = (num: number, tick: number) => {
    const decimalPlace =
      Math.floor(tick) === tick ? 0 : tick.toString().split(".")[1].length || 0;
    const roundToDecimal =
      Math.floor(num * Math.pow(10, decimalPlace)) / Math.pow(10, decimalPlace);
    const roundDound = (Math.floor(roundToDecimal / tick) * tick).toFixed(
      decimalPlace
    );
    return parseFloat(roundDound);
  };

  const groupByTick = useCallback(
    (rows: number[][]) => {
      const map = rows
        .map((row) => {
          const price = roundDownToTick(row[0], tick);
          const itemInit: book = {
            price: price,
            size: row[1],
            total: 0,
            count: 0,
          };
          return itemInit;
        })
        .reduce((previous, current, index, array) => {
          const key = current.price;
          const item =
            previous.get(key) ||
            Object.assign({}, current, { size: 0, total: 0, count: 0 });
          if (index === 0) {
            item.total = current.size;
            item.size = current.size;
            item.count = 1;
          } else {
            const pre_value = previous.get(array[index - 1].price);
            if (pre_value && pre_value.total >= 0)
              item.total = pre_value.total + current.size;
            item.size += current.size;
            item.count += 1;
          }
          return previous.set(key, item);
        }, new Map<number, book>());
      const arr = Array.from(map.values());
      return arr;
    },
    [tick]
  );

  const getMaxTotal = (bids: book[], asks: book[]) => {
    const lastBidTotal = bids[bids.length - 1]?.total || 0;
    const lastAskTotal = asks[bids.length - 1]?.total || 0;
    return lastBidTotal > lastAskTotal ? lastBidTotal : lastAskTotal;
  };

  const selectGroupSizeHandler = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      const groupSize = parseFloat(value);
      setTick(groupSize);
    },
    []
  );

  const toggleFeedHandler = useCallback(() => {
    const oldIndex = products.current.findIndex(
      (prod) => prod.product_id === product.product_id
    );
    const oldProduct = products.current[oldIndex];
    socketContext.subscribe(
      [oldProduct.product_id],
      SocketRequestAction.UNSUBSCRIBE
    );
    const newIndex = products.current.length - oldIndex - 1;
    const newProduct = products.current[newIndex];
    socketContext.subscribe(
      [newProduct.product_id],
      SocketRequestAction.SUBSCRIBE
    );
    setTick(newProduct.ticks[0]);
    setProduct(newProduct);
  }, [socketContext, product]);

  const killFeedHandler = useCallback(() => {
    if (socketContext.readyState === 1) {
      socketContext.getWebsocket?.close();
    } else {
      socketContext.subscribe(
        [product.product_id],
        SocketRequestAction.SUBSCRIBE
      );
    }
  }, [socketContext, product]);

  useEffect(() => {
    const msg = socketContext.lastMessage;
    if (msg && msg.product_id && msg.bids && msg.asks) {
      switch (msg.feed) {
        case "book_ui_1":
          if (msg.bids.length > 0) {
            const updatedBids = updateRows(bids.current, msg.bids);
            bids.current = [...updatedBids];
            groupedBids.current = groupByTick(updatedBids.sort(compare2dDESC));
          }
          if (msg.asks.length > 0) {
            const updatedAsks = updateRows(asks.current, msg.asks);
            asks.current = [...updatedAsks];
            groupedAsks.current = groupByTick(updatedAsks.sort(compare2dASC));
          }
          break;
        case "book_ui_1_snapshot":
          bids.current = msg.bids;
          asks.current = msg.asks;
          groupedBids.current = groupByTick(bids.current);
          groupedAsks.current = groupByTick(asks.current);
          break;
        default:
          break;
      }
      maxTotal.current = getMaxTotal(groupedBids.current, groupedAsks.current);
    }
  }, [socketContext.lastMessage, groupByTick, updateRows]);

  return (
    <div className="ui__panel mx-auto w-full text-xs text-white divide-y">
      <div className="ui__header flex flex-row justify-between items-center m-0 py-0 px-2 h-10 leading-7 text-base">
        <div className="ui__title uppercase">
          Orderbook: {product.product_id}
        </div>
        <GroupSize
          tick={tick}
          ticks={product.ticks}
          selectGroupSize={selectGroupSizeHandler}
        ></GroupSize>
      </div>
      <div className="ui__body h-96 overflow-y-scroll">
        <div className="book-main flex flex-row flex-nowrap justify-center">
          <div className="book-bids">
            <BookBids rows={groupedBids.current} maxTotal={maxTotal.current} />
          </div>
          <div className="book-asks">
            <BookBids
              rows={groupedAsks.current}
              maxTotal={maxTotal.current}
              className="flex-row-reverse"
            ></BookBids>
          </div>
        </div>
      </div>
      <div className="ui__footer flex flex-row justify-center justify-items-center items-center m-0 py-0 px-2 h-14">
        <FeedButton
          icon={faArrowRightArrowLeft}
          label="Toggle Feed"
          className="bg-purple-500"
          onClick={toggleFeedHandler}
        ></FeedButton>
        <FeedButton
          icon={faCircleExclamation}
          label="Kill Feed"
          className="bg-red-500"
          onClick={killFeedHandler}
        ></FeedButton>
      </div>
    </div>
  );
};

export default OrderBook;
