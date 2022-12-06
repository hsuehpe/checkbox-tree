import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import TreeSelect, { NODE_STATUS } from "./TreeSelect";
import TreeNode from "./TreeNode";
import { CheckState, Node } from "./typings";

interface TreeViewProps {
  nodes: Node[];
  onCheck: (list: string[]) => void;
  onExpand: (list: string[]) => void;
}

const getInitTreeSelect = (nodes: Node[]) => {
  const treeSelect = new TreeSelect({});
  treeSelect.flattenNodes(nodes);
  return treeSelect;
};

const TreeView: FC<TreeViewProps> = ({ nodes, onCheck, onExpand }) => {
  const [tree, setTree] = useState<TreeSelect>(() => getInitTreeSelect(nodes));

  const isEveryChildChecked = (node: Node) => {
    return node.children!.every(
      (child) => tree.getNode(child.value).checkState === "checked"
    );
  };

  const isSomeChildChecked = (node: Node) => {
    return node.children!.some(
      (child) => tree.getNode(child.value).checkState! !== "unchecked"
    );
  };

  const determineShallowCheckState = (node: Node): CheckState => {
    const flatNode = tree.getNode(node.value);

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
      const clonedTree = tree.clone();
      clonedTree.toggleCheck(clonedTree.getNode(value), checked);
      onCheck(clonedTree.getCheckedLeafNodes().map((node) => node.value));
      setTree(clonedTree);
    },
    [tree]
  );

  const handleExpand = useCallback(
    ({ value, expanded }: { value: string; expanded: boolean }) => {
      const clonedTree = tree.clone();
      clonedTree.toggleNode(value, NODE_STATUS.EXPANDED, expanded);
      setTree(clonedTree);
    },
    [tree]
  );

  const renderTreeNodes = useCallback(
    (nodes: Node[]) => {
      const treeNodes = nodes.map((node) => {
        const flatNode = tree.getNode(node.value);
        const { expanded, label, value, parent, isParent, treePath } = flatNode;

        const children = flatNode.isParent
          ? renderTreeNodes(flatNode.children!)
          : null;

        flatNode.checkState = determineShallowCheckState(node);

        const parentExpanded = parent.value
          ? tree.getNode(parent.value).expanded
          : true;

        if (!parentExpanded) return null;

        return (
          <ul key={treePath}>
            <TreeNode
              key={`${treePath}-${value}`}
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
    },
    [tree, nodes]
  );

  return <>{renderTreeNodes(nodes)}</>;
};

export default TreeView;
