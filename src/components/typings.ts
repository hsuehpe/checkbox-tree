export type Node = {
  value: string;
  label: string;
  children?: Node[];
};

export interface FlatNode {
  label: string;
  value: string;
  children?: Node[];
  isParent: boolean;
  isLeaf: boolean;
  isChild: boolean;
  parent: Node;
  treeDepth: number;
  treePath: string;
  index: number;
  checked?: boolean;
  expanded?: boolean;
  checkState?: "checked" | "unchecked" | "indeterminate";
}
