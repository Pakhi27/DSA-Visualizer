import React from "react";
// Defines a functional component called PseudocodePanel.
// It uses destructuring props — it receives two props:
// codeLines → array of strings (each string = one line of pseudocode).
// Default: empty array [] (to avoid errors if nothing passed).
// highlight → index (integer) of the currently highlighted line.
// Default: -1 (means no line is highlighted).
export default function PseudocodePanel({ codeLines = [], highlight = -1 }) {
  return (
    <div className="pseudo">
      <h3>Pseudocode</h3>
      {/* Container for all the pseudocode lines. */}
      {/* Likely styled with monospaced font, padding, maybe a border (like a code editor). */}
      <div className="code-block">
        {/* erates through the codeLines array. */}
        {/* map() returns one <div> for each pseudocode line. */}
        {/* idx → index of the current line (used both for display and highlighting). */}
        {codeLines.map((line, idx) => (
          <div
            key={idx}
            className={`code-line ${highlight === idx ? "highlight" : ""}`}
          >
            {/* Each line is a <div>.
key={idx} → React requires a unique key for list items to track updates.
className:
Always has "code-line".
If the current line is the highlighted one (i.e., highlight === idx), the class "highlight" is added too. */}
            {/* So the line visually glows or changes color using CSS. */}
            <span className="lineno">{idx + 1}</span>
            {/* hows the line number (starting from 1). */}
{/* Typically rendered in a lighter color (like gray) beside the code. */}
            <span className="code-txt">{line}</span>
            {/* Displays the actual text of the pseudocode. */}
          </div>
        ))}
      </div>
    </div>
  );
}
