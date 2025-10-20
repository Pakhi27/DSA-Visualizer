import React, { useState, useRef, useEffect } from "react";
import PseudocodePanel from "../PseudocodePanel";

const maxSize = 10;
// Animation Flow (frames + cur + DOM)
// Just like your StackVisualizer:
// Each operation (enqueue, dequeue, etc.) creates a list of frames using createSnapshot().
// Each frame stores:
// q: snapshot of the queue at that step
// front, rear: pointers
// highlight: index to visually emphasize
// line: pseudocode line number
// message: action description
// runFrames() sets these frames and starts playback.
// useEffect() (watching playing) uses setInterval() to move cur forward every 650ms.
// → React re-renders → updated queue visualization.
// useEffect() (watching cur) updates queue + pointers from current frame snapshot.
// So React automatically re-renders DOM at every frame — animating your queue changes.

// React re-renders queue visualization when:
// q, front, rear, or frames[cur] change.
// It doesn’t repaint the whole DOM — only diffs the virtual DOM to update affected cells.

export default function QueueVisualizer() {
  const [q, setQ] = useState([4, 5, 6]);
  const [val, setVal] = useState("");
  const [queueType, setQueueType] = useState("linear"); // linear, circular, deque, priority
  const [enqueuePriority, setEnqueuePriority] = useState("");
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(3); // for initial [4,5,6], rear = 3 (points after last)
  const [frames, setFrames] = useState([]);
  const [cur, setCur] = useState(0);
  const intervalRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFrames([]);
    setCur(0);
    setPlaying(false);
    if (queueType === "circular") {
      const newQ = new Array(maxSize).fill(null);
      setQ(newQ);
      setFront(0);
      setRear(0);
    } else if (queueType === "priority") {
      setQ([]);
      setFront(0);
      setRear(0);
    } else if (queueType === "deque") {
      setQ([4, 5, 6]);
      setFront(0);
      setRear(3);
    } else { // linear
      setQ([4, 5, 6]);
      setFront(0);
      setRear(3);
    }
  }, [queueType]);

  // Pseudo-code for operations
  const enqueueCode = [
    "if isFull(): overflow",
    "insert at rear"
  ];

  const dequeueCode = [
    "if isEmpty(): underflow",
    "remove from front"
  ];

  const peekCode = [
    "if isEmpty(): return null",
    "return front element"
  ];

  const isEmptyCode = [
    "return front == rear (circular) or length == 0"
  ];

  const isFullCode = [
    "return (rear + 1) % maxSize == front (circular) or length == maxSize"
  ];

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

  useEffect(() => {
    if (frames[cur]) {
      setQ(frames[cur].q);
      setFront(frames[cur].front);
      setRear(frames[cur].rear);
      setMessage(frames[cur].message || "");
    }
  }, [cur, frames]);

  const isEmpty = () => {
    if (queueType === "circular") return front === rear;
    return q.length === 0;
  };

  const isFull = () => {
    if (queueType === "circular") return (rear + 1) % maxSize === front;
    if (queueType === "priority") return false;
    return q.length >= maxSize; // linear and deque limited
  };

  const runFrames = (builtFrames) => {
    setFrames(builtFrames);
    setCur(0);
    setPlaying(true);
  };

  const createSnapshot = (currentQ, currentFront, currentRear, highlight, line, msg) => {
    return { q: [...currentQ], front: currentFront, rear: currentRear, highlight, line, message: msg };
  };

  const enqueue = () => {
    if (isFull()) {
      setMessage("Queue full! Cannot enqueue.");
      return;
    }
    const v = parseInt(val, 10);
    if (isNaN(v)) return setMessage("Enter numeric value.");
    const built = [];
    let newQ = [...q];
    let newFront = front;
    let newRear = rear;
    let highlightIndex;
    if (queueType === "priority") {
      const p = parseInt(enqueuePriority, 10);
      if (isNaN(p)) return setMessage("Enter priority value.");
      const newItem = { value: v, priority: p };
      let pos = q.length;
      for (let i = 0; i < q.length; i++) {
        if (p > q[i].priority) {
          pos = i;
          break;
        }
      }
      newQ = [...q.slice(0, pos), newItem, ...q.slice(pos)];
      newRear = newQ.length;
      highlightIndex = pos;
      built.push(createSnapshot(q, front, rear, [], 0, `Enqueuing ${v} with priority ${p}`));
    } else if (queueType === "circular") {
      const oldRear = rear;
      newQ[oldRear] = v;
      newRear = (oldRear + 1) % maxSize;
      highlightIndex = oldRear;
      built.push(createSnapshot(q, front, rear, [oldRear], 0, `Enqueuing ${v} at rear ${oldRear}`));
    } else { // linear or deque (enqueue rear)
      newQ = [...q, v];
      newRear = newQ.length;
      highlightIndex = newQ.length - 1;
      built.push(createSnapshot(q, front, rear, [], 0, `Enqueuing ${v} at rear`));
    }
    built.push(createSnapshot(newQ, newFront, newRear, [highlightIndex], 1, "Enqueued"));
    runFrames(built);
    setVal("");
    if (queueType === "priority") setEnqueuePriority("");
  };

  const dequeue = () => {
    if (isEmpty()) {
      setMessage("Queue empty! Cannot dequeue.");
      return;
    }
    const built = [];
    let newQ = [...q];
    let newFront = front;
    let newRear = rear;
    let highlightIndex;
    let dequeuedValue;
    if (queueType === "circular") {
      highlightIndex = front;
      dequeuedValue = q[front];
      newQ[front] = null;
      newFront = (front + 1) % maxSize;
      built.push(createSnapshot(q, front, rear, [highlightIndex], 0, `Dequeuing ${dequeuedValue} from front ${front}`));
      built.push(createSnapshot(newQ, newFront, newRear, [], 1, "Dequeued"));
    } else {
      highlightIndex = 0;
      dequeuedValue = queueType === "priority" ? q[0].value : q[0];
      newQ = q.slice(1);
      newRear = newQ.length;
      built.push(createSnapshot(q, front, rear, [highlightIndex], 0, `Dequeuing ${dequeuedValue} from front`));
      built.push(createSnapshot(newQ, 0, newRear, [], 1, "Dequeued"));
    }
    runFrames(built);
  };

  const peek = () => {
    if (isEmpty()) {
      setMessage("Queue empty! Cannot peek.");
      return;
    }
    const frontIndex = queueType === "circular" ? front : 0;
    const frontValue = queueType === "priority" && q[frontIndex] ? q[frontIndex].value : (q[frontIndex] || "empty");
    const built = [createSnapshot(q, front, rear, [frontIndex], 0, `Peeking front: ${frontValue}`)];
    runFrames(built);
  };

  const checkEmpty = () => {
    const isEmptyCheck = isEmpty();
    const built = [createSnapshot(q, front, rear, [], 0, `Is Empty: ${isEmptyCheck}`)];
    runFrames(built);
  };

  const checkFull = () => {
    const isFullCheck = isFull();
    const built = [createSnapshot(q, front, rear, [], 0, `Is Full: ${isFullCheck}`)];
    runFrames(built);
  };

  const enqueueFront = () => {
    if (isFull()) {
      setMessage("Queue full! Cannot enqueue.");
      return;
    }
    const v = parseInt(val, 10);
    if (isNaN(v)) return setMessage("Enter numeric value.");
    const built = [];
    const newQ = [v, ...q];
    const highlightIndex = 0;
    built.push(createSnapshot(q, front, rear, [], 0, `Enqueuing ${v} at front`));
    built.push(createSnapshot(newQ, 0, newQ.length, [highlightIndex], 1, "Enqueued"));
    runFrames(built);
    setVal("");
  };

  const enqueueRear = () => {
    enqueue(); // Reuse enqueue for rear in deque
  };

  const dequeueFront = () => {
    dequeue(); // Reuse dequeue for front in deque
  };

  const dequeueRear = () => {
    if (isEmpty()) {
      setMessage("Queue empty! Cannot dequeue.");
      return;
    }
    const built = [];
    const highlightIndex = q.length - 1;
    const dequeuedValue = queueType === "priority" ? q[highlightIndex].value : q[highlightIndex];
    const newQ = q.slice(0, -1);
    built.push(createSnapshot(q, front, rear, [highlightIndex], 0, `Dequeuing ${dequeuedValue} from rear`));
    built.push(createSnapshot(newQ, front, newQ.length, [], 1, "Dequeued"));
    runFrames(built);
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

  const getCodeLines = () => {
    if (!frames[cur] || frames[cur].line < 0) return [];
    const msg = frames[cur].message.toLowerCase();
    if (msg.includes("enque")) return enqueueCode;
    if (msg.includes("dequeue")) return dequeueCode;
    if (msg.includes("peeking")) return peekCode;
    if (msg.includes("empty")) return isEmptyCode;
    if (msg.includes("full")) return isFullCode;
    return [];
  };

  const getComplexity = () => {
    if (queueType === 'linear' || queueType === 'circular' || queueType === 'deque') {
      return 'Time: O(1), Space: O(1)';
    }
    if (queueType === 'priority') {
      return 'Time: O(n) enqueue, O(1) dequeue, Space: O(n)';
    }
    return '';
  };

  const getDisplayValue = (v) => {
    if (v === null || v === undefined) return "";
    if (queueType === "priority" && typeof v === "object") return v.value;
    return v;
  };

  const displayArray = queueType === "circular" ? Array.from({ length: maxSize }, (_, i) => q[i] || "") : q;
  
// JSX (Return Block)
// UI split into two main panels:
// Left Panel: Controls, input fields, pseudocode, messages, playback buttons.
// Right Panel: Visualization grid of queue cells + pointer labels.
  return (
    <div className="visualizer-container">
      <div className="left-panel">
        <div className="controls card">
          <h3>Queue Controls</h3>
          <div className="row">
            <select value={queueType} onChange={(e) => setQueueType(e.target.value)}>
              <option value="linear">Linear Queue</option>
              <option value="circular">Circular Queue</option>
              <option value="deque">Deque</option>
              <option value="priority">Priority Queue</option>
            </select>
          </div>
          <div className="row small">
            <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="value to enqueue" />
            {queueType === "priority" && (
              <input
                value={enqueuePriority}
                onChange={(e) => setEnqueuePriority(e.target.value)}
                placeholder="priority"
                style={{ width: "60px" }}
              />
            )}
            {queueType === "linear" || queueType === "circular" ? (
              <button onClick={enqueue}>Enqueue Rear</button>
            ) : queueType === "deque" ? (
              <>
                <button onClick={enqueueFront}>Enqueue Front</button>
                <button onClick={enqueueRear}>Enqueue Rear</button>
              </>
            ) : (
              <button onClick={enqueue}>Enqueue</button>
            )}
            {queueType === "linear" || queueType === "circular" ? (
              <button onClick={dequeue} disabled={isEmpty()}>Dequeue Front</button>
            ) : queueType === "deque" ? (
              <>
                <button onClick={dequeueFront} disabled={isEmpty()}>Dequeue Front</button>
                <button onClick={dequeueRear} disabled={isEmpty()}>Dequeue Rear</button>
              </>
            ) : (
              <button onClick={dequeue} disabled={isEmpty()}>Dequeue Front</button>
            )}
            <button onClick={peek} disabled={isEmpty()}>Peek Front</button>
          </div>
          <div className="row small">
            <button onClick={checkEmpty}>Is Empty</button>
            <button onClick={checkFull}>Is Full</button>
          </div>
          <div className="play-controls">
            <button onClick={handleStepBack}>◀</button>
            <button onClick={handlePlayPause}>{playing ? "Pause" : "Play"}</button>
            <button onClick={handleStepForward}>▶</button>
            <span className="frame-info">{frames.length ? `${cur + 1}/${frames.length}` : "0/0"}</span>
          </div>
          <p className="info">Select queue type to visualize different implementations.</p>
          <div className="message">{message}</div>
        </div>

        <PseudocodePanel
          codeLines={getCodeLines()}
          highlight={frames[cur] ? frames[cur].line : -1}
        />
      </div>
      <div className="canvas card">
        <h3>Queue Visualization (front → left)</h3>
        <div className="queue-container">
          <div className="pointer-label front">Front: {front}</div>
          {/* Highlighting occurs when that cell index is in the highlight array for the current frame. */}
          <div className="queue-row">
            {displayArray.map((v, i) => {
              const isHighlighted = frames[cur] && frames[cur].highlight && frames[cur].highlight.includes(i);
              const cellClass = `queue-cell ${isHighlighted ? "highlight" : ""}`;
              const displayValue = getDisplayValue(v);
              return (
                <div key={i} className={cellClass}>
                  {displayValue}
                </div>
              );
            })}
          </div>
          <div className="pointer-label rear">Rear: {rear}</div>
        </div>
      </div>
    </div>
  );
}
