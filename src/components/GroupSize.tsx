import React from "react";

const GroupSize: React.FC<{
  tick: number;
  ticks: number[];
  selectGroupSize: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = (props) => {
  return (
    <select onChange={props.selectGroupSize} value={props.tick}>
      {props.ticks.map((tick, index) => (
        <option key={index} value={tick}>
          Group {tick}
        </option>
      ))}
    </select>
  );
};

export default GroupSize;
