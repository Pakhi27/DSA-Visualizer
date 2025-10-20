import React, { useState, useRef, useEffect } from "react";
import PseudocodePanel from "../PseudocodePanel";
// Imports React and hooks (useState, useRef, useEffect) for managing UI state and animations.
// PseudocodePanel displays pseudocode with highlighted current lines.

//  How Animation Works Visually
// Each operation builds an array of frames.
// Each frame tells React:
// which characters to highlight (highlight),
// what text to show (message),
// which pseudocode line to highlight (line).
// Then useEffect + setInterval gradually increase cur, making React re-render the DOM with updated highlights — creating an illusion of animation 🎬.
const defaultString = "hello";
const maxLength = 20;

function cloneStr(s) { return s; }

export default function StringVisualizer() {
  const [primaryStr, setPrimaryStr] = useState(defaultString);
  const [secondaryStr, setSecondaryStr] = useState("world");
  const [startIdx, setStartIdx] = useState("");
  const [endIdx, setEndIdx] = useState("");
  const [pattern, setPattern] = useState("");
  const [selectedOp, setSelectedOp] = useState("traversal");
  const [frames, setFrames] = useState([]); // frames = [{str, highlight:[i], line, message}]
  const [cur, setCur] = useState(0);
  const intervalRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");

//   // Pseudocode for operations
//   Each array stores pseudocode lines for corresponding operation.
// Later, the current line will be highlighted during animation.
  const traversalCode = [
    "length = 0",
    "for each char in string:",
    "  length += 1",
    "return length"
  ];

  const reverseCode = [
    "left = 0, right = length-1",
    "while left < right:",
    "  swap str[left] and str[right]",
    "  left++, right--"
  ];

  const substringCode = [
    "if start < 0 or end > length: error",
    "return str[start:end+1]"
  ];

  const concatCode = [
    "result = primary + secondary",
    "return result"
  ];

  const palindromeCode = [
    "left = 0, right = length-1",
    "while left < right:",
    "  if str[left] != str[right]: return false",
    "  left++, right--",
    "return true"
  ];

  const anagramCode = [
    "sort primary and secondary",
    "if sorted1 == sorted2: true else false"
  ];

  const naivePatternCode = [
    "for i from 0 to n-m:",
    "  match = true",
    "  for j from 0 to m-1:",
    "    if str[i+j] != pat[j]: match=false",
    "  if match: found at i"
  ];

  const kmpCode = [
    "build prefix table for pattern",
    "i=0, j=0",
    "while i < n:",
    "  if pat[j] == str[i]: i++, j++",
    "  if j == m: found at i-j, j=pi[j-1]",
    "  else if j > 0: j = pi[j-1]",
    "  else: i++"
  ];

  const lcsCode = [
    "dp = matrix(m+1, n+1)",
    "for i 1 to m:",
    "  for j 1 to n:",
    "    if s1[i-1]==s2[j-1]: dp[i][j]=dp[i-1][j-1]+1",
    "    else: dp[i][j]=max(dp[i-1][j], dp[i][j-1])",
    "return dp[m][n]"
  ];

  const compressionCode = [
    "result = ''",
    "count = 1",
    "for i 1 to length:",
    "  if str[i] == str[i-1]: count++",
    "  else: result += str[i-1] + count, count=1",
    "result += str[length-1] + count",
    "return result"
  ];

  const freqCode = [
    "map = empty hashmap",
    "for each char in string:",
    "  map[char] = map[char] + 1 or 1",
    "return map"
  ];
  
  // Chooses which pseudocode to display based on the selected operation and highlights the current line.
  const getCodeLines = () => {
    if (!frames[cur] || frames[cur].line < 0) return [];
    switch (selectedOp) {
      case 'traversal': return traversalCode;
      case 'reverse': return reverseCode;
      case 'substring': return substringCode;
      case 'concat': return concatCode;
      case 'palindrome': return palindromeCode;
      case 'anagram': return anagramCode;
      case 'naive': return naivePatternCode;
      case 'kmp': return kmpCode;
      case 'lcs': return lcsCode;
      case 'compression': return compressionCode;
      case 'freq': return freqCode;
      default: return [];
    }
  };
  // Returns the time and space complexity for the selected algorithm.
  const getComplexity = () => {
    switch (selectedOp) {
      case 'traversal':
      case 'reverse':
      case 'palindrome':
      case 'compression':
      case 'freq':
        return 'Time: O(n), Space: O(1)';
      case 'substring':
        return 'Time: O(n), Space: O(n)';
      case 'concat':
        return 'Time: O(n + m), Space: O(n + m)';
      case 'anagram':
        return 'Time: O(n log n), Space: O(n)';
      case 'naive':
        return 'Time: O(n * m), Space: O(1)';
      case 'kmp':
        return 'Time: O(n + m), Space: O(m)';
      case 'lcs':
        return 'Time: O(n * m), Space: O(n * m)';
      default: return '';
    }
  };
// When playing = true, the current frame (cur) increases every 800ms.
// Once end is reached, animation stops.
// Cleanup with clearInterval() to avoid leaks.

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
  
// Whenever current frame changes, update:
// the visible string (primaryStr),
// and the message shown under controls.

  useEffect(() => {
    if (frames[cur]) {
      setPrimaryStr(frames[cur].strSnapshot || primaryStr);
      if (frames[cur].message) setMessage(frames[cur].message);
      else setMessage("");
    }
  }, [cur, frames]);
   
  // Creates a frame showing one step of the algorithm.
  const pushFrame = (strSnapshot, highlight = [], line = -1, message = "") => {
    setFrames((prev) => [...prev, { strSnapshot: cloneStr(strSnapshot), highlight, line, message }]);
  };
  
  // fter constructing frames for an operation, start animation.
  const runFrames = (builtFrames) => {
    setFrames(builtFrames);
    setCur(0);
    setPlaying(true);
  };
  
  // handleSetPrimary() and handleSetSecondary() validate input lengths and reset frames.
  const handleSetPrimary = () => {
    if (primaryStr.length > maxLength) {
      setMessage("String too long!");
      return;
    }
    setFrames([]);
    setCur(0);
    setMessage("");
  };

  const handleSetSecondary = () => {
    if (secondaryStr.length > maxLength) {
      setMessage("String too long!");
      return;
    }
    setFrames([]);
    setCur(0);
    setMessage("");
  };

  // 1. Traversal & Length
  const traversalLength = () => {
    const built = [];
    let idx = 0;
    built.push({ strSnapshot: primaryStr, highlight: [], line: 0, message: `Length: ${primaryStr.length}` });
    for (let i = 0; i < primaryStr.length; i++) {
      built.push({ strSnapshot: primaryStr, highlight: [i], line: 1, message: `Visiting char ${primaryStr[i]} at ${i}` });
      idx = i;
    }
    built.push({ strSnapshot: primaryStr, highlight: [], line: 3, message: `Total length: ${primaryStr.length}` });
    runFrames(built);
  };

  // 2. Reverse
  const reverseStr = () => {
    let working = primaryStr.split('');
    const built = [];
    let left = 0, right = working.length - 1;
    built.push({ strSnapshot: primaryStr, highlight: [left, right], line: 0, message: "Starting reverse" });
    while (left < right) {
      built.push({ strSnapshot: primaryStr, highlight: [left, right], line: 1, message: `Swap ${working[left]} and ${working[right]}` });
      [working[left], working[right]] = [working[right], working[left]];
      const newStr = working.join('');
      built.push({ strSnapshot: newStr, highlight: [left, right], line: 2, message: "Swapped" });
      left++;
      right--;
    }
    built.push({ strSnapshot: working.join(''), highlight: [], line: -1, message: "Reversed string" });
    runFrames(built);
  };

  // 3. Substring Extraction
  const extractSubstring = () => {
    let s = parseInt(startIdx);
    let e = parseInt(endIdx);
    if (isNaN(s) || isNaN(e) || s < 0 || e >= primaryStr.length || s > e) {
      setMessage("Invalid indices!");
      return;
    }
    const built = [];
    const sub = primaryStr.substring(s, e + 1);
    built.push({ strSnapshot: primaryStr, highlight: Array.from({length: primaryStr.length}, (_, i) => i >= s && i <= e ? i : -1).filter(i => i >= 0), line: 0, message: `Extracting from ${s} to ${e}` });
    built.push({ strSnapshot: sub, highlight: [], line: 1, message: `Substring: "${sub}"` });
    runFrames(built);
  };

  // 4. Concatenation
  const concatenate = () => {
    const result = primaryStr + secondaryStr;
    const built = [];
    built.push({ strSnapshot: primaryStr, highlight: [], line: 0, message: `Concatenating "${primaryStr}" + "${secondaryStr}"` });
    built.push({ strSnapshot: result, highlight: [primaryStr.length - 1, primaryStr.length], line: 1, message: `Result: "${result}"` });
    runFrames(built);
  };

  // 5. Palindrome Check
  const checkPalindrome = () => {
    let working = primaryStr.split('');
    const built = [];
    let left = 0, right = working.length - 1;
    let isPal = true;
    built.push({ strSnapshot: primaryStr, highlight: [left, right], line: 0, message: "Checking palindrome" });
    while (left < right) {
      built.push({ strSnapshot: primaryStr, highlight: [left, right], line: 1, message: `Compare ${working[left]} and ${working[right]}` });
      if (working[left] !== working[right]) {
        isPal = false;
        built.push({ strSnapshot: primaryStr, highlight: [left, right], line: 2, message: "Not equal! Not palindrome" });
        runFrames(built);
        return;
      }
      built.push({ strSnapshot: primaryStr, highlight: [left, right], line: 3, message: "Equal, continue" });
      left++;
      right--;
    }
    built.push({ strSnapshot: primaryStr, highlight: [], line: 4, message: `Is palindrome: ${isPal}` });
    runFrames(built);
  };

  // 6. Anagram Check
  const checkAnagram = () => {
    if (primaryStr.length !== secondaryStr.length) {
      setMessage("Different lengths, not anagram");
      return;
    }
    const sorted1 = primaryStr.split('').sort().join('');
    const sorted2 = secondaryStr.split('').sort().join('');
    const built = [];
    built.push({ strSnapshot: primaryStr, highlight: [], line: 0, message: `Sorting "${primaryStr}"` });
    built.push({ strSnapshot: sorted1, highlight: [], line: 0, message: `Sorted: "${sorted1}"` });
    built.push({ strSnapshot: secondaryStr, highlight: [], line: 0, message: `Sorting "${secondaryStr}"` });
    built.push({ strSnapshot: sorted2, highlight: [], line: 0, message: `Sorted: "${sorted2}"` });
    const isAnag = sorted1 === sorted2;
    built.push({ strSnapshot: primaryStr, highlight: [], line: 1, message: `Is anagram: ${isAnag}` });
    runFrames(built);
  };

  // 7. Pattern Matching Naive
  const naivePatternMatch = () => {
    const n = primaryStr.length;
    const m = pattern.length;
    if (m === 0) {
      setMessage("Empty pattern!");
      return;
    }
    const built = [];
    let found = [];
    for (let i = 0; i <= n - m; i++) {
      let match = true;
      built.push({ strSnapshot: primaryStr, highlight: [i], line: 0, message: `Trying start at ${i}` });
      for (let j = 0; j < m; j++) {
        built.push({ strSnapshot: primaryStr, highlight: [i + j], line: 1, message: `Compare ${primaryStr[i+j]} == ${pattern[j]}` });
        if (primaryStr[i + j] !== pattern[j]) {
          match = false;
          built.push({ strSnapshot: primaryStr, highlight: [i + j], line: 2, message: "Mismatch" });
          break;
        }
      }
      if (match) {
        found.push(i);
        built.push({ strSnapshot: primaryStr, highlight: Array.from({length: m}, (_, k) => i + k), line: 3, message: `Match at ${i}` });
      }
    }
    built.push({ strSnapshot: primaryStr, highlight: [], line: -1, message: `Found at: ${found.join(', ') || 'none'}` });
    runFrames(built);
  };

  // 8. KMP Algorithm (simplified animation)
  const kmpPatternMatch = () => {
    const n = primaryStr.length;
    const m = pattern.length;
    if (m === 0) {
      setMessage("Empty pattern!");
      return;
    }
    // Build prefix table
    const pi = new Array(m).fill(0);
    let k = 0;
    for (let q = 1; q < m; q++) {
      while (k > 0 && pattern[k] !== pattern[q]) {
        k = pi[k - 1];
      }
      if (pattern[k] === pattern[q]) {
        k++;
      }
      pi[q] = k;
    }
    const built = [];
    built.push({ strSnapshot: pattern, highlight: [], line: 0, message: "Building prefix table" });
    // Show pi
    built.push({ strSnapshot: pattern, highlight: [], line: -1, message: `Prefix table: ${pi.join(' ')}` });

    // Search
    let i = 0, j = 0;
    let found = [];
    while (i < n) {
      built.push({ strSnapshot: primaryStr, highlight: [i], line: 2, message: `i=${i}, j=${j}` });
      if (pattern[j] === primaryStr[i]) {
        i++;
        j++;
      }
      if (j === m) {
        found.push(i - j);
        built.push({ strSnapshot: primaryStr, highlight: Array.from({length: m}, (_, k) => i - m + k), line: 3, message: `Found at ${i - j}` });
        j = pi[j - 1];
      } else if (i < n && pattern[j] !== primaryStr[i]) {
        if (j !== 0) {
          j = pi[j - 1];
        } else {
          i++;
        }
        built.push({ strSnapshot: primaryStr, highlight: [i], line: 4, message: `Mismatch, j=${j}` });
      }
    }
    built.push({ strSnapshot: primaryStr, highlight: [], line: -1, message: `Found at: ${found.join(', ') || 'none'}` });
    runFrames(built);
  };

  // 9. LCS (simplified, show final length, animate matrix build minimally)
  const computeLCS = () => {
    const m = primaryStr.length;
    const n = secondaryStr.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    const built = [];
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (primaryStr[i - 1] === secondaryStr[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
        // Minimal animation: highlight current cell
        built.push({ strSnapshot: primaryStr, highlight: [i - 1], line: 2, message: `dp[${i}][${j}] = ${dp[i][j]}` });
      }
    }
    built.push({ strSnapshot: primaryStr, highlight: [], line: 4, message: `LCS length: ${dp[m][n]}` });
    runFrames(built);
  };

  // 10. String Compression RLE
  const compressRLE = () => {
    let result = '';
    let count = 1;
    const built = [];
    built.push({ strSnapshot: primaryStr, highlight: [0], line: 0, message: "Starting compression" });
    for (let i = 1; i <= primaryStr.length; i++) {
      if (i < primaryStr.length && primaryStr[i] === primaryStr[i - 1]) {
        count++;
        built.push({ strSnapshot: primaryStr, highlight: [i - 1, i], line: 2, message: `Count ${primaryStr[i - 1]}: ${count}` });
      } else {
        result += primaryStr[i - 1] + count;
        built.push({ strSnapshot: result, highlight: [], line: 3, message: `Add ${primaryStr[i - 1]}${count}` });
        count = 1;
      }
    }
    built.push({ strSnapshot: result, highlight: [], line: -1, message: `Compressed: "${result}"` });
    runFrames(built);
  };

  // 11. Frequency Count
  const frequencyCount = () => {
    const freq = {};
    const built = [];
    for (let i = 0; i < primaryStr.length; i++) {
      const char = primaryStr[i];
      freq[char] = (freq[char] || 0) + 1;
      built.push({ strSnapshot: primaryStr, highlight: [i], line: 1, message: `Count ${char}: ${freq[char]}` });
    }
    const freqStr = Object.entries(freq).map(([k, v]) => `${k}:${v}`).join(', ');
    built.push({ strSnapshot: primaryStr, highlight: [], line: 2, message: `Frequencies: ${freqStr}` });
    runFrames(built);
  };

  const handleOperation = () => {
    switch (selectedOp) {
      case 'traversal': return traversalLength();
      case 'reverse': return reverseStr();
      case 'substring': return extractSubstring();
      case 'concat': return concatenate();
      case 'palindrome': return checkPalindrome();
      case 'anagram': return checkAnagram();
      case 'naive': return naivePatternMatch();
      case 'kmp': return kmpPatternMatch();
      case 'lcs': return computeLCS();
      case 'compression': return compressRLE();
      case 'freq': return frequencyCount();
      default: return setMessage("Select an operation");
    }
  };

  // Control animation playback manually or automatically.
  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (frames.length === 0) return setMessage("Run an operation first.");
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

const chars = primaryStr.split('').map(c => c.charCodeAt(0)); // For viz, but show chars
// The final return block defines the UI layout:
// Left Panel
// Inputs (primary/secondary strings, indices, pattern)
// Dropdown for selecting operation
// Play controls (◀ ⏯ ▶)
// Message display
// Complexity display
// Pseudocode panel

// Right Panel (Canvas)
// Displays each character in a box (like an array)
// Highlighted boxes show the currently active characters
// A small legend note explains highlighting meaning.
  return (
    <div className="visualizer-container">
      <div className="left-panel">
        <div className="controls card">
          <h3>String Controls</h3>

          <div className="row">
            <input placeholder="Primary string" value={primaryStr} onChange={(e) => setPrimaryStr(e.target.value)} maxLength={maxLength} />
            <button onClick={handleSetPrimary}>Set Primary</button>
          </div>

          <div className="row">
            <input placeholder="Secondary string" value={secondaryStr} onChange={(e) => setSecondaryStr(e.target.value)} maxLength={maxLength} />
            <button onClick={handleSetSecondary}>Set Secondary</button>
          </div>

          <div className="row small">
            <input placeholder="start index" value={startIdx} onChange={(e) => setStartIdx(e.target.value)} />
            <input placeholder="end index" value={endIdx} onChange={(e) => setEndIdx(e.target.value)} />
            <button onClick={extractSubstring}>Substring</button>
          </div>

          <div className="row small">
            <input placeholder="Pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} />
          </div>

          <div className="row small">
            <select value={selectedOp} onChange={(e) => setSelectedOp(e.target.value)}>
              <option value="traversal">Traversal & Length</option>
              <option value="reverse">Reverse</option>
              <option value="substring">Substring</option>
              <option value="concat">Concatenation</option>
              <option value="palindrome">Palindrome Check</option>
              <option value="anagram">Anagram Check</option>
              <option value="naive">Naive Pattern Match</option>
              <option value="kmp">KMP Pattern Match</option>
              <option value="lcs">LCS</option>
              <option value="compression">Compression (RLE)</option>
              <option value="freq">Frequency Count</option>
            </select>
            <button onClick={handleOperation}>Run</button>
          </div>

          <div className="play-controls">
            <button onClick={handleStepBack}>◀</button>
            <button onClick={handlePlayPause}>{playing ? "Pause" : "Play"}</button>
            <button onClick={handleStepForward}>▶</button>
            <span className="frame-info">{frames.length ? `${cur + 1}/${frames.length}` : "0/0"}</span>
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
        <h3>String Visualization</h3>
        <div className="array-row">
          {primaryStr.split('').map((char, i) => {
            const isHighlighted = frames[cur] && frames[cur].highlight && frames[cur].highlight.includes(i);
            return (
              <div key={i} className={`array-cell ${isHighlighted ? "highlight" : ""}`}>
                <div className="value">{char}</div>
                <div className="index">{i}</div>
              </div>
            );
          })}
        </div>
        <div className="canvas-note">
          <small>Green highlight = current character in step</small>
        </div>
      </div>
    </div>
  );
}
