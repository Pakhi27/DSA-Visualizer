import React, { useState, useRef, useEffect } from "react";
import PseudocodePanel from "../PseudocodePanel";
// useState → store & update dynamic values (like array, current frame, etc.)
// useRef → hold reference to the animation timer (to pause/resume easily)
// useEffect → manage side effects like updating frames when playing
// PseudocodePanel → shows pseudocode next to visualization (with highlighted lines)
// a frame represents one snapshot (state) of the array at a particular moment during an algorithm.
// cur stands for current frame index —
// it tells React which frame out of all frames should be currently displayed.

/*
  This ArrayVisualizer provides:
  - create random array / manual array input
  - insert / delete at index
  - linear search (animated)
  - binary search (animated) [works correctly when array is sorted]
  - step / play / pause controls for animations
*/

const defaultArray = [8, 3, 10, 1, 6];
const maxSize = 20;

function cloneArr(a) { return a.slice(); }

export default function ArrayVisualizer() {
  const [arr, setArr] = useState(cloneArr(defaultArray));
  const [inputVal, setInputVal] = useState("");
  const [indexVal, setIndexVal] = useState("");
  const [target, setTarget] = useState("");
  const [selectedAlgo, setSelectedAlgo] = useState("bubble");
  const [frames, setFrames] = useState([]); // frames = [{arr, highlight:[i], line}]
  const [cur, setCur] = useState(0);
  const intervalRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");

// Each code block stores pseudocode lines for that algorithm.
// Later, PseudocodePanel uses this array with a highlighted line to visually sync the animation with the logic.
// There are pseudocode arrays for:
// Linear Search
// Binary Search
// Stack operations (peek, isEmpty, isFull)
// Sorting algorithms: bubble, selection, insertion, merge, quick

  const linearCode = [
    "for i from 0 to n-1:",
    "  if arr[i] == target: return i",
    "return -1"
  ];
  const binaryCode = [
    "l = 0, r = n-1",
    "while l <= r:",
    "  mid = (l+r)//2",
    "  if arr[mid] == target: return mid",
    "  if target < arr[mid]: r = mid-1",
    "  else: l = mid+1",
    "return -1"
  ];

  const peekCode = [
    "if arr.length == 0: return null",
    "return arr[arr.length - 1]"
  ];

  const isEmptyCode = [
    "return arr.length == 0"
  ];

  const isFullCode = [
    "return arr.length == maxSize"
  ];

  const bubbleCode = [
    "for i from 0 to n-2:",
    "  for j from 0 to n-i-2:",
    "    if arr[j] > arr[j+1]: swap arr[j], arr[j+1]"
  ];

  const selectionCode = [
    "for i from 0 to n-2:",
    "  minIdx = i",
    "  for j from i+1 to n-1:",
    "    if arr[j] < arr[minIdx]: minIdx = j",
    "  swap arr[i], arr[minIdx]"
  ];

  const insertionCode = [
    "for i from 1 to n-1:",
    "  key = arr[i]",
    "  j = i-1",
    "  while j >= 0 and arr[j] > key:",
    "    arr[j+1] = arr[j]",
    "    j--",
    "  arr[j+1] = key"
  ];

  const mergeCode = [
    "mergeSort(arr, l, r):",
    "  if l < r:",
    "    mid = (l+r)/2",
    "    mergeSort(arr, l, mid)",
    "    mergeSort(arr, mid+1, r)",
    "    merge(arr, l, mid, r)"
  ];

  const quickCode = [
    "quickSort(arr, low, high):",
    "  if low < high:",
    "    pi = partition(arr, low, high)",
    "    quickSort(arr, low, pi-1)",
    "    quickSort(arr, pi+1, high)"
  ];

  const getCodeLines = () => {
//Selects which pseudocode array to display based on:
// Currently selected algorithm (selectedAlgo)
// Current frame line number (frames[cur].line)
    if (!frames[cur] || frames[cur].line < 0) return [];
    if (selectedAlgo === 'bubble') return bubbleCode;
    if (selectedAlgo === 'selection') return selectionCode;
    if (selectedAlgo === 'insertion') return insertionCode;
    if (selectedAlgo === 'merge') return mergeCode;
    if (selectedAlgo === 'quick') return quickCode;
    // for search
    if (frames[cur].line <= 2) return linearCode;
    if (frames[cur].line <= 1) return peekCode;
    if (frames[cur].line <= 1) return isEmptyCode;
    return isFullCode;
  };
  
  // Returns time and space complexity string for the selected algorithm.
  const getComplexity = () => {
    if (selectedAlgo === 'bubble' || selectedAlgo === 'selection' || selectedAlgo === 'insertion') {
      return 'Time: O(n²), Space: O(1)';
    }
    if (selectedAlgo === 'merge') {
      return 'Time: O(n log n), Space: O(n)';
    }
    if (selectedAlgo === 'quick') {
      return 'Time: O(n log n) avg, Space: O(log n)';
    }
    // For search operations, assume linear or binary based on context
    if (frames[cur] && frames[cur].line <= 2) {
      return 'Time: O(n), Space: O(1)';
    }
    if (frames[cur] && frames[cur].line <= 1) {
      return 'Time: O(1), Space: O(1)';
    }
    return '';
  };
// Runs automatically when playing changes.
// If playing is true, sets an interval that increments cur every 650ms.
// If it reaches the last frame, it stops and clears interval.

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
      }, 650);
      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [playing, frames.length]);

