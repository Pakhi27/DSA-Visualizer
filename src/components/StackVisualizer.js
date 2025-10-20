import React, { useState, useRef, useEffect } from "react";
import PseudocodePanel from "../PseudocodePanel";
// 🧩 Component Role
// This component simulates and visually demonstrates Stack operations (push, pop, peek, isEmpty, isFull) and real-world stack-based algorithms (balanced parentheses, postfix evaluation, infix conversion, undo, palindrome check, next greater element, reverse).
// It does this by:
// Maintaining a stateful “stack” array that updates as the user interacts.
// Storing animation frames (frames[]) representing each step of execution.
// Re-rendering the visualization and pseudocode line highlights for each frame.
const maxSize = 10;
// useState, useRef, useEffect: React hooks for managing local component state, DOM references, and side effects.
// PseudocodePanel: custom component to display algorithm pseudocode.
// maxSize: defines stack capacity.

export default function StackVisualizer() {
  const [stack, setStack] = useState([1,2,3]);
  const [val, setVal] = useState("");
  const [useCase, setUseCase] = useState("none"); // none, parentheses, postfix, infix, undo, palindrome, nextgreater, reverse
  const [useCaseInput, setUseCaseInput] = useState("");
  const [frames, setFrames] = useState([]);
  const [cur, setCur] = useState(0);
  const intervalRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
//   Each piece of state controls a specific part of UI or logic:
// stack = visual + logical state of stack.
// val = input box content for push.
// useCase = which algorithm to run.
// frames = animation frames.
// cur = current frame index.
// playing = whether animation is running.
// message = text message displayed to user.
// Pseudo-code for operations
  const pushCode = [
    "if stack.length == maxSize: overflow",
    "stack.unshift(val)"
  ];

  const popCode = [
    "if stack.length == 0: underflow",
    "return stack.shift()"
  ];

  const peekCode = [
    "if stack.length == 0: return null",
    "return stack[0]"
  ];

  const isEmptyCode = [
    "return stack.length == 0"
  ];

  const isFullCode = [
    "return stack.length == maxSize"
  ];

  // Use case pseudo-code
  const parenthesesCode = [
    "for each char in string:",
    "  if '(': stack.push('(')",
    "  if ')': if stack.pop() != '(': mismatch",
    "if stack empty: balanced"
  ];

  const postfixCode = [
    "for each token in expression:",
    "  if number: stack.push(number)",
    "  if operator: pop two, apply op, push result",
    "return stack.pop()"
  ];

  const infixCode = [
    "for each token in infix:",
    "  if operand: output + push to stack",
    "  if '(': push to stack",
    "  if ')': pop until '(' to output",
    "  if operator: pop higher prec, push current",
    "pop remaining to output"
  ];

  const undoCode = [
    "push actions to stack",
    "to undo: pop from stack",
    "restore previous state"
  ];

  const palindromeCode = [
    "for first half of string: push chars to stack",
    "for second half: pop and compare with char"
  ];

  const nextGreaterCode = [
    "for each element in array:",
    "  while stack not empty and stack.top < current:",
    "    pop stack, set next greater",
    "  push current to stack"
  ];

  const reverseCode = [
    "for each element in input: push to stack",
    "while stack not empty: pop and append to result"
  ];
  
// Watches for playing becoming true.
// Starts interval every 650ms → increments cur frame.
// Stops when reaching last frame.
// Automatically clears interval on cleanup to prevent memory leaks.
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
   
// Runs whenever cur or frames change.
// Updates stack and message with current frame’s data.
// Causes React to re-render → DOM visually updates.
  useEffect(() => {
    if (frames[cur]) {
      setStack(frames[cur].stackSnapshot || stack);
      if (frames[cur].message) setMessage(frames[cur].message);
      else setMessage("");
    }
  }, [cur, frames]);
   
  // pushFrame() — adds a single frame (snapshot + metadata).
  const pushFrame = (stackSnapshot, highlight = [], line = -1, message = "") => {
    setFrames((prev) => [...prev, { stackSnapshot: [...stackSnapshot], highlight, line, message }]);
  };
   
  // runFrames() — sets up built frames and begins playback.
  const runFrames = (builtFrames) => {
    setFrames(builtFrames);
    setCur(0);
    setPlaying(true);
  };
   
// Stack Operations
// Each operation follows this pattern:
// Validate inputs.
// Build an array of frame objects.
// Update stack snapshot for each step.
// Call runFrames() to animate.

  const push = () => {
    if (stack.length >= maxSize) {
      setMessage("Stack full! Cannot push.");
      return;
    }
    const v = parseInt(val, 10);
    if (isNaN(v)) return setMessage("Enter numeric value.");
    const built = [];
    built.push({ stackSnapshot: stack, highlight: [], line: 0, message: `Pushing ${v}` });
    const newStack = [v, ...stack];
    built.push({ stackSnapshot: newStack, highlight: [0], line: 1, message: "Pushed" });
    runFrames(built);
    setVal("");
  };

  const pop = () => {
    if (stack.length === 0) {
      setMessage("Stack empty! Cannot pop.");
      return;
    }
    const built = [];
    built.push({ stackSnapshot: stack, highlight: [0], line: 0, message: "Popping top" });
    const newStack = stack.slice(1);
    built.push({ stackSnapshot: newStack, highlight: [], line: 1, message: "Popped" });
    runFrames(built);
  };

  const peek = () => {
    if (stack.length === 0) {
      setMessage("Stack empty! Cannot peek.");
      return;
    }
    const built = [];
    built.push({ stackSnapshot: stack, highlight: [0], line: 0, message: "Peeking top" });
    runFrames(built);
  };

  const checkEmpty = () => {
    const isEmpty = stack.length === 0;
    setMessage(`Is Empty: ${isEmpty}`);
    const built = [];
    built.push({ stackSnapshot: stack, highlight: [], line: 0, message: `Is Empty: ${isEmpty}` });
    runFrames(built);
  };

  const checkFull = () => {
    const isFull = stack.length === maxSize;
    setMessage(`Is Full: ${isFull}`);
    const built = [];
    built.push({ stackSnapshot: stack, highlight: [], line: 0, message: `Is Full: ${isFull}` });
    runFrames(built);
  };
  
// Use Case Handlers
// Each of these (handleParentheses, handlePostfix, etc.) simulates a classic algorithm and builds frames showing how the stack evolves.
// For example:
// Parentheses → pushes and pops parentheses, showing “Mismatch!” or “Balanced!”.
// Postfix → uses stack to compute expressions like 2 3 +.
// Infix → converts infix to postfix.
// Undo/Redo → simulates typing and undo actions.
// Palindrome → pushes half and compares while popping.
// Next Greater Element → stack-based array traversal.
// Reverse → pushes all elements then pops to reverse.

  const handleParentheses = () => {
    const input = useCaseInput;
    if (!input) return setMessage("Enter parentheses string.");
    const built = [];
    let tempStack = [];
    let line = 0;
    for (let char of input) {
      built.push({ stackSnapshot: tempStack, highlight: [], line: line, message: `Processing '${char}'` });
      if (char === '(') {
        tempStack = ['(', ...tempStack];
        built.push({ stackSnapshot: tempStack, highlight: [0], line: 1, message: "Pushed '('" });
      } else if (char === ')') {
        if (tempStack.length === 0 || tempStack[0] !== '(') {
          built.push({ stackSnapshot: tempStack, highlight: [], line: 2, message: "Mismatch!" });
          runFrames(built);
          return;
        }
        tempStack = tempStack.slice(1);
        built.push({ stackSnapshot: tempStack, highlight: [], line: 2, message: "Popped '('" });
      }
      line = 3;
    }
    const balanced = tempStack.length === 0;
    built.push({ stackSnapshot: tempStack, highlight: [], line: 3, message: balanced ? "Balanced!" : "Not balanced" });
    runFrames(built);
  };

  const handlePostfix = () => {
    const input = useCaseInput.split(' ');
    if (!input) return setMessage("Enter postfix expression e.g. 2 3 +");
    const built = [];
    let tempStack = [];
    let line = 0;
    for (let token of input) {
      built.push({ stackSnapshot: tempStack, highlight: [], line: line, message: `Processing '${token}'` });
      if (!isNaN(token)) {
        tempStack = [parseInt(token), ...tempStack];
        built.push({ stackSnapshot: tempStack, highlight: [0], line: 1, message: `Pushed ${token}` });
      } else {
        if (tempStack.length < 2) {
          built.push({ stackSnapshot: tempStack, highlight: [], line: 2, message: "Invalid expression" });
          runFrames(built);
          return;
        }
        const b = tempStack[0];
        const a = tempStack[1];
        let result;
        switch (token) {
          case '+': result = a + b; break;
          case '-': result = a - b; break;
          case '*': result = a * b; break;
          case '/': result = a / b; break;
          default: result = 0;
        }
        tempStack = [result, ...tempStack.slice(2)];
        built.push({ stackSnapshot: tempStack, highlight: [0], line: 2, message: `Applied ${token}: ${result}` });
      }
      line = 3;
    }
    if (tempStack.length === 1) {
      built.push({ stackSnapshot: tempStack, highlight: [0], line: 3, message: `Result: ${tempStack[0]}` });
    } else {
      built.push({ stackSnapshot: tempStack, highlight: [], line: 3, message: "Invalid expression" });
    }
    runFrames(built);
  };
   
//  handlePlayPause, handleStepForward, handleStepBack manage animation manually.
// They interact with the cur index and playing flag to move between frames.

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

  const handleInfix = () => {
    const input = useCaseInput.replace(/\s/g, '');
    if (!input) return setMessage("Enter infix expression e.g. 2+3*4");
    const built = [];
    let tempStack = [];
    let output = [];
    let line = 0;
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    for (let char of input) {
      built.push({ stackSnapshot: tempStack, highlight: [], line: line, message: `Processing '${char}'` });
      if (!isNaN(char)) {
        output.push(char);
        built.push({ stackSnapshot: tempStack, highlight: [], line: 1, message: `Output: ${output.join('')}` });
      } else if (char === '(') {
        tempStack = ['(', ...tempStack];
        built.push({ stackSnapshot: tempStack, highlight: [0], line: 2, message: "Pushed '('" });
      } else if (char === ')') {
        while (tempStack.length > 0 && tempStack[0] !== '(') {
          const op = tempStack[0];
          tempStack = tempStack.slice(1);
          output.push(op);
          built.push({ stackSnapshot: tempStack, highlight: [], line: 3, message: `Output: ${output.join('')}` });
        }
        if (tempStack[0] === '(') tempStack = tempStack.slice(1);
        built.push({ stackSnapshot: tempStack, highlight: [], line: 3, message: "Popped '('" });
      } else {
        while (tempStack.length > 0 && precedence[tempStack[0]] >= precedence[char]) {
          const op = tempStack[0];
          tempStack = tempStack.slice(1);
          output.push(op);
          built.push({ stackSnapshot: tempStack, highlight: [], line: 4, message: `Output: ${output.join('')}` });
        }
        tempStack = [char, ...tempStack];
        built.push({ stackSnapshot: tempStack, highlight: [0], line: 4, message: `Pushed ${char}` });
      }
      line = 5;
    }
    while (tempStack.length > 0) {
      const op = tempStack[0];
      tempStack = tempStack.slice(1);
      output.push(op);
      built.push({ stackSnapshot: tempStack, highlight: [], line: 5, message: `Output: ${output.join('')}` });
    }
    built.push({ stackSnapshot: tempStack, highlight: [], line: 5, message: `Postfix: ${output.join('')}` });
    runFrames(built);
  };

  const handleUndo = () => {
    const input = useCaseInput;
    if (!input) return setMessage("Enter text to simulate undo/redo");
    const built = [];
    let tempStack = [];
    let currentText = "";
    for (let char of input) {
      currentText += char;
      tempStack = [currentText, ...tempStack];
      built.push({ stackSnapshot: tempStack, highlight: [0], line: 0, message: `Typed: ${currentText}` });
    }
    // Simulate undo
    if (tempStack.length > 0) {
      tempStack = tempStack.slice(1);
      currentText = tempStack.length > 0 ? tempStack[0] : "";
      built.push({ stackSnapshot: tempStack, highlight: [], line: 1, message: `Undo: ${currentText}` });
    }
    runFrames(built);
  };

  const handlePalindrome = () => {
    const input = useCaseInput.replace(/\s/g, '').toLowerCase();
    if (!input) return setMessage("Enter string to check palindrome");
    const built = [];
    let tempStack = [];
    const len = input.length;
    const mid = Math.floor(len / 2);
    let line = 0;
    for (let i = 0; i < mid; i++) {
      tempStack = [input[i], ...tempStack];
      built.push({ stackSnapshot: tempStack, highlight: [0], line: line, message: `Pushed '${input[i]}'` });
      line = 1;
    }
    let isPal = true;
    for (let i = mid + (len % 2); i < len; i++) {
      const top = tempStack[0];
      tempStack = tempStack.slice(1);
      built.push({ stackSnapshot: tempStack, highlight: [], line: line, message: `Comparing '${top}' with '${input[i]}'` });
      if (top !== input[i]) {
        isPal = false;
        built.push({ stackSnapshot: tempStack, highlight: [], line: 1, message: "Not a palindrome" });
        runFrames(built);
        return;
      }
      line = 1;
    }
    built.push({ stackSnapshot: tempStack, highlight: [], line: 1, message: "Palindrome!" });
    runFrames(built);
  };

  const handleNextGreater = () => {
    const input = useCaseInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (input.length === 0) return setMessage("Enter array e.g. 4,5,2,25");
    const built = [];
    let tempStack = [];
    const result = new Array(input.length).fill(-1);
    let line = 0;
    for (let i = 0; i < input.length; i++) {
      built.push({ stackSnapshot: tempStack, highlight: [], line: line, message: `Processing ${input[i]}` });
      while (tempStack.length > 0 && input[tempStack[0]] < input[i]) {
        const idx = tempStack[0];
        tempStack = tempStack.slice(1);
        result[idx] = input[i];
        built.push({ stackSnapshot: tempStack, highlight: [], line: 1, message: `Next greater for ${input[idx]} is ${input[i]}` });
      }
      tempStack = [i, ...tempStack];
      built.push({ stackSnapshot: tempStack, highlight: [0], line: 2, message: `Pushed index ${i}` });
      line = 3;
    }
    built.push({ stackSnapshot: tempStack, highlight: [], line: 3, message: `Result: [${result.join(', ')}]` });
    runFrames(built);
  };

  const handleReverse = () => {
    const input = useCaseInput;
    if (!input) return setMessage("Enter string or array e.g. hello or 1,2,3");
    const isArray = input.includes(',');
    const elements = isArray ? input.split(',').map(s => s.trim()) : input.split('');
    const built = [];
    let tempStack = [];
    let line = 0;
    for (let el of elements) {
      tempStack = [el, ...tempStack];
      built.push({ stackSnapshot: tempStack, highlight: [0], line: line, message: `Pushed '${el}'` });
      line = 1;
    }
    let reversed = [];
    while (tempStack.length > 0) {
      const el = tempStack[0];
      tempStack = tempStack.slice(1);
      reversed.push(el);
      built.push({ stackSnapshot: tempStack, highlight: [], line: line, message: `Popped '${el}'` });
    }
    built.push({ stackSnapshot: tempStack, highlight: [], line: 1, message: `Reversed: ${reversed.join(isArray ? ', ' : '')}` });
    runFrames(built);
  };
  
  // Dynamically select correct pseudocode and complexity metrics depending on current use case and frame.
  const getCodeLines = () => {
    if (frames[cur] && frames[cur].line >= 0) {
      switch (useCase) {
        case 'parentheses': return parenthesesCode;
        case 'postfix': return postfixCode;
        case 'infix': return infixCode;
        case 'undo': return undoCode;
        case 'palindrome': return palindromeCode;
        case 'nextgreater': return nextGreaterCode;
        case 'reverse': return reverseCode;
        default:
          if (frames[cur].line <= 1) return pushCode;
          if (frames[cur].line <= 1) return popCode;
          if (frames[cur].line <= 1) return peekCode;
          if (frames[cur].line <= 1) return isEmptyCode;
          return isFullCode;
      }
    }
    return [];
  };

  const getComplexity = () => {
    if (useCase === 'none') {
      // Basic stack operations
      return 'Time: O(1), Space: O(1)';
    }
    // Use cases are generally O(n)
    switch (useCase) {
      case 'parentheses':
      case 'postfix':
      case 'infix':
      case 'palindrome':
      case 'nextgreater':
      case 'reverse':
        return 'Time: O(n), Space: O(n)';
      case 'undo':
        return 'Time: O(1) per operation, Space: O(n)';
      default:
        return '';
    }
  };
  
//   🧩 UI Composition (JSX)
// Left Panel: Stack Controls, Use Case selector, Input, Play controls, PseudocodePanel.
// Right Panel: Stack visualization.

  return (
    <div className="visualizer-container">
      <div className="left-panel">
        <div className="controls card">
          <h3>Stack Controls</h3>
          <div className="row small">
            <input value={val} onChange={(e)=>setVal(e.target.value)} placeholder="value to push" />
            <button onClick={push}>Push</button>
            <button onClick={pop} disabled={stack.length === 0}>Pop</button>
            <button onClick={peek} disabled={stack.length === 0}>Peek</button>
          </div>
          <div className="row small">
            <button onClick={checkEmpty}>Is Empty</button>
            <button onClick={checkFull}>Is Full</button>
          </div>
          <div className="row">
            <select value={useCase} onChange={(e)=>setUseCase(e.target.value)}>
              <option value="none">No Use Case</option>
              <option value="parentheses">Balanced Parentheses</option>
              <option value="postfix">Postfix Evaluation</option>
              <option value="infix">Infix to Postfix</option>
              <option value="undo">Undo/Redo</option>
              <option value="palindrome">Palindrome Check</option>
              <option value="nextgreater">Next Greater Element</option>
              <option value="reverse">Reverse String/Array</option>
            </select>
            <input value={useCaseInput} onChange={(e)=>setUseCaseInput(e.target.value)} placeholder={
              useCase === 'parentheses' ? "e.g. ()(())" :
              useCase === 'postfix' ? "e.g. 2 3 +" :
              useCase === 'infix' ? "e.g. 2+3*4" :
              useCase === 'undo' ? "e.g. type text" :
              useCase === 'palindrome' ? "e.g. radar" :
              useCase === 'nextgreater' ? "e.g. 4,5,2,25" :
              useCase === 'reverse' ? "e.g. hello or 1,2,3" : "input"
            } />
            <button onClick={
              useCase === 'parentheses' ? handleParentheses :
              useCase === 'postfix' ? handlePostfix :
              useCase === 'infix' ? handleInfix :
              useCase === 'undo' ? handleUndo :
              useCase === 'palindrome' ? handlePalindrome :
              useCase === 'nextgreater' ? handleNextGreater :
              useCase === 'reverse' ? handleReverse : null
            } disabled={useCase === "none"}>Run</button>
          </div>
          <div className="play-controls">
            <button onClick={handleStepBack}>◀</button>
            <button onClick={handlePlayPause}>{playing ? "Pause" : "Play"}</button>
            <button onClick={handleStepForward}>▶</button>
            <span className="frame-info">{frames.length ? `${cur+1}/${frames.length}` : "0/0"}</span>
          </div>
          <p className="info">Applications: function call stack, undo operations</p>
          <div className="message">{message}</div>
        </div>

        <PseudocodePanel
          codeLines={getCodeLines()}
          highlight={frames[cur] ? frames[cur].line : -1}
        />
      </div>
      <div className="canvas card">
        <h3>Stack Visualization (Top at left)</h3>
        <div className="stack">
          <div className="pointer-label">Top</div>
          {stack.map((v, idx) => {
            const isHighlighted = frames[cur] && frames[cur].highlight && frames[cur].highlight.includes(idx);
            let cellClass = `stack-cell ${isHighlighted ? "highlight" : ""}`;
            // Changes color when part of highlight[] (from the frame).
            return (
              <div key={idx} className={cellClass}>{v}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
