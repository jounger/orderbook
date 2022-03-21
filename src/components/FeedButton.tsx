import React from "react";

const FeedButton: React.FC<{
  icon: string;
  label: string;
  className?: string;
  onClick: () => void;
}> = (props) => {
  return (
    <button onClick={props.onClick} className={props.className}>
      <span>{props.icon}</span> {props.label}
    </button>
  );
};

export default FeedButton;
