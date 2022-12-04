import { Node, FlatNode } from "./typings";

export enum NODE_STATUS {
  CHECKED = "checked",
  EXPANDED = "expanded",
}

class NodeModal {
  public props: object;
  public flatNodes: Record<string, FlatNode>;
  private rootNodeValues: string[] = [];

  constructor(props: object, nodes = {}) {
    this.props = props;
    this.flatNodes = nodes;
  }

  getNode(value: string) {
    return this.flatNodes[value];
  }

  flattenNodes(nodes?: Node[], parent = {} as FlatNode, depth = 0) {
    if (!Array.isArray(nodes) || nodes.length === 0) return;

    // Error handling, duplicated node value

    nodes.forEach((node, index) => {
      if (depth === 0) {
        this.rootNodeValues.push(node.value);
      }

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
      });
      this.flattenNodes(children, flatNode, depth + 1);
    });
  }

  nodeHasChildren(node: Node) {
    return Array.isArray(node.children);
  }

  // Apply outer state to nodes
  deserializeLists(
    lists: { checked?: string[]; expanded?: string[] },
    initial = false
  ) {
    const allKeys = Object.keys(this.flatNodes);
    allKeys.forEach((nodeKey: string) => {
      this.flatNodes[nodeKey][NODE_STATUS.CHECKED] = false;
      this.flatNodes[nodeKey][NODE_STATUS.EXPANDED] = false;
    });

    const checkedLists = lists[NODE_STATUS.CHECKED] || [];
    const expandedLists = lists[NODE_STATUS.EXPANDED] || [];

    checkedLists.forEach((value) => {
      if (this.flatNodes[value]) {
        this.flatNodes[value][NODE_STATUS.CHECKED] = true;
        if (initial) {
          this.cascadeDown(this.flatNodes[value], true);
        }
      }
    });

    expandedLists.forEach((value) => {
      if (this.flatNodes[value]) {
        this.flatNodes[value][NODE_STATUS.EXPANDED] = true;
      }
    });
  }

  // Extract state from nodes to list
  serializeList(nodeStatus: NODE_STATUS) {
    const list: string[] = [];

    const allKeys = Object.keys(this.flatNodes);

    allKeys.forEach((nodeKey: string) => {
      const node = this.getNode(nodeKey);
      if (node[nodeStatus]) {
        list.push(node.value);
      }
    });

    return list;
  }

  // normalize() {
  //   // remove duplicate child value
  //   const nodesToCheck = this.rootNodeValues.map((rootValue) =>
  //     this.getNode(rootValue)
  //   );

  //   const list: string[] = [];

  //   while (nodesToCheck.length !== 0) {
  //     const nodeToCheck = nodesToCheck.shift()!;

  //     if (nodeToCheck.checkState === 1) {
  //       list.push(nodeToCheck.value);
  //     }
  //     if (nodeToCheck.checkState === 2) {
  //       nodeToCheck.children!.forEach((child) => {
  //         nodesToCheck.push(this.getNode(child.value));
  //       });
  //     }
  //   }

  //   console.log(list, "normalized list");
  // }

  toggleCheck(
    node: Node | FlatNode,
    isChecked: boolean,
    percolateUpward = true
  ) {
    const flatNode = this.getNode(node.value);
    this.toggleNode(node.value, NODE_STATUS.CHECKED, isChecked);

    if (flatNode.isLeaf) {
      return;
    }

    this.cascadeDown(flatNode, isChecked);
    percolateUpward && this.cascadeUp(flatNode);
  }

  cascadeDown(flatNode: FlatNode, isChecked: boolean) {
    if (flatNode.isParent) {
      flatNode.children!.forEach((child) => {
        this.toggleCheck(child, isChecked, false);
      });
    }
  }

  cascadeUp(flatNode: FlatNode) {
    if (flatNode.isChild) {
      const parent = this.getNode(flatNode.value).parent;

      this.toggleNode(
        parent.value,
        NODE_STATUS.CHECKED,
        this.isEveryChildChecked(parent)
      );

      this.cascadeUp(this.getNode(parent.value));
    }
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

  toggleNode(nodeValue: string, nodeStatus: NODE_STATUS, toggleValue: boolean) {
    this.flatNodes[nodeValue][nodeStatus] = toggleValue;
  }

  clone() {
    const clonedNodes: Record<string, FlatNode> = {};

    // Re-construct nodes one level deep to avoid shallow copy of mutable characteristics
    Object.keys(this.flatNodes).forEach((value) => {
      const node = this.flatNodes[value];
      clonedNodes[value] = { ...node };
    });

    return new NodeModal(this.props, clonedNodes);
  }

  reset() {
    this.flatNodes = {};
    this.rootNodeValues = [];
  }
}

export default NodeModal;
