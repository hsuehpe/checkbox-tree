import { Node, FlatNode } from "./typings";

export enum NODE_STATUS {
  CHECKED = "checked",
  EXPANDED = "expanded",
  VISIBLE = "visible",
}

class TreeSelect {
  private flatNodesMap: Record<string, FlatNode>;

  constructor(initialFlatNodes = {}) {
    this.flatNodesMap = initialFlatNodes;
  }

  private cascadeDown(flatNode: FlatNode, callback: (node: FlatNode) => void) {
    callback(flatNode);
    if (flatNode.children && flatNode.children.length > 0) {
      flatNode.children.forEach((child) => {
        this.cascadeDown(this.getNode(child.value), callback);
      });
    }
  }

  private cascadeUp(flatNode: FlatNode, callback: (node: FlatNode) => void) {
    callback(flatNode);
    if (flatNode.isChild && flatNode.parent) {
      const { parent } = this.getNode(flatNode.value);
      this.cascadeUp(this.getNode(parent.value), callback);
    }
  }

  filterNodesByKeyword(keyword: string) {
    const filteredNodes: FlatNode[] = [];

    Object.keys(this.flatNodesMap).forEach((value) => {
      this.toggleNode(value, NODE_STATUS.VISIBLE, false);
    });

    Object.keys(this.flatNodesMap).forEach((value) => {
      const node = this.flatNodesMap[value];
      if (node.label.indexOf(keyword) !== -1) {
        filteredNodes.push(node);
      }
    });

    filteredNodes.forEach((node) => {
      this.cascadeUp(node, (node) =>
        this.toggleNode(node.value, NODE_STATUS.VISIBLE, true)
      );
    });
  }

  getNode(value: string) {
    return this.flatNodesMap[value];
  }

  flattenNodes(nodes?: Node[], parent = {} as FlatNode, depth = 0) {
    if (!Array.isArray(nodes) || nodes.length === 0) return;

    nodes.forEach((node, index) => {
      const { value, label, children } = node;
      const isParent = this.nodeHasChildren(node);
      const flatNode = (this.flatNodesMap[value] = {
        label,
        value,
        children,
        isParent,
        isLeaf: !isParent,
        isChild: parent.value !== undefined,
        parent,
        treeDepth: depth,
        treePath: parent.treePath
          ? `${parent.treePath}/${index}.${value}`
          : `/${index}.${value}`,
        index,
        checked: parent.checked ? parent.checked : node.checked ?? false,
        expanded: node.expanded ?? false,
        visible: true,
      });
      this.flattenNodes(children, flatNode, depth + 1);
    });
  }

  private nodeHasChildren(node: Node) {
    return Array.isArray(node.children);
  }

  getCheckedLeafNodes(depth?: number) {
    const checkedLeafNodes: FlatNode[] = [];

    Object.keys(this.flatNodesMap).forEach((value) => {
      const node = this.getNode(value);
      if (node.checked && node.isLeaf) {
        if (depth === node.treeDepth || depth === undefined)
          checkedLeafNodes.push(node);
      }
    });

    return checkedLeafNodes;
  }

  toggleCheck(node: FlatNode, isChecked: boolean) {
    this.cascadeDown(node, (node) =>
      this.toggleNode(node.value, NODE_STATUS.CHECKED, isChecked)
    );
  }

  toggleNode(nodeValue: string, nodeStatus: NODE_STATUS, toggleValue: boolean) {
    this.flatNodesMap[nodeValue][nodeStatus] = toggleValue;
  }

  expandAllNodes(expand: boolean) {
    const allKeys = Object.keys(this.flatNodesMap);
    allKeys.forEach((key) => {
      if (this.flatNodesMap[key].isParent) {
        this.flatNodesMap[key].expanded = expand;
      }
    });

    return this;
  }

  isEveryChildChecked(node: Node) {
    return node && node.children
      ? node.children.every((child) => this.getNode(child.value).checked)
      : false;
  }

  clone() {
    const clonedFlatNodes: Record<string, FlatNode> = {};

    // Re-construct nodes one level deep to avoid shallow copy of mutable characteristics
    Object.keys(this.flatNodesMap).forEach((value) => {
      const node = this.flatNodesMap[value];
      clonedFlatNodes[value] = { ...node };
    });

    return new TreeSelect(clonedFlatNodes);
  }

  reset() {
    this.flatNodesMap = {};
  }
}

export default TreeSelect;
