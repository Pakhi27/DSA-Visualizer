import React, { useState, useRef, useEffect, useCallback } from "react";
import PseudocodePanel from "../PseudocodePanel";
// useState → for list state & UI controls
// useRef → for persistent variables (like interval timers or node IDs)
// useEffect → for reacting to state changes (like starting/stopping animations)
// useCallback → memoizes helper functions for performance
// PseudocodePanel → shows algorithm pseudocode during visualization
export default function LinkedListVisualizer() {
  const [head, setHead] = useState(null);
  const [type, setType] = useState("singly"); // singly, doubly, circular
  const [val, setVal] = useState("");
  const [pos, setPos] = useState("");
  const [key, setKey] = useState("");
  const [n, setN] = useState(""); // for nthEnd, rotate k
  const [mergeList, setMergeList] = useState(""); // comma-separated for merge, e.g., "2,4,6"
  const [frames, setFrames] = useState([]);
  const [cur, setCur] = useState(0);
  const intervalRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const nodeId = useRef(3); // initial nodes have ids 0,1,2
// head: reference to the first node in the list.
// type: “singly”, “doubly”, or “circular”.
// frames: array storing snapshots (for animation).
// cur: current frame index.
// intervalRef: stores the animation timer ID.
// playing: whether animation is running.
// message: operation feedback text.
// nodeId: keeps unique IDs for each node across renders.
// Generate unique id for new nodes
  const getNewId = useCallback(() => nodeId.current++, []);

  // Create node object
  const createNode = useCallback((value, next = null, prev = null) => ({
    value,
    next,
    prev,
    id: getNewId()
  }), [getNewId]);
  
//   Each node is an object {value, next, prev, id}.
// Ensures unique IDs for highlighting and React keys.
 
// Whenever user switches list type (singly/doubly/circular):
// It resets frames and playback.
// Rebuilds a default 3-node list (1 → 3 → 5).
// For doubly, adds prev pointers.
// For circular, connects the tail back to the head.

  useEffect(() => {
    // Reset list on type change
    setFrames([]);
    setCur(0);
    setPlaying(false);
    nodeId.current = 0; // reset id counter
    if (type === "circular") {
      // Initial circular: 1 -> 3 -> 5 -> 1
      const tail = createNode(5);
      const mid = createNode(3, tail);
      const newHead = createNode(1, mid);
      tail.next = newHead;
      setHead(newHead);
    } else if (type === "doubly") {
      // Initial doubly: 1 <-> 3 <-> 5
      const tail = createNode(5);
      const mid = createNode(3, tail);
      const newHead = createNode(1, mid);
      mid.prev = newHead;
      tail.prev = mid;
      setHead(newHead);
    } else { // singly
      const tail = createNode(5);
      const mid = createNode(3, tail);
      const newHead = createNode(1, mid);
      setHead(newHead);
    }
  }, [type, createNode]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Pseudo-codes
  // These are algorithm pseudocode lines shown alongside animation frames (through PseudocodePanel).
  const insertHeadCode = ["Create new node", "new.next = head", "head = new", "Update prev if doubly"];
  const insertTailCode = ["Traverse to tail", "tail.next = new", "new.prev = tail if doubly", "Update head if empty"];
  const insertPosCode = ["Traverse to pos-1", "new.next = curr.next", "curr.next = new", "Update prevs if doubly"];
  const deleteHeadCode = ["temp = head", "head = head.next", "head.prev = null if doubly", "Free temp"];
  const deleteTailCode = ["Traverse to prev of tail", "prev.next = null", "Update prevs if doubly"];
  const deletePosCode = ["Traverse to prev of pos", "prev.next = pos.next", "pos.next.prev = prev if doubly", "Free pos"];
  const searchValueCode = ["Traverse from head", "If node.value == key, return node/index"];
  const searchIndexCode = ["Traverse to index", "Return node.value"];
  const traverseCode = ["Start from head", "While node != null, display node.value, node = node.next"];

  // New pseudocodes for advanced operations
  const lengthCode = ["Initialize count = 0", "Traverse from head", "While node != null/end, count++, node = node.next", "Return count"];
  const middleCode = ["Slow = head, Fast = head", "While fast and fast.next", "Slow = slow.next", "Fast = fast.next.next", "Return slow as middle"];
  const nthEndCode = ["If n > length, invalid", "First = head, advance first by n steps", "Second = head", "While first.next, first = first.next, second = second.next", "Return second as nth from end"];
  const reverseIterCode = ["Prev = null, Curr = head", "While curr", "Next = curr.next", "Curr.next = prev", "Prev = curr, Curr = next", "Head = prev"];
  const reverseRecCode = ["Function reverse(node, prev)", "If !node, return prev", "Next = node.next", "Node.next = prev", "Return reverse(next, node)"];
  const detectLoopCode = ["Slow = head, Fast = head", "While fast and fast.next", "Slow = slow.next", "Fast = fast.next.next", "If slow === fast, loop detected"];
  const removeLoopCode = ["Detect loop with Floyd", "Slow = head, while slow != meet, slow = slow.next, meet = meet.next", "Slow = head, while slow.next != meet.next, slow = slow.next, meet = meet.next", "Meet.next = null"];
  const rotateCode = ["K = k % length", "If k == 0, return", "Prev = head, for i=1 to k-1, prev = prev.next", "Kth = prev.next", "Tail = prev", "While tail.next != head, tail = tail.next", "Tail.next = head", "Prev.next = null", "Head = kth"];
  const palindromeCode = ["Store values in temp array", "Traverse list, compare with reversed array", "If mismatch, not palindrome"];
  const sortInsertionCode = ["Sorted = null", "While head", "Curr = head", "Head = head.next", "Insert curr into sorted list at correct position"];
  const mergeCode = ["Dummy = new Node(0)", "Tail = dummy", "While l1 and l2", "If l1.value <= l2.value, tail.next = l1, l1 = l1.next", "Else tail.next = l2, l2 = l2.next", "Tail = tail.next", "If l1, tail.next = l1", "Else tail.next = l2", "Return dummy.next"];
  
//   When playing is true:
// It increments cur every 800ms.
// Stops when all frames are played.

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
  }, [playing, frames.length, cur]);
   