// Whenever cur changes (frame updates), it:
// Updates the visualized array (arr)
// Displays any status message for that frame

  useEffect(() => {
    // when cur frame changes, update arr to the arrSnapshot in frame
    if (frames[cur]) {
      setArr(frames[cur].arrSnapshot);
      if (frames[cur].message) setMessage(frames[cur].message);
      else setMessage("");
    }
  }, [cur, frames]);

  // Utility to push frames for an animation
  // Adds one animation step (snapshot + highlight + message) to frames array.

  const pushFrame = (arrSnapshot, highlight = [], line = -1, message = "") => {
    setFrames((prev) => [...prev, { arrSnapshot: cloneArr(arrSnapshot), highlight, line, message }]);
  };
  
  // Resets to frame 0 and starts playing a built sequence of frames.
  // Build frames then start visual playback (reset cur).

  const runFrames = (builtFrames) => {
    setFrames(builtFrames);
    setCur(0);
    setPlaying(true);
  };

  // Actions
//   🔹 Random / Manual Array
// handleRandom() → generates random array of size 7.
// handleManualSet() → takes user input (comma-separated), validates, converts to numbers, updates arr.

// 🔹 Insert / Delete

// handleInsert() → inserts value at index with animation.
// handleDelete() → deletes value from index with animation.

