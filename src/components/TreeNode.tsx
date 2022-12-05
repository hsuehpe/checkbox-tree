import React, { FC, useCallback, memo } from "react";
import { useRendersCount } from "react-use";
import { Checkbox, ActionIcon, Badge } from "@mantine/core";
import { ChevronDown, ChevronRight } from "tabler-icons-react";

interface TreeNodeProps {
  value: string;
  label: string;
  checked: "checked" | "unchecked" | "indeterminate";
  expanded: boolean;
  onExpand: any;
  onCheck: any;
  isParent: boolean;
  children?: React.ReactNode;
}

const TreeNode: FC<TreeNodeProps> = ({
  value,
  checked,
  label,
  expanded,
  onCheck,
  onExpand,
  isParent,
  children,
}) => {
  const renderCount = useRendersCount();

  const renderChildren = () => {
    if (!expanded) {
      return null;
    }
    return children;
  };

  const renderCollapseBtn = useCallback(() => {
    return isParent ? (
      <ActionIcon
        variant={expanded ? "filled" : "hover"}
        onClick={() => onExpand({ value, expanded: !expanded })}
        color={expanded ? "violet" : "cyan"}
      >
        {renderIcon()}
      </ActionIcon>
    ) : null;
  }, [expanded, onExpand, isParent]);

  const getCheckState = useCallback(() => {
    if (checked === "unchecked") {
      return true;
    } else if (checked === "checked") {
      return false;
    } else {
      return true;
    }
  }, [checked]);

  const handleCheck = useCallback(() => {
    onCheck({ value, checked: getCheckState() });
  }, [onCheck, getCheckState]);

  const renderLabel = useCallback(() => {
    return (
      <span
        style={{
          display: "inline-flex",
        }}
      >
        <Checkbox
          checked={checked === "checked"}
          indeterminate={checked === "indeterminate"}
          onChange={handleCheck}
        />
        {label}
      </span>
    );
  }, [checked, handleCheck]);

  const renderIcon = () => {
    return isParent ? (
      expanded ? (
        <ChevronDown size={16} />
      ) : (
        <ChevronRight size={16} />
      )
    ) : null;
  };

  return (
    <li>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {renderCollapseBtn()}
        <span
          style={{
            display: "inline-flex",
            gap: 100,
            marginLeft: `${isParent ? 0 : 28}px`,
          }}
        >
          {renderLabel()}

          <Badge
            variant="gradient"
            gradient={{
              from: "#ed6ea0",
              to: "#ec8c69",
              deg: 35,
            }}
          >
            render count: {renderCount}
          </Badge>
        </span>
      </div>
      {renderChildren()}
    </li>
  );
};

export default TreeNode;
