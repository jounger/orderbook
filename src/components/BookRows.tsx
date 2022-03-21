import React from "react";
import { book } from "../shared/book";

const BookRows: React.FC<{ rows: book[]; className?: string }> = (props) => {
  return (
    <div>
      {props.rows.map((row, index) => (
        <div
          key={index}
          className={`book__row flex ${props.className} justify-around`}
        >
          <div className="basis-1/12">
            <span>{row.count}</span>
          </div>
          <div className="basis-3/12">
            <span>{row.total}</span>
          </div>
          <div className="basis-4/12">
            <span>{row.size}</span>
          </div>
          <div className="basis-4/12">
            <span>{row.price}</span>
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
