import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import React, { useRef } from "react";
import { Tooltip } from "react-tooltip";

const QuestionMarkTooltipComponent: React.FC<{
  content?: string;
  clickable?: boolean;
  children?: React.ReactNode;
}> = ({ content, children }) => {
  const id = useRef(`tooltip-${crypto.randomUUID()}`);
  return (
    <span className="inline">
      <span
        className="inline"
        style={{ width: "20" }}
        data-tooltip-id={id.current}
        data-tooltip-content={content}
      >
        <QuestionMarkCircleIcon width="20"></QuestionMarkCircleIcon>
      </span>
      <Tooltip id={id.current} place="top" clickable>
        {children}
      </Tooltip>
    </span>
  );
};

export default QuestionMarkTooltipComponent;