//   Whenever frame index changes:
// Updates head and message to reflect that frame’s snapshot.
  useEffect(() => {
    if (frames[cur]) {
      setHead(frames[cur].head);
      setMessage(frames[cur].message || "");
    }
  }, [cur, frames]);

  const runFrames = (builtFrames) => {
    setFrames(builtFrames);
    setCur(0);
    setPlaying(true);
  };
  
// Creates a deep copy of the current list state, storing:
// Node connections (next, prev)
// IDs to highlight visually
// Current pseudocode line
// Message to display
// This snapshot is pushed into the frames array for animation.

  const createSnapshot = (currentHead, highlightIds, line, msg) => {
    // Deep copy function for objects with circular refs
    const copyNode = (node, visited = new Map()) => {
      if (!node) return null;
      if (visited.has(node)) return visited.get(node);
      const copy = { ...node };
      visited.set(node, copy);
      copy.next = copyNode(node.next, visited);
      copy.prev = copyNode(node.prev, visited);
      return copy;
    };
    return {
      head: copyNode(currentHead),
      highlight: highlightIds,
      line,
      message: msg
    };
  };
// Core Data Helpers
// Functions like:
// getLength() → counts list nodes
// findNodeByIndex() → returns node by position
// findNodeByValue() → returns node with specific value
// reverseListIter() → reverses list pointers
// detectLoop(), removeLoop() → use Floyd’s cycle detection
// These are pure logic functions, separate from UI, keeping code modular.
  // Helper to get list length
  const getLength = (h) => {
    if (!h) return 0;
    let len = 1;
    let node = h.next;
    const visited = new Set([h.id]);
    while (node && !visited.has(node.id)) {
      visited.add(node.id);
      len++;
      node = node.next;
    }
    return len;
  };

  // Helper to find node by index
  const findNodeByIndex = (h, index) => {
    if (!h || index < 0) return null;
    let node = h;
    let i = 0;
    const visited = new Set([h.id]);
    while (node && i < index && !visited.has(node.id)) {
      node = node.next;
      i++;
      if (node) visited.add(node.id);
    }
    return i === index ? node : null;
  };

  // Helper to find node by value
  const findNodeByValue = (h, value) => {
    let node = h;
    const visited = new Set();
    while (node && !visited.has(node.id)) {
      visited.add(node.id);
      if (node.value === value) return node;
      node = node.next;
    }
    return null;
  };

  // Helper: Reverse list iteratively (for singly; for doubly, reverse next/prev)
  const reverseListIter = (h, listType) => {
    let prev = null;
    let curr = h;
    while (curr) {
      const next = curr.next;
      curr.next = prev;
      if (listType === "doubly") curr.prev = next;
      prev = curr;
      curr = next;
    }
    // For circular, reconnect tail to new head if needed, but for simplicity, treat as singly
    return prev;
  };

  // Helper: Simulate recursive reverse iteratively for visualization (basic stack sim)
  const reverseListRec = (h, listType, snapshotCallback) => {
    // For visualization, we'll use iterative with comments simulating recursion
    // Actual impl same as iterative for now
    const newHead = reverseListIter(h, listType);
    if (snapshotCallback) snapshotCallback("Simulating recursive calls");
    return newHead;
  };

  // Helper: Find middle using slow-fast
  const findMiddle = (h) => {
    if (!h) return null;
    let slow = h;
    let fast = h;
    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
    }
    return slow;
  };

  // Helper: Nth from end using two pointers
  const nthFromEnd = (h, n) => {
    if (!h || n < 0) return null;
    let len = getLength(h);
    if (n >= len) return null;
    let first = h;
    for (let i = 0; i < n; i++) first = first.next;
    let second = h;
    while (first.next) {
      first = first.next;
      second = second.next;
    }
    return second;
  };

  // Helper: Detect loop with Floyd, return meeting point or null
  const detectLoop = (h) => {
    if (!h) return null;
    let slow = h;
    let fast = h;
    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
      if (slow === fast) return slow;
    }
    return null;
  };

  // Helper: Remove loop if present
  const removeLoop = (h) => {
    let meet = detectLoop(h);
    if (!meet) return h;
    let slow = h;
    while (slow !== meet) {
      slow = slow.next;
      meet = meet.next;
    }
    meet.next = null;
    return h;
  };

  // Helper: Rotate k places to left
  const rotateList = (h, k, listType) => {
    if (!h || k === 0) return h;
    const len = getLength(h);
    k = k % len;
    if (k === 0) return h;
    let curr = h;
    for (let i = 1; i < k; i++) curr = curr.next;
    const kth = curr.next;
    curr.next = null;
    let tail = kth;
    while (tail.next) tail = tail.next;
    tail.next = h;
    return kth;
  };

  // Helper: Check palindrome (store values)
  const isPalindrome = (h) => {
    const values = [];
    let node = h;
    const visited = new Set();
    while (node && !visited.has(node.id)) {
      visited.add(node.id);
      values.push(node.value);
      node = node.next;
    }
    const reversed = [...values].reverse();
    return values.every((val, i) => val === reversed[i]);
  };

  // Helper: Insertion sort (simple for singly)
  const insertionSort = (h) => {
    if (!h) return null;
    let sorted = null;
    let curr = h;
    while (curr) {
      const next = curr.next;
      if (!sorted || curr.value < sorted.value) {
        curr.next = sorted;
        sorted = curr;
      } else {
        let temp = sorted;
        while (temp.next && temp.next.value < curr.value) {
          temp = temp.next;
        }
        curr.next = temp.next;
        temp.next = curr;
      }
      curr = next;
    }
    return sorted;
  };

  // Helper: Merge two sorted lists
  const mergeLists = (h1, h2) => {
    const dummy = createNode(0);
    let tail = dummy;
    let l1 = h1;
    let l2 = h2;
    while (l1 && l2) {
      if (l1.value <= l2.value) {
        tail.next = l1;
        l1 = l1.next;
      } else {
        tail.next = l2;
        l2 = l2.next;
      }
      tail = tail.next;
    }
    tail.next = l1 || l2;
    return dummy.next;
  };
  
