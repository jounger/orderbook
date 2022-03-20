import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SocketContext } from "../contexts/SocketProvider";
import { book } from "../shared/book";
import { compare2dASC, compare2dDESC } from "../utils/common";
import BookRow from "./BookRow";
import BookRows from "./BookRows";

const OrderBook: React.FC = () => {
  const socketContext = useContext(SocketContext);
  const [ticket, setTicket] = useState<number>(0.5);
  const bids = useRef<number[][]>([]);
  const asks = useRef<number[][]>([]);
  const groupedBids = useRef<book[]>([]);
  const groupedAsks = useRef<book[]>([]);

  const findRowIndex = useCallback((rows: number[][], row: number[]) => {
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
  }, []);

  const updateRow = useCallback(
    (rows: number[][], row: number[]) => {
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
          console.log("NOT EXISTED", row);
        }
      }
      return rows;
    },
    [findRowIndex]
  );

  const updateRows = useCallback(
    (currentRows: number[][], newRows: number[][]) => {
      const copyCurrentRows = [...currentRows].sort(compare2dASC);
      newRows.forEach((row) => updateRow(copyCurrentRows, row));
      return copyCurrentRows;
    },
    [updateRow]
  );

  const roundDownToTicket = (num: number, ticket: number) => {
    const decimalPlace =
      Math.floor(ticket) === ticket
        ? 0
        : ticket.toString().split(".")[1].length || 0;
    const roundToDecimal =
      Math.floor(num * Math.pow(10, decimalPlace)) / Math.pow(10, decimalPlace);
    const roundDound = (Math.floor(roundToDecimal / ticket) * ticket).toFixed(
      decimalPlace
    );
    return parseFloat(roundDound);
  };

  const groupByTicket = useCallback(
    (rows: number[][]) => {
      const map = rows
        .map((row) => {
          const price = roundDownToTicket(row[0], ticket);
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
    [ticket]
  );

  useEffect(() => {
    const msg = socketContext.lastMessage;
    if (msg && msg.product_id) {
      switch (msg.feed) {
        case "book_ui_1":
          const updatedBids = updateRows(bids.current, msg.bids);
          bids.current = [...updatedBids];
          groupedBids.current = groupByTicket(updatedBids.sort(compare2dDESC));

          const updatedAsks = updateRows(asks.current, msg.asks);
          asks.current = [...updatedAsks];
          groupedAsks.current = groupByTicket(updatedAsks.sort(compare2dASC));
          break;
        case "book_ui_1_snapshot":
          bids.current = msg.bids;
          asks.current = msg.asks;
          groupedBids.current = groupByTicket(bids.current);
          groupedAsks.current = groupByTicket(asks.current);
          break;
        default:
          break;
      }
      // groupedBids.current.length = 11;
      // groupedAsks.current.length = 11;
    }
    return () => {};
  }, [socketContext.lastMessage, groupByTicket, updateRows]);

  return (
    <div>
      <div className="flex flex-row flex-nowrap justify-between">
        <BookRows rows={groupedBids.current}>
          {groupedBids.current.map((row, index) => (
            <BookRow key={index} row={row}></BookRow>
          ))}
        </BookRows>
        <BookRows rows={groupedAsks.current} className={"flex-row-reverse"}>
          {groupedAsks.current.map((row, index) => (
            <BookRow
              key={index}
              row={row}
              className={"flex-row-reverse"}
            ></BookRow>
          ))}
        </BookRows>
      </div>
      {/* {bids.current.map((bid, id) => (
        <pre key={id}>{bid[0] + " > " + bid[1]}</pre>
      ))} */}
    </div>
  );
};

export default OrderBook;
