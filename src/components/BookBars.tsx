import { book } from "../shared/book";
import classes from "../assets/BookBars.module.css";
import { useMemo } from "react";

const BookBars: React.FC<{
  rows: book[];
  maxTotal: number;
  className?: string;
}> = (props) => {
  const svgRowHeight = 24;
  const svgStyle = useMemo(() => {
    const isReverse = props.className?.includes("reverse");
    const upColor = "1, 167, 129";
    const downColor = "228, 75, 68";
    return {
      height: props.rows.length * svgRowHeight,
      transform: `scale(${isReverse ? 1 : -1}, 1)`,
      fill: `rgb(${isReverse ? downColor : upColor})`,
    };
  }, [props.rows.length, props.className]);
  return (
    <div className="book__side grow">
      <div className="book__bars">
        <svg className={classes.svg} style={svgStyle}>
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
