import React from "react";
import classes from "../assets/BookBids.module.css";
import { book } from "../shared/book";
import BookBars from "./BookBars";
import BookRows from "./BookRows";

const BookBids: React.FC<{
  rows: book[];
  maxTotal: number;
  className?: string;
}> = (props) => {
  return (
    <div className="book__side grow">
      <div className={`book__header flex ${props.className} justify-around`}>
        <div className="text-center basis-1/12"></div>
        <div className="text-center basis-3/12">Total</div>
        <div className="text-center basis-4/12">Size</div>
        <div className="text-center basis-4/12">Price</div>
      </div>
      <div className={classes.book__bars}>
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
