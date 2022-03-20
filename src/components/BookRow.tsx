import React from "react";
import { book } from "../shared/book";

const BookRow: React.FC<{ row: book; className?: string }> = (props) => {
  return (
    <div className={`book__row flex ${props.className} justify-around`}>
      <div className="w-4">
        <span>{props.row.count}</span>
      </div>
      <div className="w-4">
        <span>{props.row.total}</span>
      </div>
      <div className="w-4">
        <span>{props.row.size}</span>
      </div>
      <div className="w-4">
        <span>{props.row.price}</span>
      </div>
    </div>
  );
};

export default BookRow;
