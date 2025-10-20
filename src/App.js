import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ArrayVisualizer from "./components/ArrayVisualizer";
import StackVisualizer from "./components/StackVisualizer";
import QueueVisualizer from "./components/QueueVisualizer";
import LinkedListVisualizer from "./components/LinkedListVisualizer";
import StringVisualizer from "./components/StringVisualizer";
import TreeVisualizer from "./components/TreeVisualizer";
import GraphVisualizer from "./components/GraphVisualizer";
import "./styles.css";

export default function App() {
  //   Declares a state variable selected, which tracks the currently chosen data structure.
  // The initial value is "Array", so when the app starts, the Array visualizer is shown.
  // setSelected is the updater function — called when the user picks a new DSA from the sidebar.
  const [selected, setSelected] = useState("Array");

  return (
    <div className="app">
      {/* Renders the Sidebar component. */}

      {/* Passes two props:
selected: tells Sidebar which DSA is currently active.
setSelected: lets Sidebar update the state in App when a user clicks a new DSA.
This is called lifting state up — Sidebar doesn’t have its own state; it uses App’s. */}
      <Sidebar selected={selected} setSelected={setSelected} />
      <main className="main">
        <header className="header">
          <h1 style={{ textAlign: 'center' }}>DSA Operations Visualizer</h1>
          <p className="sub" style={{ textAlign: 'center' }}>Interactive visualizations: arrays · stacks · queues · linked lists · strings · trees · graphs</p>
        </header>

        {/* This section conditionally renders only one visualizer at a time.
Example: if selected is "Array", then <ArrayVisualizer /> is rendered.
The && syntax means:
If the condition is true, render what’s on the right side.
This is called conditional rendering in React.
It dynamically switches between components without reloading the page. */}
        <section className="workspace">
          {selected === "Array" && <ArrayVisualizer />}
          {selected === "Stack" && <StackVisualizer />}
          {selected === "Queue" && <QueueVisualizer />}
          {selected === "Linked List" && <LinkedListVisualizer />}
          {selected === "String" && <StringVisualizer />}
          {selected === "Tree" && <TreeVisualizer />}
          {selected === "Graph" && <GraphVisualizer />}
        </section>

        <footer className="footer">
          Built for learning DSA.
        </footer>
      </main>
    </div>
  );
}