//   9️⃣ Main Operations (Interactive Buttons)

// Every operation (Insert, Delete, Search, etc.) follows this pattern:
// Build a local array built of frames.
// Mutate the list step by step.
// Call createSnapshot() after each change.
// Call runFrames(built) to start animation.

  // Insert at head
  const insertHead = () => {
    const v = parseInt(val, 10);
    if (isNaN(v)) return setMessage("Enter numeric value.");
    const built = [];
    const newNode = createNode(v);
    built.push(createSnapshot(head, [], 0, `Creating new node with value ${v}`));
    newNode.next = head;
    if (head && type === "doubly") head.prev = newNode;
    if (!head && type === "circular") newNode.next = newNode;
    built.push(createSnapshot(newNode, [newNode.id], 1, "Inserting at head"));
    runFrames(built);
    setHead(newNode);
    setVal("");
  };

  // Insert at tail
  const insertTail = () => {
    const v = parseInt(val, 10);
    if (isNaN(v)) return setMessage("Enter numeric value.");
    const built = [];
    const newNode = createNode(v);
    if (!head) {
      setHead(newNode);
      if (type === "circular") newNode.next = newNode;
      return setMessage("Inserted as first node.");
    }
    let tail = head;
    while (tail.next && tail.next !== head) tail = tail.next;
    built.push(createSnapshot(head, [], 0, `Traversing to tail`));
    tail.next = newNode;
    if (type === "doubly") newNode.prev = tail;
    newNode.next = type === "circular" ? head : null;
    if (type === "doubly") {
      built.push(createSnapshot(head, [tail.id, newNode.id], 1, "Updating prev pointer"));
    }
    built.push(createSnapshot(head, [newNode.id], 1, "Inserting at tail"));
    runFrames(built);
    setHead(head);
    setVal("");
  };

  // Insert at position (0-based, 0 is head)
  const insertPos = () => {
    const v = parseInt(val, 10);
    const p = parseInt(pos, 10);
    if (isNaN(v) || isNaN(p) || p < 0) return setMessage("Enter valid numeric value and position.");
    const len = getLength(head);
    if (p > len) return setMessage("Position exceeds list length.");
    const built = [];
    const newNode = createNode(v);
    if (p === 0) {
      newNode.next = head;
      if (head && type === "doubly") head.prev = newNode;
      if (!head && type === "circular") newNode.next = newNode;
      built.push(createSnapshot(newNode, [newNode.id], 1, "Inserting at head (pos 0)"));
      runFrames(built);
      setHead(newNode);
      setVal(""); setPos("");
      return;
    }
    let prev = findNodeByIndex(head, p - 1);
    let curr = prev ? prev.next : null;
    built.push(createSnapshot(head, [prev ? prev.id : null], 0, `Traversing to position ${p-1}`));
    newNode.next = curr || (type === "circular" ? head : null);
    if (type === "doubly") {
      newNode.prev = prev;
      if (curr) curr.prev = newNode;
      built.push(createSnapshot(head, [prev.id, newNode.id, curr ? curr.id : null], 1, "Updating prev pointers if doubly"));
    }
    if (prev) prev.next = newNode;
    built.push(createSnapshot(head, [newNode.id], 2, "Inserting at position"));
    runFrames(built);
    setHead(head);
    setVal(""); setPos("");
  };

  // Delete from head
  const deleteHead = () => {
    if (!head) return setMessage("List empty! Cannot delete.");
    const built = [];
    const temp = head;
    built.push(createSnapshot(head, [head.id], 0, `Deleting head: ${temp.value}`));
    let newHead = head.next;
    let finalMessage = "Head deleted.";
    if (!newHead || head.next === head) {
      newHead = null;
      if (head.next === head) {
        built.push(createSnapshot(null, [], 1, "List emptied (single node circular)"));
      } else {
        built.push(createSnapshot(null, [], 1, "List emptied (single node)"));
      }
      finalMessage = "List emptied.";
    } else {
      if (type === "doubly") newHead.prev = null;
      if (type === "circular") {
        let newTail = newHead;
        while (newTail.next !== head) {
          newTail = newTail.next;
        }
        newTail.next = newHead;
        if (getLength(newHead) === 1) newHead.next = newHead;
      }
      built.push(createSnapshot(newHead, [], 1, "Head deleted"));
    }
    runFrames(built);
    setHead(newHead);
    setMessage(finalMessage);
  };

  // Delete from tail
  const deleteTail = () => {
    if (!head) return setMessage("List empty! Cannot delete.");
    const built = [];
    const len = getLength(head);
    if (len === 1) {
      built.push(createSnapshot(head, [head.id], 0, "Deleting only node"));
      built.push(createSnapshot(null, [], 1, "List emptied"));
      runFrames(built);
      setHead(null);
      setMessage("List emptied.");
      return;
    }
    let prev = head;
    let tail = head.next;
    while (tail.next && tail.next !== head) {
      prev = tail;
      tail = tail.next;
    }
    built.push(createSnapshot(head, [prev.id, tail.id], 0, "Traversing to tail"));
    prev.next = type === "circular" ? head : null;
    if (type === "doubly") {
      built.push(createSnapshot(head, [prev.id], 1, "Updating pointers for doubly"));
    }
    if (type === "circular" && getLength(head) === 1) {
      head.next = head;
      built.push(createSnapshot(head, [head.id], 2, "Set single node loop"));
    }
    built.push(createSnapshot(head, [], 3, "Tail deleted"));
    runFrames(built);
    setHead(head);
    setMessage("Tail deleted.");
  };

  // Delete at position or by key (value)
  const deletePosKey = () => {
    const p = parseInt(pos, 10);
    const k = parseInt(key, 10);
    if (isNaN(p) && isNaN(k)) return setMessage("Enter position or key.");
    const built = [];
    if (isNaN(k)) { // by position
      if (p < 0 || p >= getLength(head)) return setMessage("Invalid position.");
      if (p === 0) return deleteHead();
      let prev = findNodeByIndex(head, p - 1);
      let toDel = prev.next;
      built.push(createSnapshot(head, [prev.id, toDel.id], 0, `Deleting at position ${p}`));
      const nextNode = toDel.next;
      prev.next = nextNode;
      if (type === "doubly" && nextNode) nextNode.prev = prev;
      if (type === "circular" && !nextNode) {
        prev.next = head;
      }
      if (type === "doubly") {
        built.push(createSnapshot(head, [prev.id, nextNode ? nextNode.id : null], 1, "Updating prev pointer"));
      }
      built.push(createSnapshot(head, [], 2, `Deleted at position ${p}`));
      runFrames(built);
      setHead(head);
      setMessage(`Deleted at position ${p}.`);
    } else { // by key (value)
      const curr = findNodeByValue(head, k);
      if (!curr) return setMessage("Key not found.");
      let prev = null;
      let node = head;
      const visited = new Set();
      while (node && node !== curr && !visited.has(node.id)) {
        visited.add(node.id);
        prev = node;
        node = node.next;
      }
      if (!prev) return deleteHead(); // head
      built.push(createSnapshot(head, [prev.id, curr.id], 0, `Deleting node with value ${k}`));
      const nextNode = curr.next;
      prev.next = nextNode;
      if (type === "doubly" && nextNode) nextNode.prev = prev;
      if (type === "circular" && !nextNode) {
        prev.next = head;
      }
      if (type === "doubly") {
        built.push(createSnapshot(head, [prev.id, nextNode ? nextNode.id : null], 1, "Updating prev pointer"));
      }
      built.push(createSnapshot(head, [], 2, `Deleted node with value ${k}`));
      runFrames(built);
      setHead(head);
      setMessage(`Deleted node with value ${k}.`);
    }
    setPos(""); setKey("");
  };

  // Search by value
  const searchValue = () => {
    const k = parseInt(key, 10);
    if (isNaN(k)) return setMessage("Enter numeric key.");
    const built = [];
    let node = head;
    let i = 0;
    const visited = new Set();
    while (node && !visited.has(node.id)) {
      visited.add(node.id);
      if (node.value === k) {
        built.push(createSnapshot(head, [node.id], 0, `Found at index ${i}: ${k}`));
        runFrames(built);
        setMessage(`Found ${k} at index ${i}.`);
        return;
      }
      node = node.next;
      i++;
      built.push(createSnapshot(head, [node ? node.id : null], 0, `Searching...`));
    }
    setMessage("Key not found.");
  };

  // Search by index
  const searchIndex = () => {
    const p = parseInt(pos, 10);
    if (isNaN(p) || p < 0 || p >= getLength(head)) return setMessage("Invalid index.");
    const node = findNodeByIndex(head, p);
    if (!node) return setMessage("Node not found at index.");
    const built = [createSnapshot(head, [node.id], 0, `Value at index ${p}: ${node.value}`)];
    runFrames(built);
    setMessage(`Value at index ${p}: ${node.value}`);
    setPos("");
  };

  // Traverse/Display
  const traverse = () => {
    const built = [createSnapshot(head, [], 0, "Traversing list")];
    let node = head;
    let i = 0;
    const visited = new Set();
    while (node && !visited.has(node.id)) {
      visited.add(node.id);
      built.push(createSnapshot(head, [node.id], 1, `Visiting node ${i}: ${node.value}`));
      node = node.next;
      i++;
    }
    runFrames(built);
    setMessage("Traversal complete.");
  };

  // Get Length with visualization
  const getLengthOp = () => {
    if (!head) return setMessage("List empty.");
    const built = [createSnapshot(head, [], 0, "Initializing count = 0")];
    let node = head;
    let count = 0;
    const visited = new Set();
    while (node && !visited.has(node.id)) {
      visited.add(node.id);
      count++;
      built.push(createSnapshot(head, [node.id], 1, `Count: ${count}, node: ${node.value}`));
      node = node.next;
    }
    built.push(createSnapshot(head, [], 2, `Length: ${count}`));
    runFrames(built);
    setMessage(`List length: ${count}`);
  };

  // Find Middle with visualization
  const findMiddleOp = () => {
    if (!head) return setMessage("List empty.");
    const built = [createSnapshot(head, [], 0, "Slow = head, Fast = head")];
    let slow = head;
    let fast = head;
    let step = 1;
    const visited = new Set();
    while (fast && fast.next && !visited.has(fast.id)) {
      visited.add(fast.id);
      slow = slow.next;
      fast = fast.next.next;
      built.push(createSnapshot(head, [slow.id, fast ? fast.id : null], step, `Slow: ${slow.value}, Fast: ${fast ? fast.value : 'null'}`));
      step++;
    }
    built.push(createSnapshot(head, [slow.id], step, `Middle node: ${slow.value}`));
    runFrames(built);
    setMessage(`Middle node: ${slow.value}`);
  };

  // Nth from End with visualization
  const nthFromEndOp = () => {
    const num = parseInt(n, 10);
    if (!head || isNaN(num) || num < 0) return setMessage("Enter valid n or list not empty.");
    const len = getLength(head);
    if (num >= len) return setMessage("n exceeds list length.");
    const built = [createSnapshot(head, [], 0, `Advancing first pointer by ${num} steps`)];
    let first = head;
    for (let i = 0; i < num; i++) {
      first = first.next;
      built.push(createSnapshot(head, [first.id], 1, `First at step ${i+1}: ${first.value}`));
    }
    let second = head;
    let step = 2;
    while (first.next) {
      first = first.next;
      second = second.next;
      built.push(createSnapshot(head, [first.id, second.id], step, `Moving both: First=${first.value}, Second=${second.value}`));
      step++;
    }
    built.push(createSnapshot(head, [second.id], step, `Nth from end (${num}): ${second.value}`));
    runFrames(built);
    setMessage(`Nth from end (${num}): ${second.value}`);
  };

  // Rotate list with visualization
  const rotateOp = () => {
    const k = parseInt(n, 10);
    if (!head || isNaN(k) || k < 0) return setMessage("Enter valid k or list not empty.");
    const len = getLength(head);
    const effectiveK = k % len;
    if (effectiveK === 0) return setMessage("No rotation needed.");
    const built = [createSnapshot(head, [], 0, `Rotating left by ${effectiveK} positions`)];
    let prev = head;
    for (let i = 1; i < effectiveK; i++) {
      prev = prev.next;
      built.push(createSnapshot(head, [prev.id], 1, `Finding kth prev at step ${i}: ${prev.value}`));
    }
    const kth = prev.next;
    prev.next = null;
    let tail = kth;
    while (tail.next) tail = tail.next;
    tail.next = head;
    built.push(createSnapshot(kth, [kth.id], 2, `New head after rotation: ${kth.value}`));
    runFrames(built);
    setHead(kth);
    setMessage(`List rotated left by ${effectiveK}.`);
  };

  // Detect Loop with visualization
  const detectLoopOp = () => {
    if (!head) return setMessage("List empty.");
    const built = [createSnapshot(head, [], 0, "Slow = head, Fast = head")];
    let slow = head;
    let fast = head;
    let step = 1;
    const visited = new Set();
    let loopDetected = false;
    while (fast && fast.next && !visited.has(fast.id)) {
      visited.add(fast.id);
      slow = slow.next;
      fast = fast.next.next;
      built.push(createSnapshot(head, [slow.id, fast ? fast.id : null], step, `Slow: ${slow.value}, Fast: ${fast ? fast.value : 'null'}`));
      if (slow === fast) {
        loopDetected = true;
        built[built.length - 1].message += " - Loop detected!";
        break;
      }
      step++;
    }
    if (!loopDetected) {
      built.push(createSnapshot(head, [], step, "No loop detected."));
    }
    runFrames(built);
    setMessage(loopDetected ? "Loop detected!" : "No loop found.");
  };

  // Merge Lists with visualization (assumes current list is sorted; mergeList is second sorted list)
  const mergeOp = () => {
    if (!head) return setMessage("List empty.");
    const mergeValues = mergeList.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
    if (mergeValues.length === 0) return setMessage("Enter comma-separated values for second list.");
    // Create second list
    let secondHead = null;
    let tail = null;
    mergeValues.forEach(v => {
      const newNode = createNode(v);
      if (!secondHead) {
        secondHead = newNode;
        tail = newNode;
      } else {
        tail.next = newNode;
        tail = newNode;
      }
    });
    const built = [createSnapshot(head, [], 0, "Merging two sorted lists")];
    const mergedHead = mergeLists(head, secondHead);
    built.push(createSnapshot(mergedHead, [], 1, "Merged list created"));
    runFrames(built);
    setHead(mergedHead);
    setMessage("Lists merged.");
    setMergeList("");
  };

  // Reverse list with visualization (iterative)
  const reverseOp = () => {
    if (!head) return setMessage("List empty.");
    const built = [createSnapshot(head, [], 0, "Starting reverse: prev = null, curr = head")];
    let prev = null;
    let curr = head;
    let step = 1;
    const visited = new Set();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      const next = curr.next;
      built.push(createSnapshot(head, [curr.id, next ? next.id : null], step, `Next = ${next ? next.value : 'null'}, curr.next = prev`));
      curr.next = prev;
      if (type === "doubly") {
        curr.prev = next;
        built.push(createSnapshot(head, [curr.id], step + 1, `For doubly: curr.prev = ${next ? next.value : 'null'}`));
      }
      prev = curr;
      curr = next;
      step += 2;
    }
    built.push(createSnapshot(prev, [], step, "Reversed: head = prev"));
    runFrames(built);
    setHead(prev);
    setMessage("List reversed.");
  };

  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (frames.length === 0) return setMessage("No frames to play.");
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
  