// 🔹 Peek / isEmpty / isFull
// Shows frame with highlight and sets message accordingly.
  const handleRandom = () => {
    const n = 7;
    const newArr = Array.from({ length: n }, () => Math.floor(Math.random() * 20));
    setArr(newArr);
    setFrames([]);
    setCur(0);
  };

  const handleManualSet = () => {
    try {
      const parsed = inputVal.split(",").map((s) => parseInt(s.trim(), 10)).filter(v => !isNaN(v));
      if (parsed.length === 0) return setMessage("Enter comma separated numbers.");
      setArr(parsed);
      setFrames([]);
      setCur(0);
      setMessage("");
    } catch {
      setMessage("Invalid input.");
    }
  };

  const handleInsert = () => {
    if (arr.length >= maxSize) {
      setMessage("Array full! Cannot insert.");
      return;
    }
    const value = parseInt(inputVal, 10);
    let idx = indexVal === "" ? arr.length : parseInt(indexVal, 10);
    if (isNaN(value)) return setMessage("Enter a numeric value to insert.");
    if (isNaN(idx) || idx < 0) idx = 0;
    if (idx > arr.length) idx = arr.length;

    // create frames showing shifts
    const built = [];
    let working = arr.slice();
    // frame before insertion
    built.push({ arrSnapshot: working.slice(), highlight: [], line: -1, message: `Insert ${value} at index ${idx}` });
    // do the shift animation: we simply create snapshots with the inserted value 'placeholder'
    working.splice(idx, 0, value);
    built.push({ arrSnapshot: working.slice(), highlight: [idx], line: -1, message: "Inserted" });
    runFrames(built);
  };

  const handleDelete = () => {
    if (arr.length === 0) {
      setMessage("Array empty! Cannot delete.");
      return;
    }
    let idx = parseInt(indexVal, 10);
    if (isNaN(idx) || idx < 0 || idx >= arr.length) return setMessage("Invalid delete index.");
    const built = [];
    let working = arr.slice();
    built.push({ arrSnapshot: working.slice(), highlight: [idx], line: -1, message: `Deleting index ${idx}` });
    working.splice(idx, 1);
    built.push({ arrSnapshot: working.slice(), highlight: [], line: -1, message: "Deleted" });
    runFrames(built);
  };

  const peek = () => {
    if (arr.length === 0) {
      setMessage("Array empty! Cannot peek.");
      return;
    }
    const built = [];
    built.push({ arrSnapshot: arr.slice(), highlight: [arr.length - 1], line: 0, message: "Peeking last element" });
    runFrames(built);
  };

  const checkEmpty = () => {
    const isEmpty = arr.length === 0;
    setMessage(`Is Empty: ${isEmpty}`);
    const built = [];
    built.push({ arrSnapshot: arr.slice(), highlight: [], line: 0, message: `Is Empty: ${isEmpty}` });
    runFrames(built);
  };

  const checkFull = () => {
    const isFull = arr.length === maxSize;
    setMessage(`Is Full: ${isFull}`);
    const built = [];
    built.push({ arrSnapshot: arr.slice(), highlight: [], line: 0, message: `Is Full: ${isFull}` });
    runFrames(built);
  };
  
//   📊 🔹 Sorting Algorithms (Each Builds Frames)

// Each returns an array of “frames” (snapshots of the array at each important step).

// 🫧 Bubble Sort

// Compares adjacent elements and swaps if out of order.

// 🧩 Selection Sort

// Finds minimum and swaps with current position.

// 🪣 Insertion Sort

// Shifts greater elements and inserts key.

// 🧱 Merge Sort / Quick Sort

// Simplified — they just produce one frame (final sorted result).

// 🔍 10️⃣ Searching Algorithms
// Linear Search

// Iterates linearly, highlighting each element.
// If found → shows “Found at index X”.
// If not found → “Not found”.

// Binary Search

