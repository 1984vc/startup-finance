import React, { useRef } from "react";
import { Tooltip } from "react-tooltip";

const ToolipComponent: React.FC<{
  content: string;
  children: React.ReactNode;
}> = ({ content, children: children }) => {
  const id = useRef(`tooltip-${crypto.randomUUID()}`);
  return (
    <span className="inline">
      <span
        className="inline"
        data-tooltip-id={id.current}
        data-tooltip-content={content}
      >
        {children}
      </span>
      <Tooltip id={id.current} place="top" />
    </span>
  );
};

export default ToolipComponent;
