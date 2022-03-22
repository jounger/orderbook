import React from "react";
import { BookBid } from "../shared/orderBook";
import BookBars from "./BookBars";
import BookRows from "./BookRows";

const BookBids: React.FC<{
  rows: BookBid[];
  maxTotal: number;
  className?: string;
}> = (props) => {
  return (
    <div className="book__side grow text-right">
      <div
        className={`book__header flex ${props.className} justify-around uppercase text-slate-300`}
      >
        <div className="basis-1/12"></div>
        <div className="basis-3/12 py-0 px-1">Total</div>
        <div className="basis-4/12 py-0 px-1">Size</div>
        <div className="basis-4/12 py-0 px-1">Price</div>
      </div>
      <div className="book__bars h-0">
        <BookBars
          rows={props.rows}
          maxTotal={props.maxTotal}
          className={props.className}
        ></BookBars>
      </div>
      <div className="book__rows">
        <BookRows rows={props.rows} className={props.className}></BookRows>
      </div>
    </div>
  );
};
BookBids.defaultProps = {
  className: "flex-row",
  maxTotal: 0,
};
export default BookBids;