// Requires sorted array.
// Highlights mid element and narrows range (l, r) each step.
  const bubbleSort = (arr) => {
    const built = [];
    let working = arr.slice();
    for (let i = 0; i < working.length - 1; i++) {
      for (let j = 0; j < working.length - i - 1; j++) {
        built.push({ arrSnapshot: working.slice(), highlight: [j, j+1], line: 0, message: `Compare ${working[j]} and ${working[j+1]}` });
        if (working[j] > working[j+1]) {
          [working[j], working[j+1]] = [working[j+1], working[j]];
          built.push({ arrSnapshot: working.slice(), highlight: [j, j+1], line: 1, message: `Swapped` });
        }
      }
    }
    return built;
  };

  const selectionSort = (arr) => {
    const built = [];
    let working = arr.slice();
    for (let i = 0; i < working.length - 1; i++) {
      let minIdx = i;
      built.push({ arrSnapshot: working.slice(), highlight: [i], line: 0, message: `Find min from ${i}` });
      for (let j = i + 1; j < working.length; j++) {
        built.push({ arrSnapshot: working.slice(), highlight: [minIdx, j], line: 2, message: `Compare ${working[j]} with min ${working[minIdx]}` });
        if (working[j] < working[minIdx]) {
          minIdx = j;
          built.push({ arrSnapshot: working.slice(), highlight: [minIdx], line: 3, message: `New min at ${minIdx}` });
        }
      }
      if (minIdx !== i) {
        [working[i], working[minIdx]] = [working[minIdx], working[i]];
        built.push({ arrSnapshot: working.slice(), highlight: [i, minIdx], line: 4, message: `Swapped` });
      }
    }
    return built;
  };

  const insertionSort = (arr) => {
    const built = [];
    let working = arr.slice();
    for (let i = 1; i < working.length; i++) {
      let key = working[i];
      let j = i - 1;
      built.push({ arrSnapshot: working.slice(), highlight: [i], line: 0, message: `Key = ${key}` });
      while (j >= 0 && working[j] > key) {
        built.push({ arrSnapshot: working.slice(), highlight: [j, j+1], line: 3, message: `Shift ${working[j]}` });
        working[j + 1] = working[j];
        j--;
      }
      working[j + 1] = key;
      built.push({ arrSnapshot: working.slice(), highlight: [j+1], line: 5, message: `Inserted key` });
    }
    return built;
  };

  const mergeSort = (arr) => {
    const built = [];
    const merge = (left, right) => {
      const result = [];
      let i = 0, j = 0;
      while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }
      return result.concat(left.slice(i)).concat(right.slice(j));
    };
    const sort = (array) => {
      if (array.length <= 1) return array;
      const mid = Math.floor(array.length / 2);
      const left = sort(array.slice(0, mid));
      const right = sort(array.slice(mid));
      return merge(left, right);
    };
    const sorted = sort(arr.slice());
    built.push({ arrSnapshot: sorted, highlight: [], line: -1, message: "Sorted with Merge Sort" });
    return built;
  };

  const quickSort = (arr) => {
    const built = [];
    const partition = (array, low, high) => {
      const pivot = array[high];
      let i = low - 1;
      for (let j = low; j < high; j++) {
        if (array[j] < pivot) {
          i++;
          [array[i], array[j]] = [array[j], array[i]];
        }
      }
      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      return i + 1;
    };
    const sort = (array, low, high) => {
      if (low < high) {
        const pi = partition(array, low, high);
        sort(array, low, pi - 1);
        sort(array, pi + 1, high);
      }
    };
    const working = arr.slice();
    sort(working, 0, working.length - 1);
    built.push({ arrSnapshot: working, highlight: [], line: -1, message: "Sorted with Quick Sort" });
    return built;
  };

  // Linear search frames
  const linearSearch = () => {
    const t = parseInt(target, 10);
    if (isNaN(t)) return setMessage("Enter numeric target.");
    const built = [];
    for (let i = 0; i < arr.length; i++) {
      built.push({ arrSnapshot: arr.slice(), highlight: [i], line: 0, message: `Checking index ${i}` });
      if (arr[i] === t) {
        built.push({ arrSnapshot: arr.slice(), highlight: [i], line: 1, message: `Found at index ${i}` });
        runFrames(built);
        return;
      }
    }
    built.push({ arrSnapshot: arr.slice(), highlight: [], line: 2, message: "Not found" });
    runFrames(built);
  };

  // Binary search frames (array must be sorted)
  const binarySearch = () => {
    const t = parseInt(target, 10);
    if (isNaN(t)) return setMessage("Enter numeric target.");
    // Check sorted
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < arr[i - 1]) {
        setMessage("Binary search requires sorted array. Sort it first or use linear search.");
        return;
      }
    }
    let l = 0, r = arr.length - 1;
    const built = [];
    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      built.push({ arrSnapshot: arr.slice(), highlight: [mid], line: 2, message: `mid = ${mid}` });
      if (arr[mid] === t) {
        built.push({ arrSnapshot: arr.slice(), highlight: [mid], line: 3, message: `Found at ${mid}` });
        runFrames(built);
        return;
      }
      if (t < arr[mid]) {
        built.push({ arrSnapshot: arr.slice(), highlight: [], line: 4, message: `Go left (r = ${mid - 1})` });
        r = mid - 1;
      } else {
        built.push({ arrSnapshot: arr.slice(), highlight: [], line: 5, message: `Go right (l = ${mid + 1})` });
        l = mid + 1;
      }
    }
    built.push({ arrSnapshot: arr.slice(), highlight: [], line: 6, message: "Not found" });
    runFrames(built);
  };

  const handleSort = () => {
    let built = [];
    switch (selectedAlgo) {
      case 'bubble': built = bubbleSort(arr); break;
      case 'selection': built = selectionSort(arr); break;
      case 'insertion': built = insertionSort(arr); break;
      case 'merge': built = mergeSort(arr); break;
      case 'quick': built = quickSort(arr); break;
      default: return;
    }
    runFrames(built);
  };

  // playback controls
