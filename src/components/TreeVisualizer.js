import React, { useState, useRef, useEffect } from "react";
import PseudocodePanel from "../PseudocodePanel";
// treeSnapshot: cloned state of the tree at that step.
// highlight: which nodes to visually emphasize.
// line: which pseudocode line to highlight.
// message: small text shown in the UI.
// The frames are iterated by changing cur, which makes React re-render with a new tree snapshot → resulting in animation.
// Node class for BST
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = Math.random(); // unique id for highlighting
  }
}
// Each tree node keeps:

// value: stored number

// left, right: pointers

// id: used for stable React keys & highlights
// Clone tree for snapshots
function cloneTree(node) {
  if (!node) return null;
  const newNode = new Node(node.value);
  newNode.id = node.id; // keep id
  newNode.left = cloneTree(node.left);
  newNode.right = cloneTree(node.right);
  return newNode;
}

// Calculate positions for rendering
function calculatePositions(node, level = 0, x = 400, y = 50, spacing = 200) {
  if (!node) return;
  node.x = x;
  node.y = y;
  const newSpacing = spacing / 2;
  calculatePositions(node.left, level + 1, x - spacing, y + 80, newSpacing);
  calculatePositions(node.right, level + 1, x + spacing, y + 80, newSpacing);
}
// Creates a base BST:
const defaultTree = () => {
  const root = new Node(50);
  root.left = new Node(30);
  root.right = new Node(70);
  root.left.left = new Node(20);
  root.left.right = new Node(40);
  root.right.left = new Node(60);
  root.right.right = new Node(80);
  return root;
};
// root: current tree state.
// frames: animation steps.
// cur: current frame index.
// playing: play/pause flag.
// message: text feedback (e.g. “Inserted 40”).
// selectedAlgo: active algorithm (insert/search/etc.).

export default function TreeVisualizer() {
  const [root, setRoot] = useState(cloneTree(defaultTree()));
  const [inputVal, setInputVal] = useState("");
  const [frames, setFrames] = useState([]); // frames = [{treeSnapshot, highlight:[nodeIds], line, message}]
  const [cur, setCur] = useState(0);
  const intervalRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedAlgo, setSelectedAlgo] = useState("insert");

  // Pseudocode lines
  const insertCode = [
    "if root is null: root = new Node(value)",
    "else: traverse to find position",
    "  if value < node.value: go left",
    "  else: go right",
    "insert at leaf position"
  ];

  const deleteCode = [
    "find node to delete",
    "if leaf: remove directly",
    "if one child: replace with child",
    "if two children: find inorder successor",
    "replace and remove successor"
  ];

  const searchCode = [
    "start from root",
    "while node != null:",
    "  if value == node.value: found",
    "  if value < node.value: go left",
    "  else: go right",
    "not found"
  ];

  const inorderCode = [
    "inorder(node):",
    "  if node:",
    "    inorder(node.left)",
    "    visit(node)",
    "    inorder(node.right)"
  ];

  const preorderCode = [
    "preorder(node):",
    "  if node:",
    "    visit(node)",
    "    preorder(node.left)",
    "    preorder(node.right)"
  ];

  const postorderCode = [
    "postorder(node):",
    "  if node:",
    "    postorder(node.left)",
    "    postorder(node.right)",
    "    visit(node)"
  ];

  const levelorderCode = [
    "use queue",
    "enqueue root",
    "while queue not empty:",
    "  dequeue node, visit",
    "  enqueue left and right"
  ];

  const getCodeLines = () => {
    if (!frames[cur] || frames[cur].line < 0) return [];
    if (selectedAlgo === 'insert') return insertCode;
    if (selectedAlgo === 'delete') return deleteCode;
    if (selectedAlgo === 'search') return searchCode;
    if (selectedAlgo === 'inorder') return inorderCode;
    if (selectedAlgo === 'preorder') return preorderCode;
    if (selectedAlgo === 'postorder') return postorderCode;
    if (selectedAlgo === 'levelorder') return levelorderCode;
    return [];
  };

  const getComplexity = () => {
    switch (selectedAlgo) {
      case 'insert':
      case 'delete':
      case 'search':
        return 'Time: O(h), Space: O(h) (h = height of tree)';
      case 'inorder':
      case 'preorder':
      case 'postorder':
      case 'levelorder':
        return 'Time: O(n), Space: O(h) for recursion / O(n) for level order';
      default:
        return '';
    }
  };
  // This loop increases cur every 800ms → moves through frames array.
