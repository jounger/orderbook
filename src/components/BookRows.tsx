import React, { useMemo } from "react";
import { BookBid } from "../shared/orderBook";

const BookRows: React.FC<{ rows: BookBid[]; className?: string }> = (props) => {
  const styles = useMemo(() => {
    const isReverse = props.className?.includes("reverse");
    return {
      color: `var(${isReverse ? "--down-color" : "--up-color"})`,
    };
  }, [props.className]);
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
            <span style={styles}>{row.price}</span>
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
