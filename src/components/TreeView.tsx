import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import NodeModel, { NODE_STATUS } from "./NodeModal";
import TreeNode from "./TreeNode";
import { Node } from "./typings";

interface TreeViewProps {
  checked: string[];
  expanded: string[];
  nodes: Node[];
  onCheck: (list: string[]) => void;
  onExpand: (list: string[]) => void;
}

const getInitModel = (nodes: Node[], checked: string[], expanded: string[]) => {
  const model = new NodeModel({});
  model.flattenNodes(nodes);
  model.deserializeLists(
    {
      checked,
      expanded,
    },
    true
  );
  return model;
};

const TreeView: FC<TreeViewProps> = ({
  checked,
  expanded,
  nodes,
  onCheck,
  onExpand,
}) => {
  const [model, _] = useState<NodeModel>(() =>
    getInitModel(nodes, checked, expanded)
  );

  const checkedRef = useRef<string[]>(checked);
  const expandedRef = useRef<string[]>(expanded);

  const isEveryChildChecked = (node: Node) => {
    return node.children!.every(
      (child) => model.getNode(child.value).checkState === "checked"
    );
  };

  const isSomeChildChecked = (node: Node) => {
    return node.children!.some(
      (child) => model.getNode(child.value).checkState! !== "unchecked"
    );
  };

  const determineShallowCheckState = (node: Node) => {
    const flatNode = model.getNode(node.value);

    if (flatNode.isLeaf) {
      return flatNode.checked ? "checked" : "unchecked";
    }
    if (isEveryChildChecked(node)) {
      return "checked";
    }
    if (isSomeChildChecked(node)) {
      return "indeterminate";
    }
    return "unchecked";
  };

  const handleCheck = useCallback(
    ({ value, checked }: { value: string; checked: boolean }) => {
      const clonedModel = model.clone();
      clonedModel.toggleCheck(model.getNode(value), checked);

      const serializedList = clonedModel.serializeList(NODE_STATUS.CHECKED);
      onCheck(serializedList);

      console.log({
        type: NODE_STATUS.CHECKED,
        value: checked,
        flatNode: {
          ...clonedModel.getNode(value),
        },
      });
    },
    []
  );

  const handleExpand = useCallback(
    ({ value, expanded }: { value: string; expanded: boolean }) => {
      const clonedModel = model.clone();
      clonedModel.toggleNode(value, NODE_STATUS.EXPANDED, expanded);

      const serializedList = clonedModel.serializeList(NODE_STATUS.EXPANDED);
      onExpand(serializedList);
    },
    []
  );

  useEffect(() => {
    onCheck(model.serializeList(NODE_STATUS.CHECKED));
  }, []);

  if (
    JSON.stringify(checked) !== JSON.stringify(checkedRef.current) ||
    JSON.stringify(expanded) !== JSON.stringify(expandedRef.current)
  ) {
    model.deserializeLists({
      checked,
      expanded,
    });
    expandedRef.current = expanded;
    checkedRef.current = checked;
  }

  const renderTreeNodes = (nodes: Node[]) => {
    const treeNodes = nodes.map((node) => {
      const flatNode = model.getNode(node.value);
      const { expanded, label, value, parent, isParent } = flatNode;

      const children = flatNode.isParent
        ? renderTreeNodes(flatNode.children!)
        : null;

      flatNode.checkState = determineShallowCheckState(node);

      const parentExpanded = parent.value
        ? model.getNode(parent.value).expanded
        : true;

      if (!parentExpanded) return null;

      return (
        <ul>
          <TreeNode
            key={value}
            value={value}
            label={label}
            checked={flatNode.checkState}
            expanded={expanded ?? false}
            onCheck={handleCheck}
            onExpand={handleExpand}
            isParent={isParent}
          >
            {children}
          </TreeNode>
        </ul>
      );
    });

    return treeNodes;
  };

  return <>{renderTreeNodes(nodes)}</>;
};

export default TreeView;
