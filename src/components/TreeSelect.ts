import { Node, FlatNode } from "./typings";

export enum NODE_STATUS {
  CHECKED = "checked",
  EXPANDED = "expanded",
}

class TreeSelect {
  private flatNodes: Record<string, FlatNode>;

  constructor(initialFlatNodes = {}) {
    this.flatNodes = initialFlatNodes;
  }

  private cascadeDown(flatNode: FlatNode, isChecked: boolean) {
    if (flatNode.isParent) {
      flatNode.children!.forEach((child) => {
        this.toggleCheck(child, isChecked);
      });
    }
  }

  getNode(value: string) {
    return this.flatNodes[value];
  }

  flattenNodes(nodes?: Node[], parent = {} as FlatNode, depth = 0) {
    if (!Array.isArray(nodes) || nodes.length === 0) return;

    nodes.forEach((node, index) => {
      const { value, label, children } = node;
      const isParent = this.nodeHasChildren(node);
      const flatNode = (this.flatNodes[value] = {
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
      });
      this.flattenNodes(children, flatNode, depth + 1);
    });
  }

  private nodeHasChildren(node: Node) {
    return Array.isArray(node.children);
  }

  getCheckedLeafNodes(depth?: number) {
    const checkedLeafNodes: FlatNode[] = [];

    Object.keys(this.flatNodes).forEach((value) => {
      const node = this.flatNodes[value];
      if (node.checked && node.isLeaf) {
        if (depth === node.treeDepth || depth === undefined)
          checkedLeafNodes.push(node);
      }
    });

    return checkedLeafNodes;
  }

  toggleCheck(node: Node | FlatNode, isChecked: boolean) {
    const flatNode = this.getNode(node.value);
    this.toggleNode(node.value, NODE_STATUS.CHECKED, isChecked);

    if (flatNode.isLeaf) {
      return;
    }

    this.cascadeDown(flatNode, isChecked);
  }

  toggleNode(nodeValue: string, nodeStatus: NODE_STATUS, toggleValue: boolean) {
    this.flatNodes[nodeValue][nodeStatus] = toggleValue;
  }

  expandAllNodes(expand: boolean) {
    const allKeys = Object.keys(this.flatNodes);
    allKeys.forEach((key) => {
      if (this.flatNodes[key].isParent) {
        this.flatNodes[key].expanded = expand;
      }
    });

    return this;
  }

  isEveryChildChecked(node: Node) {
    return node.children!.every((child) => this.getNode(child.value).checked);
  }

  clone() {
    const clonedFlatNodes: Record<string, FlatNode> = {};

    // Re-construct nodes one level deep to avoid shallow copy of mutable characteristics
    Object.keys(this.flatNodes).forEach((value) => {
      const node = this.flatNodes[value];
      clonedFlatNodes[value] = { ...node };
    });

    return new TreeSelect(clonedFlatNodes);
  }

  reset() {
    this.flatNodes = {};
  }
}

export default TreeSelect;
