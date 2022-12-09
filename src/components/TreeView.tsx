import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import TreeSelect, { NODE_STATUS } from "./TreeSelect";
import TreeNode from "./TreeNode";
import { CheckState, Node } from "./typings";

interface TreeViewProps {
  nodes: Node[];
  onCheck: (list: string[]) => void;
  onExpand: (list: string[]) => void;
  keyword?: string;
}

const getInitTreeSelect = (nodes: Node[]) => {
  const treeSelect = new TreeSelect({});
  treeSelect.flattenNodes(nodes);
  return treeSelect;
};

const TreeView: FC<TreeViewProps> = ({ nodes, onCheck, keyword }) => {
  const [tree, setTree] = useState<TreeSelect>(() => getInitTreeSelect(nodes));
  const initTree = useRef(tree);

  const isEveryChildChecked = (node: Node) => {
    return node.children
      ? node.children.every(
          (child) => tree.getNode(child.value).checkState === "checked"
        )
      : false;
  };

  const isSomeChildChecked = (node: Node) => {
    return node.children
      ? node.children.some(
          (child) => tree.getNode(child.value).checkState !== "unchecked"
        )
      : false;
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

  useEffect(() => {
    if (keyword) {
      const clonedTree = tree.clone();
      clonedTree.filterNodesByKeyword(keyword);
      setTree(clonedTree);
    } else {
      setTree(initTree.current);
    }
  }, [keyword]);

  const renderTreeNodes = useCallback(
    (nodes: Node[]) => {
      const treeNodes = nodes.map((node) => {
        const flatNode = tree.getNode(node.value);
        const { expanded, label, value, parent, isParent, treePath, visible } =
          flatNode;

        const children =
          flatNode.children && flatNode.children.length > 0
            ? renderTreeNodes(flatNode?.children)
            : null;

        flatNode.checkState = determineShallowCheckState(node);

        const parentExpanded = parent.value
          ? tree.getNode(parent.value).expanded
          : true;

        if (!parentExpanded) return null;

        return (
          <ul style={{ marginLeft: "20px" }} key={treePath}>
            {visible && (
              <TreeNode
                key={`${treePath}-${value}`}
                value={value}
                label={label}
                checked={flatNode.checkState ?? "unchecked"}
                expanded={expanded ?? false}
                onCheck={handleCheck}
                onExpand={handleExpand}
                isParent={isParent}
              >
                {children}
              </TreeNode>
            )}
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