//getCodeLines() and getComplexity()
// Match current message text to decide which pseudocode to display.
// Show time/space complexity dynamically.

  const getCodeLines = () => {
    if (!frames[cur] || frames[cur].line < 0) return [];
    const msg = frames[cur].message.toLowerCase();
    if (msg.includes("insert head")) return insertHeadCode;
    if (msg.includes("insert tail")) return insertTailCode;
    if (msg.includes("insert")) return insertPosCode;
    if (msg.includes("delete head")) return deleteHeadCode;
    if (msg.includes("delete tail")) return deleteTailCode;
    if (msg.includes("deleting")) return deletePosCode;
    if (msg.includes("search")) return searchValueCode;
    if (msg.includes("index")) return searchIndexCode;
    if (msg.includes("travers")) return traverseCode;
    if (msg.includes("length") || msg.includes("count")) return lengthCode;
    if (msg.includes("reverse") || msg.includes("reversed")) return reverseIterCode;
    if (msg.includes("middle")) return middleCode;
    if (msg.includes("nth from end")) return nthEndCode;
    if (msg.includes("rotat")) return rotateCode;
    if (msg.includes("loop")) return detectLoopCode;
    if (msg.includes("merg")) return mergeCode;
    return [];
  };

  const getComplexity = () => {
    if (!frames[cur]) return '';
    const msg = frames[cur].message.toLowerCase();
    if (msg.includes("insert head") || msg.includes("insert tail") || msg.includes("delete head") || msg.includes("delete tail")) {
      return 'Time: O(1), Space: O(1)';
    }
    if (msg.includes("insert") || msg.includes("deleting") || msg.includes("search") || msg.includes("travers") || msg.includes("length") || msg.includes("count") || msg.includes("reverse") || msg.includes("reversed") || msg.includes("middle") || msg.includes("nth from end") || msg.includes("rotat") || msg.includes("loop") || msg.includes("merg")) {
      return 'Time: O(n), Space: O(1)';
    }
    return '';
  };
  
  //  renderList()