// Play → starts interval playback
// Pause → stops it
// Step ▶ / ◀ → manually move between frames.
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
   
//   🧱 12️⃣ JSX Return — The UI Layout

// The render output is split into two panels:

// 🧭 Left Panel

// Contains:

// Array controls (inputs, buttons)

// Sorting/search controls

// Play/pause controls

// Message + Complexity display

// PseudocodePanel component

// 🧩 Right Panel (Canvas)

// Displays:

// Visual representation of the array (colored boxes)

// Each cell shows value + index

// Highlight color for active element

// A small legend explaining the highlight
  return (
    <div className="visualizer-container">
      <div className="left-panel">
        <div className="controls card">
          <h3>Array Controls</h3>

          <div className="row">
            <input placeholder="e.g. 5,3,2,7" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} />
            <button onClick={handleManualSet}>Set Array</button>
            <button onClick={handleRandom}>Random</button>
            <button onClick={() => { setArr(defaultArray.slice()); setFrames([]); setCur(0); }}>Reset</button>
          </div>

          <div className="row small">
            <input placeholder="value" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} />
            <input placeholder="index (optional)" value={indexVal} onChange={(e)=>setIndexVal(e.target.value)} />
            <button onClick={handleInsert}>Insert</button>
            <button onClick={handleDelete}>Delete</button>
          </div>

          <div className="row small">
            <select value={selectedAlgo} onChange={(e)=>setSelectedAlgo(e.target.value)}>
              <option value="bubble">Bubble Sort</option>
              <option value="selection">Selection Sort</option>
              <option value="insertion">Insertion Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="quick">Quick Sort</option>
            </select>
            <button onClick={handleSort}>Sort</button>
          </div>

          <div className="row small">
            <input placeholder="target for search" value={target} onChange={(e)=>setTarget(e.target.value)} />
            <button onClick={linearSearch}>Linear Search</button>
            <button onClick={binarySearch}>Binary Search</button>
          </div>

          <div className="row small">
            <button onClick={peek}>Peek</button>
            <button onClick={checkEmpty}>Is Empty</button>
            <button onClick={checkFull}>Is Full</button>
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

        <PseudocodePanel
          codeLines={getCodeLines()}
          highlight={frames[cur] ? frames[cur].line : -1}
        />
      </div>

      <div className="canvas card">
        <h3>Array Visualization</h3>
        <div className="array-row">
          {arr.map((v, i) => {
            const isHighlighted = frames[cur] && frames[cur].highlight && frames[cur].highlight.includes(i);
            return (
              <div key={i} className={`array-cell ${isHighlighted ? "highlight" : ""}`}>
                <div className="value">{v}</div>
                <div className="index">{i}</div>
              </div>
            );
          })}
        </div>

        <div className="canvas-note">
          <small>Green highlight = current index / selected element in step</small>
        </div>
      </div>
    </div>
  );
}
