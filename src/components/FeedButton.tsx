import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const FeedButton: React.FC<{
  icon: IconDefinition;
  label: string;
  className?: string;
  onClick: () => void;
}> = (props) => {
  return (
    <button
      onClick={props.onClick}
      className={`w-28 mx-1 px-1 py-1 text-xs leading-7 rounded text-white ${props.className}`}
    >
      <FontAwesomeIcon icon={props.icon} className="px-2"></FontAwesomeIcon>
      <label>{props.label}</label>
    </button>
  );
};

export default FeedButton;
