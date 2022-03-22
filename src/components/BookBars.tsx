import { BookBid } from "../shared/orderBook";
import { useMemo } from "react";

const BookBars: React.FC<{
  rows: BookBid[];
  maxTotal: number;
  className?: string;
}> = (props) => {
  const svgRowHeight = 16;
  const svgStyle = useMemo(() => {
    const isReverse = props.className?.includes("reverse");
    return {
      height: props.rows.length * svgRowHeight,
      transform: `scale(${isReverse ? 1 : -1}, 1)`,
      fill: `var(${isReverse ? "--down-color" : "--up-color"})`,
    };
  }, [props.className, props.rows.length]);
  return (
    <div className="book__side grow">
      <div className="book__bars">
        <svg className="z-0 w-full pointer-events-none" style={svgStyle}>
          {props.rows.map((row, index) => (
            <g key={index}>
              <rect
                x="0"
                y={index * svgRowHeight}
                width="100%"
                transform="scale(0 1)"
                height={svgRowHeight}
                fillOpacity="0.2"
              ></rect>
              <rect
                x="0"
                y={index * svgRowHeight}
                width="100%"
                transform={`scale(${row.total / props.maxTotal || 0} 1)`}
                height={svgRowHeight}
                fillOpacity="0.2"
              ></rect>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default BookBars;
