import React from "react";

const GroupSize: React.FC<{
  tick: number;
  ticks: number[];
  selectGroupSize: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = (props) => {
  return (
    <select
      onChange={props.selectGroupSize}
      value={props.tick}
      className="px-2 py-1 m-0 bg-slate-700 text-slate-300 text-sm rounded"
    >
      {props.ticks.map((tick, index) => (
        <option key={index} value={tick}>
          Group {tick}
        </option>
      ))}
    </select>
  );
};

export default GroupSize;