// Renders nodes visually:
// Each node becomes a <div> with arrows showing links.

// Highlights current frame’s nodes using conditional className.

// Handles different pointer styles for singly, doubly, and circular lists.
  // Render list for visualization
  const renderList = () => {
    if (!head) return null;
    const nodes = [];
    let node = head;
    let i = 0;
    const visited = new Set();
    while (node && i < 20 && !visited.has(node.id)) {
      visited.add(node.id);
      nodes.push(node);
      node = node.next;
      i++;
    }
    const isCircular = type === "circular";
    const isDoubly = type === "doubly";
    const isTail = (n) => !n.next || (isCircular && n.next === head);
    return (
      <div className="list-row">
        <div className="head-label">Head</div>
        {nodes.map((n, idx) => {
          const isHighlighted = frames[cur] && frames[cur].highlight && frames[cur].highlight.includes(n.id);
          const className = `node ${isHighlighted ? "highlight" : ""}`;
          const thisIsTail = isTail(n);
          const linkClass = `link ${isDoubly ? "doubly" : ""} ${isCircular && thisIsTail ? "circular" : ""}`;
          const linkContent = isDoubly ? "↔" : "→";
          return (
            <React.Fragment key={n.id}>
              <div className={className}>
                <div className="node-value">{n.value}</div>
                {thisIsTail && isCircular && <div className="arrow loop">↺</div>}
              </div>
              {!thisIsTail && <div className={linkClass}>{linkContent}</div>}
            </React.Fragment>
          );
        })}
        {isCircular && nodes.length > 0 && isTail(nodes[nodes.length - 1]) && (
          <div className="circular-back">← (to head)</div>
        )}
      </div>
    );
  };

  const isEmptyList = () => !head;