// React re-renders for each new cur, updating highlighted node and pseudocode line.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (playing) {
      if (cur >= frames.length) {
        setPlaying(false);
        clearInterval(intervalRef.current);
        return;
      }
      intervalRef.current = setInterval(() => {
        setCur((s) => {
          if (s + 1 >= frames.length) {
            clearInterval(intervalRef.current);
            setPlaying(false);
          }
          return Math.min(s + 1, frames.length - 1);
        });
      }, 800);
      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [playing, frames.length]);
   
  // This ties each frame’s tree snapshot and message to the visible UI.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (frames[cur]) {
      setRoot(frames[cur].treeSnapshot);
      if (frames[cur].message) setMessage(frames[cur].message);
      else setMessage("");
    }
  }, [cur, frames]);

  // Each push represents one moment in the algorithm — what the user should see and read in that step.
  // Every operation (insert, search, delete, etc.) builds an array of frames step-by-step.
  const runFrames = (builtFrames) => {
    setFrames(builtFrames);
    setCur(0);
    setPlaying(true);
  };
// runFrames() resets and plays them

// Functions like inorderTraversal, preorderTraversal, etc., recursively push frames each time a node is “visited”.
  // Insert
  const insert = () => {
    const val = parseInt(inputVal, 10);
    if (isNaN(val)) return setMessage("Enter numeric value.");
    const built = [];
    let current = cloneTree(root);
    built.push({ treeSnapshot: current, highlight: [], line: 0, message: `Insert ${val}` });
    if (!current) {
      current = new Node(val);
      built.push({ treeSnapshot: current, highlight: [current.id], line: 4, message: "Inserted as root" });
      runFrames(built);
      return;
    }
    let node = current;
    while (true) {
      built.push({ treeSnapshot: current, highlight: [node.id], line: 1, message: `At ${node.value}` });
      if (val < node.value) {
        built.push({ treeSnapshot: current, highlight: [node.id], line: 2, message: `${val} < ${node.value}, go left` });
        if (!node.left) {
          node.left = new Node(val);
          built.push({ treeSnapshot: current, highlight: [node.left.id], line: 4, message: "Inserted left" });
          break;
        }
        node = node.left;
      } else {
        built.push({ treeSnapshot: current, highlight: [node.id], line: 3, message: `${val} >= ${node.value}, go right` });
        if (!node.right) {
          node.right = new Node(val);
          built.push({ treeSnapshot: current, highlight: [node.right.id], line: 4, message: "Inserted right" });
          break;
        }
        node = node.right;
      }
    }
    runFrames(built);
  };

  // Search
  const search = () => {
    const val = parseInt(inputVal, 10);
    if (isNaN(val)) return setMessage("Enter numeric value.");
    const built = [];
    let node = cloneTree(root);
    built.push({ treeSnapshot: node, highlight: [], line: 0, message: `Search ${val}` });
    while (node) {
      built.push({ treeSnapshot: cloneTree(root), highlight: [node.id], line: 1, message: `At ${node.value}` });
      if (val === node.value) {
        built.push({ treeSnapshot: cloneTree(root), highlight: [node.id], line: 2, message: "Found!" });
        runFrames(built);
        return;
      }
      if (val < node.value) {
        built.push({ treeSnapshot: cloneTree(root), highlight: [node.id], line: 3, message: `${val} < ${node.value}, go left` });
        node = node.left;
      } else {
        built.push({ treeSnapshot: cloneTree(root), highlight: [node.id], line: 4, message: `${val} >= ${node.value}, go right` });
        node = node.right;
      }
    }
    built.push({ treeSnapshot: cloneTree(root), highlight: [], line: 5, message: "Not found" });
    runFrames(built);
  };

  // Helper to find node and parent
  const findNodeAndParent = (val, node = root, parent = null) => {
    if (!node) return null;
    if (node.value === val) return { node, parent };
    if (val < node.value) return findNodeAndParent(val, node.left, node);
    return findNodeAndParent(val, node.right, node);
  };

  // Min value node in subtree
  const minValueNode = (node) => {
    let current = node;
    while (current.left) current = current.left;
    return current;
  };

  // Delete
  const del = () => {
    const val = parseInt(inputVal, 10);
    if (isNaN(val)) return setMessage("Enter numeric value.");
    if (!root) return setMessage("Tree empty.");
    const built = [];
    const { node: target } = findNodeAndParent(val);
    if (!target) {
      built.push({ treeSnapshot: cloneTree(root), highlight: [], line: 0, message: `Delete ${val} - not found` });
      runFrames(built);
      return;
    }
    built.push({ treeSnapshot: cloneTree(root), highlight: [target.id], line: 0, message: `Found ${val} to delete` });

    let newRoot = cloneTree(root);
    let newTarget = findNodeAndParent(val, newRoot).node;
    let newParent = findNodeAndParent(val, newRoot).parent;

    if (!newTarget.left && !newTarget.right) {
      // Leaf
      built.push({ treeSnapshot: newRoot, highlight: [newTarget.id], line: 1, message: "Leaf node - remove directly" });
      if (newParent) {
        if (newParent.left === newTarget) newParent.left = null;
        else newParent.right = null;
      } else {
        newRoot = null;
      }
      built.push({ treeSnapshot: newRoot, highlight: [], line: 4, message: "Deleted leaf" });
    } else if (!newTarget.left || !newTarget.right) {
      // One child
      const child = newTarget.left || newTarget.right;
      built.push({ treeSnapshot: newRoot, highlight: [newTarget.id, child ? child.id : -1], line: 2, message: "One child - replace with child" });
      if (newParent) {
        if (newParent.left === newTarget) newParent.left = child;
        else newParent.right = child;
      } else {
        newRoot = child;
      }
      built.push({ treeSnapshot: newRoot, highlight: [child ? child.id : -1], line: 4, message: "Replaced with child" });
    } else {
      // Two children
      built.push({ treeSnapshot: newRoot, highlight: [newTarget.id], line: 3, message: "Two children - find inorder successor" });
      const successor = minValueNode(newTarget.right);
      built.push({ treeSnapshot: newRoot, highlight: [successor.id], line: 3, message: `Successor: ${successor.value}` });
      newTarget.value = successor.value;
      let succParent = findNodeAndParent(successor.value, newRoot).parent;
      if (succParent.left === successor) succParent.left = successor.right;
      else succParent.right = successor.right;
      built.push({ treeSnapshot: newRoot, highlight: [newTarget.id], line: 4, message: "Replaced value and removed successor" });
    }
    setRoot(newRoot);
    runFrames(built);
  };

  // Inorder traversal
  const inorderTraversal = (node, built, rootClone) => {
    if (!node) return;
    inorderTraversal(node.left, built, rootClone);
    built.push({ treeSnapshot: rootClone, highlight: [node.id], line: 3, message: `Visit ${node.value}` });
    inorderTraversal(node.right, built, rootClone);
  };

  const inorder = () => {
    const built = [];
    const rootClone = cloneTree(root);
    built.push({ treeSnapshot: rootClone, highlight: [], line: 0, message: "Inorder Traversal" });
    inorderTraversal(rootClone, built, rootClone);
    runFrames(built);
  };

  // Preorder
  const preorderTraversal = (node, built, rootClone) => {
    if (!node) return;
    built.push({ treeSnapshot: rootClone, highlight: [node.id], line: 1, message: `Visit ${node.value}` });
    preorderTraversal(node.left, built, rootClone);
    preorderTraversal(node.right, built, rootClone);
  };

  const preorder = () => {
    const built = [];
    const rootClone = cloneTree(root);
    built.push({ treeSnapshot: rootClone, highlight: [], line: 0, message: "Preorder Traversal" });
    preorderTraversal(rootClone, built, rootClone);
    runFrames(built);
  };

  // Postorder
  const postorderTraversal = (node, built, rootClone) => {
    if (!node) return;
    postorderTraversal(node.left, built, rootClone);
    postorderTraversal(node.right, built, rootClone);
    built.push({ treeSnapshot: rootClone, highlight: [node.id], line: 4, message: `Visit ${node.value}` });
  };

  const postorder = () => {
    const built = [];
    const rootClone = cloneTree(root);
    built.push({ treeSnapshot: rootClone, highlight: [], line: 0, message: "Postorder Traversal" });
    postorderTraversal(rootClone, built, rootClone);
    runFrames(built);
  };

  // Level order
  const levelorder = () => {
    if (!root) return setMessage("Tree is empty.");
    const built = [];
    const rootClone = cloneTree(root);
    const queue = [rootClone];
    built.push({ treeSnapshot: rootClone, highlight: [], line: 0, message: "Level Order Traversal" });
    while (queue.length > 0) {
      const node = queue.shift();
      built.push({ treeSnapshot: rootClone, highlight: [node.id], line: 3, message: `Visit ${node.value}` });
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    runFrames(built);
  };

  // Advanced operations
  const findMinMax = () => {
    if (!root) return setMessage("Tree empty.");
    const built = [];
    let minNode = root;
    built.push({ treeSnapshot: cloneTree(root), highlight: [root.id], line: -1, message: "Find Min/Max" });
    while (minNode.left) {
      minNode = minNode.left;
      built.push({ treeSnapshot: cloneTree(root), highlight: [minNode.id], line: -1, message: `Go left for min` });
    }
    let maxNode = root;
    while (maxNode.right) {
      maxNode = maxNode.right;
      built.push({ treeSnapshot: cloneTree(root), highlight: [maxNode.id], line: -1, message: `Go right for max` });
    }
    built.push({ treeSnapshot: cloneTree(root), highlight: [minNode.id, maxNode.id], line: -1, message: `Min: ${minNode.value}, Max: ${maxNode.value}` });
    runFrames(built);
  };

  const getHeight = (node) => {
    if (!node) return 0;
    return 1 + Math.max(getHeight(node.left), getHeight(node.right));
  };

  const height = () => {
    if (!root) return setMessage("Tree empty.");
    const h = getHeight(root);
    const built = [];
    built.push({ treeSnapshot: cloneTree(root), highlight: [root.id], line: -1, message: `Height: ${h}` });
    runFrames(built);
  };

  const getDiameter = (node) => {
    if (!node) return { diam: 0, height: 0 };
    const left = getDiameter(node.left);
    const right = getDiameter(node.right);
    const diam = left.height + right.height + 1;
    const height = 1 + Math.max(left.height, right.height);
    return { diam: Math.max(diam, Math.max(left.diam, right.diam)), height };
  };

  const diameter = () => {
    if (!root) return setMessage("Tree empty.");
    const d = getDiameter(root).diam;
    const built = [];
    built.push({ treeSnapshot: cloneTree(root), highlight: [], line: -1, message: `Diameter: ${d}` });
    runFrames(built);
  };

  // Simple LCA assuming BST
  const lca = (p, q) => {
    if (!root) return null;
    let node = root;
    while (node) {
      if (p < node.value && q < node.value) node = node.left;
      else if (p > node.value && q > node.value) node = node.right;
      else return node;
    }
    return null;
  };

  const findLCA = () => {
    const parts = inputVal.split(',');
    if (parts.length !== 2) return setMessage("Enter two values separated by comma.");
    const p = parseInt(parts[0].trim(), 10);
    const q = parseInt(parts[1].trim(), 10);
    if (isNaN(p) || isNaN(q)) return setMessage("Enter numeric values.");
    const ancestor = lca(p, q);
    if (!ancestor) return setMessage("No LCA found.");
    const built = [];
    built.push({ treeSnapshot: cloneTree(root), highlight: [ancestor.id], line: -1, message: `LCA of ${p} and ${q}: ${ancestor.value}` });
    runFrames(built);
  };

  const isBalanced = (node) => {
    if (!node) return true;
    const lh = getHeight(node.left);
    const rh = getHeight(node.right);
    if (Math.abs(lh - rh) > 1) return false;
    return isBalanced(node.left) && isBalanced(node.right);
  };

  const balanced = () => {
    if (!root) return setMessage("Tree empty.");
    const bal = isBalanced(root);
    const built = [];
    built.push({ treeSnapshot: cloneTree(root), highlight: [], line: -1, message: `Balanced: ${bal}` });
    runFrames(built);
  };

  const mirror = () => {
    if (!root) return setMessage("Tree empty.");
    const built = [];
    const newRoot = cloneTree(root);
    const swap = (node) => {
      if (!node) return;
      [node.left, node.right] = [node.right, node.left];
      built.push({ treeSnapshot: newRoot, highlight: [node.id], line: -1, message: `Swapped children of ${node.value}` });
      swap(node.left);
      swap(node.right);
    };
    swap(newRoot);
    setRoot(newRoot);
    built.push({ treeSnapshot: newRoot, highlight: [], line: -1, message: "Tree mirrored" });
    runFrames(built);
  };

  // Handle random tree
  const handleRandom = () => {
    const values = [50, 30, 70, 20, 40, 60, 80].sort(() => Math.random() - 0.5);
    let newRoot = null;
    for (const v of values) {
      if (!newRoot) newRoot = new Node(v);
      else {
        let node = newRoot;
        while (true) {
          if (v < node.value) {
            if (!node.left) { node.left = new Node(v); break; }
            node = node.left;
          } else {
            if (!node.right) { node.right = new Node(v); break; }
            node = node.right;
          }
        }
      }
    }
    setRoot(newRoot);
    setFrames([]);
    setCur(0);
  };

  // Reset
  const handleReset = () => {
    setRoot(cloneTree(defaultTree()));
    setFrames([]);
    setCur(0);
  };

  // Playback controls
  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (frames.length === 0) return setMessage("No animation frames to play. Run an operation.");
      if (cur >= frames.length - 1) setCur(0);
      setPlaying(true);
    }
  };
  const handleStepForward = () => {
    setPlaying(false);
    setCur((s) => Math.min(s + 1, frames.length - 1));
  };
  const handleStepBack = () => {
    setPlaying(false);
    setCur((s) => Math.max(s - 1, 0));
  };

  // Render tree
  const renderTree = (node) => {
    if (!node) return null;
    calculatePositions(node);
    const elements = [];
    const traverse = (n) => {
      if (!n) return;
      const isHighlighted = frames[cur] && frames[cur].highlight && frames[cur].highlight.includes(n.id);
      elements.push(
        <div
          key={n.id}
          className={`tree-node ${isHighlighted ? "highlight" : ""}`}
          style={{ left: n.x - 25, top: n.y - 25 }}
        >
          {n.value}
        </div>
      );
      // Lines to children
      if (n.left) {
        elements.push(
          <svg key={`line-${n.id}-left`} className="tree-line" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1={n.x} y1={n.y} x2={n.left.x} y2={n.left.y} stroke="var(--muted)" strokeWidth="2" />
          </svg>
        );
      }
      if (n.right) {
        elements.push(
          <svg key={`line-${n.id}-right`} className="tree-line" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1={n.x} y1={n.y} x2={n.right.x} y2={n.right.y} stroke="var(--muted)" strokeWidth="2" />
          </svg>
        );
      }
      traverse(n.left);
      traverse(n.right);
    };
    traverse(node);
    return elements;
  };

  return (
    <div className="visualizer-container">
      <div className="left-panel">
        <div className="controls card">
          <h3>Tree Controls</h3>

          <div className="row">
            <input placeholder="value" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} />
            <button onClick={insert}>Insert</button>
            <button onClick={del}>Delete</button>
            <button onClick={search}>Search</button>
            <button onClick={handleRandom}>Random</button>
            <button onClick={handleReset}>Reset</button>
          </div>

          <div className="row small">
            <select value={selectedAlgo} onChange={(e)=>setSelectedAlgo(e.target.value)}>
              <option value="insert">Insert</option>
              <option value="delete">Delete</option>
              <option value="search">Search</option>
              <option value="inorder">Inorder</option>
              <option value="preorder">Preorder</option>
              <option value="postorder">Postorder</option>
              <option value="levelorder">Level Order</option>
            </select>
            <button onClick={() => {
              if (selectedAlgo === 'inorder') inorder();
              else if (selectedAlgo === 'preorder') preorder();
              else if (selectedAlgo === 'postorder') postorder();
              else if (selectedAlgo === 'levelorder') levelorder();
            }}>Run Traversal</button>
          </div>

          <div className="row small">
            <button onClick={findMinMax}>Min/Max</button>
            <button onClick={height}>Height</button>
            <button onClick={diameter}>Diameter</button>
            <input placeholder="p,q for LCA" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} />
            <button onClick={findLCA}>LCA</button>
          </div>

          <div className="row small">
            <button onClick={balanced}>Balanced?</button>
            <button onClick={mirror}>Mirror</button>
          </div>

          <div className="play-controls">
            <button onClick={handleStepBack}>◀</button>
            <button onClick={handlePlayPause}>{playing ? "Pause" : "Play"}</button>
            <button onClick={handleStepForward}>▶</button>
            <span className="frame-info">{frames.length ? `${cur+1}/${frames.length}` : "0/0"}</span>
          </div>

          <div className="message">{message}</div>
          {getComplexity() && (
            <div className="complexity">
              Complexity: {getComplexity()}
            </div>
          )}
        </div>
        {/* This allows the UI to highlight the line that corresponds to the animation step. */}
        <PseudocodePanel
          codeLines={getCodeLines()}
          highlight={frames[cur] ? frames[cur].line : -1}
        />
      </div>

      <div className="canvas card">
        <h3>Tree Visualization</h3>
        <div className="tree-canvas">
          {renderTree(root)}
        </div>
        <div className="canvas-note">
          <small>Green highlight = current node in step</small>
        </div>
      </div>
    </div>
  );
}
// 🧩 Interaction with React DOM

// Each frame change causes:

// cur updates → React re-renders

// The root (tree snapshot) updates to that frame’s tree structure.

// The DOM reflects node colors, positions, and pseudocode line highlight.

// Smooth animation effect is achieved frame-by-frame.

// 🟢 Summary

// Frames = snapshots of the tree at each logical step.

// Cur = current index into those frames.

// React re-render happens automatically when cur or frames change.

// Visual animation emerges from re-rendering different snapshots in sequence.

// Pseudocode panel syncs with line field in each frame.
