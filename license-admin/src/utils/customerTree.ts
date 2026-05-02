import type { CustomerListItem } from '../types/customer';
import type { SortState } from '../types/common';

// ---------------------------------------------------------------------------
// Tree node structure
// ---------------------------------------------------------------------------

export interface TreeNode {
  item: CustomerListItem;
  children: TreeNode[];
  /** 0 = root level */
  depth: number;
  /** Ancestor IDs from root down, NOT including self */
  path: string[];
}

export interface FlatTreeRow {
  node: TreeNode;
  isExpanded: boolean;
  hasChildren: boolean;
}

// ---------------------------------------------------------------------------
// Tree building — O(n)
// ---------------------------------------------------------------------------

/**
 * Build a tree from a flat list in two passes.
 * Nodes with missing or invalid parentId become roots.
 * Handles cycles defensively (orphan becomes root).
 */
export function buildTree(items: CustomerListItem[]): {
  roots: TreeNode[];
  nodeMap: Map<string, TreeNode>;
} {
  const nodeMap = new Map<string, TreeNode>();

  // Pass 1: create node stubs
  for (const item of items) {
    nodeMap.set(item.id, { item, children: [], depth: 0, path: [] });
  }

  const roots: TreeNode[] = [];

  // Pass 2: link children
  for (const item of items) {
    const node = nodeMap.get(item.id)!;
    const pid = item.parentId;
    if (pid && nodeMap.has(pid) && pid !== item.id) {
      nodeMap.get(pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Pass 3: annotate depth + path via DFS
  function annotate(node: TreeNode, depth: number, path: string[]): void {
    node.depth = depth;
    node.path = path;
    const childPath = [...path, node.item.id];
    for (const child of node.children) {
      annotate(child, depth + 1, childPath);
    }
  }
  for (const root of roots) {
    annotate(root, 0, []);
  }

  return { roots, nodeMap };
}

// ---------------------------------------------------------------------------
// Subtree helpers
// ---------------------------------------------------------------------------

/** Collect all IDs in a subtree, inclusive of root node. */
function collectSubtree(node: TreeNode, out: Set<string>): void {
  out.add(node.item.id);
  for (const child of node.children) collectSubtree(child, out);
}

/**
 * Get all descendant IDs of a given node (exclusive of self).
 * Safe when `id` is not in the map.
 */
export function getDescendantIds(nodeMap: Map<string, TreeNode>, id: string): Set<string> {
  const result = new Set<string>();
  const node = nodeMap.get(id);
  if (node) {
    for (const child of node.children) collectSubtree(child, result);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hierarchy-aware search
// ---------------------------------------------------------------------------

/**
 * Compute the set of visible node IDs for a search query.
 * Returns `null` when query is empty (all nodes visible).
 *
 * Rules:
 *  • Matched node   → visible
 *  • Matched node's ancestors → visible (context path)
 *  • Matched node's descendants → visible (full subtree)
 */
export function computeVisibleIds(
  nodeMap: Map<string, TreeNode>,
  query: string,
  getLabel: (item: CustomerListItem) => string,
): Set<string> | null {
  if (!query.trim()) return null;

  const q = query.toLowerCase();
  const visible = new Set<string>();

  for (const node of nodeMap.values()) {
    if (getLabel(node.item).toLowerCase().includes(q)) {
      collectSubtree(node, visible);
      for (const aid of node.path) visible.add(aid);
    }
  }

  return visible;
}

// ---------------------------------------------------------------------------
// Counting helpers
// ---------------------------------------------------------------------------

/**
 * Count non-group descendants recursively (customers only, not groups).
 * As specified: "Children count = count of just customers, not groups".
 */
export function countCustomerDescendants(node: TreeNode): number {
  let count = 0;
  for (const child of node.children) {
    if ((child.item.type ?? 'customer') !== 'group') count++;
    count += countCustomerDescendants(child);
  }
  return count;
}

// ---------------------------------------------------------------------------
// Tree flattening for rendering
// ---------------------------------------------------------------------------

/**
 * Flatten the tree to an ordered row list for table rendering.
 * When `visibleIds` is set (search active), ancestors are auto-expanded.
 * Manual `expandedIds` governs expansion when no search is active.
 */
export function flattenTree(
  roots: TreeNode[],
  expandedIds: Set<string>,
  visibleIds: Set<string> | null,
  sortFn?: (a: TreeNode, b: TreeNode) => number,
): FlatTreeRow[] {
  const result: FlatTreeRow[] = [];

  function isEffectivelyExpanded(node: TreeNode): boolean {
    if (visibleIds === null) return expandedIds.has(node.item.id);
    // Auto-expand if any direct child is visible (or deeper)
    return node.children.some(
      (c) => visibleIds.has(c.item.id) || isEffectivelyExpanded(c),
    );
  }

  function visit(nodes: TreeNode[]): void {
    // Groups always precede customers within the same parent, then apply sortFn as secondary order.
    const typeRank = (n: TreeNode) => ((n.item.type ?? 'customer') === 'group' ? 0 : 1);
    const ordered = [...nodes].sort((a, b) => {
      const byType = typeRank(a) - typeRank(b);
      if (byType !== 0) return byType;
      return sortFn ? sortFn(a, b) : 0;
    });
    for (const node of ordered) {
      if (visibleIds !== null && !visibleIds.has(node.item.id)) continue;
      const expanded = isEffectivelyExpanded(node);
      const hasChildren =
        visibleIds === null
          ? node.children.length > 0
          : node.children.some((c) => visibleIds.has(c.item.id));
      result.push({ node, isExpanded: expanded, hasChildren });
      if (expanded) visit(node.children);
    }
  }

  visit(roots);
  return result;
}

// ---------------------------------------------------------------------------
// Sort helper
// ---------------------------------------------------------------------------

/** Build a node comparator from a SortState + field extractor map. */
export function makeTreeSortFn(
  sort: SortState | null,
  extractors: Record<string, (item: CustomerListItem) => string>,
): ((a: TreeNode, b: TreeNode) => number) | undefined {
  if (!sort) return undefined;
  const extractor = extractors[sort.key];
  if (!extractor) return undefined;
  return (a, b) => {
    const av = extractor(a.item);
    const bv = extractor(b.item);
    const cmp = av.localeCompare(bv, undefined, { numeric: true });
    return sort.direction === 'asc' ? cmp : -cmp;
  };
}