//JSX Layout (Main UI)
// The return block renders:
// Left panel → Input fields + control buttons.
// Right panel → Visualized nodes.
// Bottom → Playback buttons & pseudocode display.

  return (
    <div className="visualizer-container">
      <div className="left-panel">
        <div className="controls card">
          <h3>Linked List Controls</h3>
          <div className="row">
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="singly">Singly Linked List</option>
              <option value="doubly">Doubly Linked List</option>
              <option value="circular">Circular Linked List</option>
            </select>
          </div>
          <div className="row small">
            <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="value" />
            <input value={pos} onChange={(e) => setPos(e.target.value)} placeholder="position/index (optional)" />
            <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="key/value (for search/delete)" />
            <input value={n} onChange={(e) => setN(e.target.value)} placeholder="n/k (for nthEnd, rotate)" />
            <input value={mergeList} onChange={(e) => setMergeList(e.target.value)} placeholder="merge list (e.g., 2,4,6)" />
          </div>
          <div className="row">
            <button onClick={insertHead}>Insert Head</button>
            <button onClick={insertTail}>Insert Tail</button>
            <button onClick={insertPos}>Insert at Pos</button>
          </div>
          <div className="row">
            <button onClick={deleteHead} disabled={isEmptyList()}>Delete Head</button>
            <button onClick={deleteTail} disabled={isEmptyList()}>Delete Tail</button>
            <button onClick={deletePosKey}>Delete at Pos/Key</button>
          </div>
          <div className="row">
            <button onClick={searchValue}>Search Value</button>
            <button onClick={searchIndex}>Search Index</button>
            <button onClick={traverse}>Traverse</button>
            <button onClick={getLengthOp} disabled={isEmptyList()}>Get Length</button>
          </div>
          <div className="row">
            <button onClick={reverseOp} disabled={isEmptyList()}>Reverse</button>
            <button onClick={findMiddleOp} disabled={isEmptyList()}>Find Middle</button>
            <button onClick={nthFromEndOp} disabled={isEmptyList() || !n}>Nth from End</button>
          </div>
          <div className="row">
            <button onClick={rotateOp} disabled={isEmptyList() || !n}>Rotate</button>
            <button onClick={detectLoopOp} disabled={isEmptyList()}>Detect Loop</button>
            <button onClick={mergeOp} disabled={!mergeList}>Merge Lists</button>
          </div>
          <div className="play-controls">
            <button onClick={handleStepBack}>◀</button>
            <button onClick={handlePlayPause}>{playing ? "Pause" : "Play"}</button>
            <button onClick={handleStepForward}>▶</button>
            <span className="frame-info">{frames.length ? `${cur + 1}/${frames.length}` : "0/0"}</span>
          </div>
          <p className="info">Select type and perform operations. Circular is singly with tail.next = head.</p>
          <div className="message">{message}</div>
        </div>
        <PseudocodePanel
          codeLines={getCodeLines()}
          highlight={frames[cur] ? frames[cur].line : -1}
        />
      </div>
      <div className="canvas card">
        <h3>Linked List Visualization (head → right)</h3>
        <div className="list-container">
          {isEmptyList() ? (
            <div className="empty">Empty List</div>
          ) : (
            renderList()
          )}
        </div>
      </div>
    </div>
  );
}
