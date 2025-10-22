#  DSA Visualizer  

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://dsa-visualizer-rho.vercel.app)

🔗 **Live Demo:** [https://dsa-visualizer-rho.vercel.app](https://dsa-visualizer-rho.vercel.app)

An **interactive web-based Data Structures & Algorithms Visualizer** built with **React.js**, designed to help learners understand core DSA operations and algorithms through **real-time visual animations** and **pseudocode highlighting**.

---

## Features  

- Visualizes core **Data Structures**: Arrays, Stacks, Queues, Linked Lists, Strings, Trees, and Graphs.  
- Animates **15+ Algorithms**, including:
  - **Graph Algorithms:** BFS, DFS, Dijkstra, Prim’s, Kruskal’s, Bellman-Ford, Floyd-Warshall, Topological Sort, SCC, Bipartite Check.  
  - **Tree Operations:** Insert, Delete, Traversals (Inorder, Preorder, Postorder, Level-order), Height, Diameter, Mirror, LCA.  
  - **Array Operations:** Insert, Delete, Search, Sort (optional).  
- Step-by-step animation playback with **Play / Pause / Step Forward / Step Backward** controls.  
- Integrated **Pseudocode Panel** — highlights algorithm steps in sync with the visualization.  
- Clean, educational **UI/UX** for conceptual clarity and interactive learning.  
- Built with modular, **component-driven architecture** for scalability.  

---

## Preview  

Here’s a look at the DSA Visualizer interface:- 

![App Screenshot](./preview.png)  
*Array, Linked List, and Graph visualizations with synchronized pseudocode panel.*  

## Tech Stack  

- **Frontend:** React.js (Hooks, State, useEffect)  
- **Language:** JavaScript (ES6+)  
- **Styling:** CSS3  
- **Visualization:** SVG-based animations & dynamic DOM rendering  

---

## Installation & Setup 

1. **Clone the repository**
   
bash
   git clone https://github.com/your-username/dsa-visualizer.git
   
   cd dsa-visualizer
   
2.Install dependencies

     npm install
3.Start the development server

    npm start

## Project Structure

```
src/
│
├── components/
│   ├── Sidebar.js
│   ├── PseudocodePanel.js
│   ├── ArrayVisualizer.js
│   ├── StackVisualizer.js
│   ├── QueueVisualizer.js
│   ├── LinkedListVisualizer.js
│   ├── TreeVisualizer.js
│   └── GraphVisualizer.js
│
├── styles.css
└── App.js
```

## Learning Impact
1.Visualizes algorithmic flow and data structure transformations step-by-step.

2.Bridges the gap between theory and implementation for students and enthusiasts.

3.Can be extended to include Sorting, Hash Tables, and Heap operations.

## Author

Pakhi Singhal
 B.Tech DSAI | IIIT Dharwad

 ## If you like this project, don’t forget to give it a star!

