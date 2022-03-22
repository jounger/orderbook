import React from "react";
import { book } from "../shared/book";

const BookRows: React.FC<{ rows: book[]; className?: string }> = (props) => {
  const isReverse = props.className?.includes("reverse");
  return (
    <div>
      {props.rows.map((row, index) => (
        <div
          key={index}
          className={`book__row flex ${props.className} justify-around h-4`}
        >
          <div className="basis-1/12 py-0 px-1">
            <span>{row.count}</span>
          </div>
          <div className="basis-3/12 py-0 px-1">
            <span>{row.total}</span>
          </div>
          <div className="basis-4/12 py-0 px-1">
            <span>{row.size}</span>
          </div>
          <div className="basis-4/12 py-0 px-1">
            <span className={`${isReverse ? "down_color" : "up_color"}`}>
              {row.price}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

BookRows.defaultProps = {
  className: "flex-row",
};

export default BookRows;
