import React from "react";
// It uses destructuring to directly access two props passed from App.js:
// selected: tells which DSA type is currently active.
// setSelected: function used to change the active selection (updates the parent state).

// core logic
// {items.map((it) => (...))}

// .map() iterates through every element in the items array.
// For each item (like "Array" or "Stack"), it creates one <button> element.

// key={it}
// React requires a unique key when rendering lists.
// It helps React efficiently update only changed elements (improves rendering performance).

// className={side-btn ${selected === it ? "active" : ""}}
// Dynamically assigns CSS classes.
// Every button gets side-btn.
// If the current item it equals the selected value (from state), it also adds "active".
// This "active" class highlights the currently chosen data structure (for example, gives it a different color).

// onClick={() => setSelected(it)}
// When the user clicks this button, the callback is triggered.
// It calls setSelected(it) — which updates the selected state in the parent App component.
// React re-renders the app, and now the new visualizer is displayed.

// {it}
// Displays the text label of the button (like “Array”, “Stack”, etc.).
export default function Sidebar({ selected, setSelected }) {
  // Defines an array of strings that represent the available data structure types.
  const items = ["Array", "Stack", "Queue", "Linked List", "String", "Tree", "Graph"];
  
  
   
  return (
    <aside className="sidebar">
      <div className="logo">DSA Visualizer</div>
      <nav>
        {items.map((it) => (
          <button
            key={it}
            className={`side-btn ${selected === it ? "active" : ""}`}
            onClick={() => setSelected(it)}
          >
            {it}
          </button>
        ))}
      </nav>
    </aside>
  );
}
