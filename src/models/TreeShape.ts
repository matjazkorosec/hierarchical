import { MenuMarkers } from './MenuMarkers';

// constructs tree structure
export default class TreeShape {
  tree: MenuMarkers;

  constructor(data: Array<Record<string, unknown>>) {
    this.tree = new MenuMarkers('Groot', 0);

    // convert into hierarchical tree structure.
    this.tree.children = data.map((branch) =>
      this.buildTree(branch, this.tree)
    );

    let totalValue = 0;
    for (const child of this.tree.children) {
      totalValue += child.setValue();
    }
    this.tree.value = totalValue;
  }

  // builds tree nodes
  buildTree(
    data: Record<string, unknown>,
    parent: MenuMarkers | null = null
  ): MenuMarkers {
    const [key, value] = Object.entries(data)[0] ?? ['Unnamed', 0];
    const branch = new MenuMarkers(key, typeof value === 'number' ? value : 0);
    branch.parent = parent;

    // if array recursively process child nodes.
    if (Array.isArray(value)) {
      branch.children = value.map((child) => this.buildTree(child, branch));

      let branchValue = 0;
      for (const child of branch.children) {
        branchValue += child.setValue();
      }
      branch.value = branchValue;
    }

    return branch;
  }

  // updates tree structure & triggers callback
  triggerUpdate(callback: (tree: MenuMarkers) => void) {
    this.tree.setValue();
    callback(this.tree);
  }
}
