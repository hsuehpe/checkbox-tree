import React, {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import NodeModel, { NODE_STATUS } from "./NodeModal";
import TreeNode from "./TreeNode";
import { isEqual } from "lodash-es";
import { FlatNode, Node } from "./typings";
import { useUpdateEffect } from "react-use";

interface TreeViewProps {
  checked: string[];
  expanded: string[];
  nodes: Node[];
  onCheck: (list: string[]) => void;
  onExpand: (list: string[]) => void;
}

const getInitModel = (
  nodes: Node[],
  checked: string[],
  expanded: string[],
  onCheck: any
) => {
  const model = new NodeModel({});
  model.flattenNodes(nodes);
  model.deserializeLists(
    {
      checked,
      expanded,
    },
    true
  );
  // onCheck(model.serializeList("checked"));
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
    getInitModel(nodes, checked, expanded, onCheck)
  );

  useEffect(() => {
    onCheck(model.serializeList(NODE_STATUS.CHECKED));
  }, []);

  const nodesRef = useRef<Node[]>(nodes);
  const checkedRef = useRef<string[]>(checked);
  const expandedRef = useRef<string[]>(expanded);

  const isEveryChildChecked = (node: Node) => {
    return node.children!.every(
      (child) => model.getNode(child.value).checkState === 1
    );
  };

  const isSomeChildChecked = (node: Node) => {
    return node.children!.some(
      (child) => model.getNode(child.value).checkState! > 0
    );
  };

  const determineShallowCheckState = (node: Node) => {
    const flatNode = model.getNode(node.value);

    if (flatNode.isLeaf) {
      return flatNode.checked ? 1 : 0;
    }
    if (isEveryChildChecked(node)) {
      return 1;
    }
    if (isSomeChildChecked(node)) {
      return 2;
    }
    return 0;
  };

  // const calcCheckState = (nodes: Node[]) => {
  //   nodes.forEach((node) => {
  //     const flatNode = model.getNode(node.value);
  //     flatNode.isParent && calcCheckState(flatNode.children!);

  //     flatNode.checkState = determineShallowCheckState(node);
  //   });
  // };

  // getDerivedStateFromProps
  // if (!isEqual(nodes, nodesRef.current)) {
  //   model.reset();
  //   model.flattenNodes(nodes);
  //   nodesRef.current = nodes;
  // }

  if (
    !isEqual(checked, checkedRef.current) ||
    !isEqual(expanded, expandedRef.current)
  ) {
    model.deserializeLists({
      checked,
      expanded,
    });
    // calcCheckState(nodes);
    // model.normalize();
    expandedRef.current = expanded;
    checkedRef.current = checked;
  }

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
