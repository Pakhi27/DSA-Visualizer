import React, { useState, useRef, useEffect } from "react";
import PseudocodePanel from "../PseudocodePanel";

// Graph Node class
class GraphNode {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
  }
}
// Represents each vertex.
// x and y define its random position on the canvas.
export default function GraphVisualizer() {
  const [vertices, setVertices] = useState([]); // array of GraphNode
  const [edges, setEdges] = useState([]); // array of {u, v, weight}
  const [adjList, setAdjList] = useState({}); // {vertexId: [{to: id, weight: w}]}
  const [adjMatrix, setAdjMatrix] = useState([]); // 2D array
  const [edgeList, setEdgeList] = useState([]); // array of {u, v, weight}
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [frames, setFrames] = useState([]); // frames = [{vertices, edges, highlightVertices: [], highlightEdges: [], line, message}]
  const [cur, setCur] = useState(0);
  const intervalRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedAlgo, setSelectedAlgo] = useState("addVertex");
// These manage different graph representations.
// These handle user input, animations (frames), and currently selected algorithm.
  // Pseudocode lines
  // Each algorithm has its pseudocode defined as a string array.
  const addVertexCode = [
    "Create new vertex with unique id",
    "Add to vertices list",
    "Update adjacency structures"
  ];

  const removeVertexCode = [
    "Find vertex by id",
    "Remove from vertices list",
    "Remove all edges connected to it",
    "Update adjacency structures"
  ];

  const addEdgeCode = [
    "Parse input: u,v[,weight]",
    "Check if vertices exist",
    "Add edge to edges list",
    "Update adjacency list/matrix"
  ];

  const removeEdgeCode = [
    "Parse input: u,v",
    "Find and remove edge",
    "Update adjacency structures"
  ];

  const bfsCode = [
    "Initialize queue and visited set",
    "Enqueue start vertex, mark visited",
    "While queue not empty:",
    "  Dequeue vertex",
    "  For each neighbor:",
    "    If not visited: enqueue, mark visited"
  ];

  const dfsCode = [
    "Initialize stack and visited set",
    "Push start vertex, mark visited",
    "While stack not empty:",
    "  Pop vertex",
    "  For each neighbor:",
    "    If not visited: push, mark visited"
  ];

  const dijkstraCode = [
    "Initialize distances: start=0, others=inf",
    "Use priority queue (min-heap)",
    "While queue not empty:",
    "  Extract min distance vertex",
    "  For each neighbor:",
    "    Relax edge: update distance if shorter"
  ];

  const bellmanFordCode = [
    "Initialize distances: start=0, others=inf",
    "For V-1 iterations:",
    "  For each edge:",
    "    Relax: if dist[u] + w < dist[v]: update",
    "Check for negative cycles"
  ];

  const floydWarshallCode = [
    "Initialize dist matrix with edge weights",
    "For k in 0..V-1:",
    "  For i in 0..V-1:",
    "    For j in 0..V-1:",
    "      dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])"
  ];

  const aStarCode = [
    "Initialize open set with start",
    "gScore[start] = 0, fScore[start] = heuristic(start, goal)",
    "While open set not empty:",
    "  current = lowest fScore in open",
    "  If current == goal: reconstruct path",
    "  For each neighbor:",
    "    tentative_g = gScore[current] + dist(current, neighbor)",
    "    If better: update scores, add to open"
  ];

  const primCode = [
    "Initialize MST set, key values",
    "Pick vertex with min key",
    "For each adjacent vertex:",
    "  If not in MST and edge weight < key:",
    "    Update key, parent"
  ];

  const kruskalCode = [
    "Sort edges by weight",
    "Initialize union-find",
    "For each edge in sorted order:",
    "  If u and v not in same set:",
    "    Add edge to MST, union sets"
  ];

  const topologicalSortCode = [
    "Calculate indegrees",
    "Initialize queue with 0 indegree vertices",
    "While queue not empty:",
    "  Dequeue vertex, add to order",
    "  For each neighbor: decrease indegree",
    "  If indegree == 0: enqueue"
  ];

  const cycleDetectionCode = [
    "Use DFS with colors: white, gray, black",
    "White: not visited, Gray: visiting, Black: visited",
    "If encounter gray node: cycle",
    "Mark nodes as visited"
  ];

  const sccCode = [
    "DFS to get finishing times",
    "Transpose graph",
    "DFS on transpose in finishing order",
    "Each DFS tree is an SCC"
  ];

  const bipartiteCode = [
    "Use BFS with colors: 0, 1",
    "Color start as 0",
    "For each neighbor:",
    "  If not colored: color opposite, enqueue",
    "  If same color: not bipartite"
  ];
  
// These functions return:
// The relevant pseudocode lines.
// Time/space complexity for the selected algorithm.
  const getCodeLines = () => {
    if (!frames[cur] || frames[cur].line < 0) return [];
    switch (selectedAlgo) {
      case 'addVertex': return addVertexCode;
      case 'removeVertex': return removeVertexCode;
      case 'addEdge': return addEdgeCode;
      case 'removeEdge': return removeEdgeCode;
      case 'bfs': return bfsCode;
      case 'dfs': return dfsCode;
      case 'dijkstra': return dijkstraCode;
      case 'bellmanFord': return bellmanFordCode;
      case 'floydWarshall': return floydWarshallCode;
      case 'aStar': return aStarCode;
      case 'prim': return primCode;
      case 'kruskal': return kruskalCode;
      case 'topologicalSort': return topologicalSortCode;
      case 'cycleDetection': return cycleDetectionCode;
      case 'scc': return sccCode;
      case 'bipartite': return bipartiteCode;
      default: return [];
    }
  };

  const getComplexity = () => {
    switch (selectedAlgo) {
      case 'addVertex':
      case 'removeVertex':
      case 'addEdge':
      case 'removeEdge':
        return 'Time: O(1), Space: O(1)';
      case 'bfs':
      case 'dfs':
      case 'topologicalSort':
      case 'cycleDetection':
      case 'scc':
      case 'bipartite':
        return 'Time: O(V + E), Space: O(V)';
      case 'dijkstra':
      case 'aStar':
      case 'prim':
        return 'Time: O((V + E) log V), Space: O(V)';
      case 'bellmanFord':
        return 'Time: O(V * E), Space: O(V)';
      case 'floydWarshall':
        return 'Time: O(V^3), Space: O(V^2)';
      case 'kruskal':
        return 'Time: O(E log E), Space: O(V)';
      default: return 'Select an algorithm';
    }
  };
  
  //When playing is true, it increments cur every 800ms.
// cur decides which frame is shown.
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
  
  // ➡️ React re-renders the SVG graph each time cur changes.
  useEffect(() => {
    if (frames[cur]) {
      setVertices(frames[cur].vertices || vertices);
      setEdges(frames[cur].edges || edges);
      if (frames[cur].message) setMessage(frames[cur].message);
      else setMessage("");
    }
  }, [cur, frames]);
   
//   Updates:
// Adjacency List
// Edge List

// All are recomputed whenever the graph changes.
  const updateAdjStructures = (verts, edgs) => {
    // Update adjList
    const list = {};
    verts.forEach(v => list[v.id] = []);
    edgs.forEach(e => {
      list[e.u].push({ to: e.v, weight: e.weight });
      if (!isDirected) list[e.v].push({ to: e.u, weight: e.weight });
    });
    setAdjList(list);

    // Update adjMatrix
    const n = verts.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    const idToIndex = {};
    verts.forEach((v, i) => idToIndex[v.id] = i);
    edgs.forEach(e => {
      const i = idToIndex[e.u];
      const j = idToIndex[e.v];
      matrix[i][j] = e.weight;
      if (!isDirected) matrix[j][i] = e.weight;
    });
    setAdjMatrix(matrix);

    // Update edgeList
    setEdgeList(edgs);
  };
   
  // ➡️ Called after any algorithm finishes building its visualization frames.
  const runFrames = (builtFrames) => {
    setFrames(builtFrames);
    setCur(0);
    setPlaying(true);
  };

  const addVertex = () => {
    const id = inputVal.trim();
    if (!id) return setMessage("Enter vertex id.");
    if (vertices.find(v => v.id === id)) return setMessage("Vertex already exists.");
    const built = [];
    const newVerts = [...vertices, new GraphNode(id, Math.random() * 600 + 50, Math.random() * 400 + 50)];
    built.push({ vertices: newVerts, edges, highlightVertices: [id], highlightEdges: [], line: 0, message: `Added vertex ${id}` });
    updateAdjStructures(newVerts, edges);
    runFrames(built);
    setInputVal("");
  };

  const removeVertex = () => {
    const id = inputVal.trim();
    if (!id) return setMessage("Enter vertex id.");
    const idx = vertices.findIndex(v => v.id === id);
    if (idx === -1) return setMessage("Vertex not found.");
    const built = [];
    const newVerts = vertices.filter(v => v.id !== id);
    const newEdges = edges.filter(e => e.u !== id && e.v !== id);
    built.push({ vertices: newVerts, edges: newEdges, highlightVertices: [], highlightEdges: [], line: 0, message: `Removed vertex ${id}` });
    updateAdjStructures(newVerts, newEdges);
    runFrames(built);
    setInputVal("");
  };

  const addEdge = () => {
    const parts = inputVal.split(',');
    if (parts.length < 2) return setMessage("Enter u,v[,weight]");
    const u = parts[0].trim();
    const v = parts[1].trim();
    const weight = parts[2] ? parseInt(parts[2].trim(), 10) : 1;
    if (!vertices.find(vtx => vtx.id === u) || !vertices.find(vtx => vtx.id === v)) return setMessage("Vertices not found.");
    if (edges.find(e => e.u === u && e.v === v)) return setMessage("Edge already exists.");
    const built = [];
    const newEdges = [...edges, { u, v, weight }];
    built.push({ vertices, edges: newEdges, highlightVertices: [], highlightEdges: [{ u, v }], line: 0, message: `Added edge ${u}-${v}` });
    updateAdjStructures(vertices, newEdges);
    runFrames(built);
    setInputVal("");
  };

  const removeEdge = () => {
    const parts = inputVal.split(',');
    if (parts.length < 2) return setMessage("Enter u,v");
    const u = parts[0].trim();
    const v = parts[1].trim();
    const idx = edges.findIndex(e => e.u === u && e.v === v);
    if (idx === -1) return setMessage("Edge not found.");
    const built = [];
    const newEdges = edges.filter((_, i) => i !== idx);
    built.push({ vertices, edges: newEdges, highlightVertices: [], highlightEdges: [], line: 0, message: `Removed edge ${u}-${v}` });
    updateAdjStructures(vertices, newEdges);
    runFrames(built);
    setInputVal("");
  };
   
//  Algorithm Implementations

// Each algorithm (BFS, DFS, Dijkstra, etc.):

// Reads input (like start vertex).

// Uses appropriate data structures.

// Builds an array of frames — each frame shows a new step (e.g., visited node).

// Calls runFrames() to start animation.
  // BFS
  const bfs = () => {
    const start = inputVal.trim();
    if (!start) return setMessage("Enter start vertex.");
    if (!vertices.find(v => v.id === start)) return setMessage("Start vertex not found.");
    const built = [];
    const visited = new Set();
    const queue = [start];
    visited.add(start);
    built.push({ vertices, edges, highlightVertices: [start], highlightEdges: [], line: 0, message: `BFS from ${start}` });
    while (queue.length > 0) {
      const u = queue.shift();
      built.push({ vertices, edges, highlightVertices: [u], highlightEdges: [], line: 1, message: `Dequeued ${u}` });
      adjList[u].forEach(neigh => {
        if (!visited.has(neigh.to)) {
          visited.add(neigh.to);
          queue.push(neigh.to);
          built.push({ vertices, edges, highlightVertices: [u, neigh.to], highlightEdges: [{ u: u, v: neigh.to }], line: 2, message: `Enqueued ${neigh.to}` });
        }
      });
    }
    runFrames(built);
  };

  // DFS
  const dfs = () => {
    const start = inputVal.trim();
    if (!start) return setMessage("Enter start vertex.");
    if (!vertices.find(v => v.id === start)) return setMessage("Start vertex not found.");
    const built = [];
    const visited = new Set();
    const stack = [start];
    visited.add(start);
    built.push({ vertices, edges, highlightVertices: [start], highlightEdges: [], line: 0, message: `DFS from ${start}` });
    while (stack.length > 0) {
      const u = stack.pop();
      built.push({ vertices, edges, highlightVertices: [u], highlightEdges: [], line: 1, message: `Popped ${u}` });
      adjList[u].forEach(neigh => {
        if (!visited.has(neigh.to)) {
          visited.add(neigh.to);
          stack.push(neigh.to);
          built.push({ vertices, edges, highlightVertices: [u, neigh.to], highlightEdges: [{ u: u, v: neigh.to }], line: 2, message: `Pushed ${neigh.to}` });
        }
      });
    }
    runFrames(built);
  };

  // Dijkstra
  const dijkstra = () => {
    const parts = inputVal.split(',');
    if (parts.length < 2) return setMessage("Enter start,goal");
    const start = parts[0].trim();
    const goal = parts[1].trim();
    if (!vertices.find(v => v.id === start) || !vertices.find(v => v.id === goal)) return setMessage("Vertices not found.");
    const built = [];
    const dist = {};
    const prev = {};
    vertices.forEach(v => {
      dist[v.id] = Infinity;
      prev[v.id] = null;
    });
    dist[start] = 0;
    const pq = [{ id: start, dist: 0 }];
    built.push({ vertices, edges, highlightVertices: [start], highlightEdges: [], line: 0, message: `Dijkstra from ${start} to ${goal}` });
    while (pq.length > 0) {
      pq.sort((a, b) => a.dist - b.dist);
      const u = pq.shift();
      built.push({ vertices, edges, highlightVertices: [u.id], highlightEdges: [], line: 1, message: `Extracted ${u.id}, dist=${u.dist}` });
      if (u.id === goal) break;
      adjList[u.id].forEach(neigh => {
        const alt = dist[u.id] + neigh.weight;
        if (alt < dist[neigh.to]) {
          dist[neigh.to] = alt;
          prev[neigh.to] = u.id;
          pq.push({ id: neigh.to, dist: alt });
          built.push({ vertices, edges, highlightVertices: [u.id, neigh.to], highlightEdges: [{ u: u.id, v: neigh.to }], line: 2, message: `Updated ${neigh.to}, dist=${alt}` });
        }
      });
    }
    // Reconstruct path
    const path = [];
    let current = goal;
    while (current) {
      path.unshift(current);
      current = prev[current];
    }
    built.push({ vertices, edges, highlightVertices: path, highlightEdges: [], line: 3, message: `Path: ${path.join(' -> ')}` });
    runFrames(built);
  };

  // Bellman-Ford
  const bellmanFord = () => {
    const start = inputVal.trim();
    if (!start) return setMessage("Enter start vertex.");
    if (!vertices.find(v => v.id === start)) return setMessage("Start vertex not found.");
    const built = [];
    const dist = {};
    vertices.forEach(v => dist[v.id] = Infinity);
    dist[start] = 0;
    built.push({ vertices, edges, highlightVertices: [start], highlightEdges: [], line: 0, message: `Bellman-Ford from ${start}` });
    for (let i = 0; i < vertices.length - 1; i++) {
      edges.forEach(e => {
        if (dist[e.u] !== Infinity && dist[e.u] + e.weight < dist[e.v]) {
          dist[e.v] = dist[e.u] + e.weight;
          built.push({ vertices, edges, highlightVertices: [e.u, e.v], highlightEdges: [e], line: 1, message: `Relaxed ${e.u}-${e.v}, dist[${e.v}]=${dist[e.v]}` });
        }
      });
    }
    // Check negative cycle
    let hasNegative = false;
    edges.forEach(e => {
      if (dist[e.u] !== Infinity && dist[e.u] + e.weight < dist[e.v]) {
        hasNegative = true;
      }
    });
    built.push({ vertices, edges, highlightVertices: [], highlightEdges: [], line: 2, message: hasNegative ? "Negative cycle detected" : "No negative cycle" });
    runFrames(built);
  };

  // Floyd-Warshall
  const floydWarshall = () => {
    const built = [];
    const n = vertices.length;
    const dist = Array(n).fill().map(() => Array(n).fill(Infinity));
    const idToIndex = {};
    vertices.forEach((v, i) => {
      idToIndex[v.id] = i;
      dist[i][i] = 0;
    });
    edges.forEach(e => {
      const i = idToIndex[e.u];
      const j = idToIndex[e.v];
      dist[i][j] = e.weight;
      if (!isDirected) dist[j][i] = e.weight;
    });
    built.push({ vertices, edges, highlightVertices: [], highlightEdges: [], line: 0, message: "Floyd-Warshall all-pairs shortest paths" });
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            built.push({ vertices, edges, highlightVertices: [vertices[i].id, vertices[j].id, vertices[k].id], highlightEdges: [], line: 1, message: `Updated dist[${vertices[i].id}][${vertices[j].id}] via ${vertices[k].id}` });
          }
        }
      }
    }
    runFrames(built);
  };

  // A*
  const aStar = () => {
    const parts = inputVal.split(',');
    if (parts.length < 2) return setMessage("Enter start,goal");
    const start = parts[0].trim();
    const goal = parts[1].trim();
    if (!vertices.find(v => v.id === start) || !vertices.find(v => v.id === goal)) return setMessage("Vertices not found.");
    const built = [];
    const openSet = [start];
    const cameFrom = {};
    const gScore = {};
    const fScore = {};
    vertices.forEach(v => {
      gScore[v.id] = Infinity;
      fScore[v.id] = Infinity;
    });
    gScore[start] = 0;
    fScore[start] = heuristic(start, goal);
    built.push({ vertices, edges, highlightVertices: [start], highlightEdges: [], line: 0, message: `A* from ${start} to ${goal}` });
    while (openSet.length > 0) {
      const current = openSet.reduce((a, b) => fScore[a] < fScore[b] ? a : b);
      if (current === goal) {
        const path = reconstructPath(cameFrom, current);
        built.push({ vertices, edges, highlightVertices: path, highlightEdges: [], line: 1, message: `Path found: ${path.join(' -> ')}` });
        runFrames(built);
        return;
      }
      openSet.splice(openSet.indexOf(current), 1);
      built.push({ vertices, edges, highlightVertices: [current], highlightEdges: [], line: 2, message: `Exploring ${current}` });
      adjList[current].forEach(neigh => {
        const tentativeG = gScore[current] + neigh.weight;
        if (tentativeG < gScore[neigh.to]) {
          cameFrom[neigh.to] = current;
          gScore[neigh.to] = tentativeG;
          fScore[neigh.to] = gScore[neigh.to] + heuristic(neigh.to, goal);
          if (!openSet.includes(neigh.to)) openSet.push(neigh.to);
          built.push({ vertices, edges, highlightVertices: [current, neigh.to], highlightEdges: [{ u: current, v: neigh.to }], line: 3, message: `Updated ${neigh.to}, f=${fScore[neigh.to]}` });
        }
      });
    }
    built.push({ vertices, edges, highlightVertices: [], highlightEdges: [], line: 4, message: "No path found" });
    runFrames(built);
  };

  const heuristic = (a, b) => {
    const va = vertices.find(v => v.id === a);
    const vb = vertices.find(v => v.id === b);
    return Math.sqrt((va.x - vb.x) ** 2 + (va.y - vb.y) ** 2); // Euclidean distance
  };

  const reconstructPath = (cameFrom, current) => {
    const path = [current];
    while (cameFrom[current]) {
      current = cameFrom[current];
      path.unshift(current);
    }
    return path;
  };

  // Prim
  const prim = () => {
    if (vertices.length === 0) return setMessage("No vertices.");
    const built = [];
    const mst = [];
    const key = {};
    const parent = {};
    const inMST = {};
    vertices.forEach(v => {
      key[v.id] = Infinity;
      parent[v.id] = null;
      inMST[v.id] = false;
    });
    key[vertices[0].id] = 0;
    built.push({ vertices, edges, highlightVertices: [vertices[0].id], highlightEdges: [], line: 0, message: "Prim's MST" });
    for (let count = 0; count < vertices.length - 1; count++) {
      const u = Object.keys(key).reduce((a, b) => !inMST[a] && key[a] < key[b] ? a : b);
      inMST[u] = true;
      built.push({ vertices, edges, highlightVertices: [u], highlightEdges: [], line: 1, message: `Added ${u} to MST` });
      adjList[u].forEach(neigh => {
        if (!inMST[neigh.to] && neigh.weight < key[neigh.to]) {
          parent[neigh.to] = u;
          key[neigh.to] = neigh.weight;
          built.push({ vertices, edges, highlightVertices: [u, neigh.to], highlightEdges: [{ u, v: neigh.to }], line: 2, message: `Updated key for ${neigh.to}` });
        }
      });
    }
    Object.keys(parent).forEach(v => {
      if (parent[v]) mst.push({ u: parent[v], v, weight: key[v] });
    });
    built.push({ vertices, edges, highlightVertices: [], highlightEdges: mst, line: 3, message: "MST complete" });
    runFrames(built);
  };

  // Kruskal
  const kruskal = () => {
    const built = [];
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const parent = {};
    vertices.forEach(v => parent[v.id] = v.id);
    const find = (x) => parent[x] === x ? x : find(parent[x]);
    const union = (x, y) => {
      const px = find(x);
      const py = find(y);
      parent[px] = py;
    };
    const mst = [];
    built.push({ vertices, edges, highlightVertices: [], highlightEdges: [], line: 0, message: "Kruskal's MST" });
    sortedEdges.forEach(e => {
      const pu = find(e.u);
      const pv = find(e.v);
      if (pu !== pv) {
        union(e.u, e.v);
        mst.push(e);
        built.push({ vertices, edges, highlightVertices: [e.u, e.v], highlightEdges: [e], line: 1, message: `Added edge ${e.u}-${e.v}` });
      }
    });
    built.push({ vertices, edges, highlightVertices: [], highlightEdges: mst, line: 2, message: "MST complete" });
    runFrames(built);
  };

  // Topological Sort
  const topologicalSort = () => {
    if (!isDirected) return setMessage("Graph must be directed.");
    const built = [];
    const indegree = {};
    vertices.forEach(v => indegree[v.id] = 0);
    edges.forEach(e => indegree[e.v]++);
    const queue = vertices.filter(v => indegree[v.id] === 0).map(v => v.id);
    const order = [];
    built.push({ vertices, edges, highlightVertices: queue, highlightEdges: [], line: 0, message: "Topological Sort" });
    while (queue.length > 0) {
      const u = queue.shift();
      order.push(u);
      built.push({ vertices, edges, highlightVertices: [u], highlightEdges: [], line: 1, message: `Processed ${u}` });
      adjList[u].forEach(neigh => {
        indegree[neigh.to]--;
        if (indegree[neigh.to] === 0) {
          queue.push(neigh.to);
          built.push({ vertices, edges, highlightVertices: [u, neigh.to], highlightEdges: [{ u, v: neigh.to }], line: 2, message: `Enqueued ${neigh.to}` });
        }
      });
    }
    if (order.length !== vertices.length) {
      built.push({ vertices, edges, highlightVertices: [], highlightEdges: [], line: 3, message: "Cycle detected" });
    } else {
      built.push({ vertices, edges, highlightVertices: [], highlightEdges: [], line: 3, message: `Order: ${order.join(' -> ')}` });
    }
    runFrames(built);
  };

  // Cycle Detection
  const cycleDetection = () => {
    const built = [];
    const visited = {};
    const recStack = {};
    vertices.forEach(v => {
      visited[v.id] = false;
      recStack[v.id] = false;
    });
    const hasCycle = vertices.some(v => dfsCycle(v.id, visited, recStack, built));
    built.push({ vertices, edges, highlightVertices: [], highlightEdges: [], line: 0, message: hasCycle ? "Cycle detected" : "No cycle" });
    runFrames(built);
  };

  const dfsCycle = (u, visited, recStack, built) => {
    visited[u] = true;
    recStack[u] = true;
    built.push({ vertices, edges, highlightVertices: [u], highlightEdges: [], line: 1, message: `Visiting ${u}` });
    for (let neigh of adjList[u]) {
      if (!visited[neigh.to] && dfsCycle(neigh.to, visited, recStack, built)) {
        return true;
      } else if (recStack[neigh.to]) {
        built.push({ vertices, edges, highlightVertices: [u, neigh.to], highlightEdges: [{ u, v: neigh.to }], line: 2, message: "Back edge found" });
        return true;
      }
    }
    recStack[u] = false;
    return false;
  };

  // SCC (Kosaraju)
  const scc = () => {
    if (!isDirected) return setMessage("Graph must be directed.");
    const built = [];
    const visited = {};
    const stack = [];
    vertices.forEach(v => visited[v.id] = false);
    // First DFS to get finishing times
    vertices.forEach(v => {
      if (!visited[v.id]) dfs1(v.id, visited, stack, built);
    });
    // Transpose graph
    const transpose = {};
    vertices.forEach(v => transpose[v.id] = []);
    edges.forEach(e => transpose[e.v].push({ to: e.u, weight: e.weight }));
    // Second DFS on transpose
    vertices.forEach(v => visited[v.id] = false);
    const sccs = [];
    while (stack.length > 0) {
      const u = stack.pop();
      if (!visited[u]) {
        const component = [];
        dfs2(u, visited, transpose, component, built);
        sccs.push(component);
        built.push({ vertices, edges, highlightVertices: component, highlightEdges: [], line: 3, message: `SCC: ${component.join(', ')}` });
      }
    }
    runFrames(built);
  };

  const dfs1 = (u, visited, stack, built) => {
    visited[u] = true;
    adjList[u].forEach(neigh => {
      if (!visited[neigh.to]) dfs1(neigh.to, visited, stack, built);
    });
    stack.push(u);
  };

  const dfs2 = (u, visited, transpose, component, built) => {
    visited[u] = true;
    component.push(u);
    transpose[u].forEach(neigh => {
      if (!visited[neigh.to]) dfs2(neigh.to, visited, transpose, component, built);
    });
  };

  // Bipartite Check
  const bipartite = () => {
    const built = [];
    const color = {};
    vertices.forEach(v => color[v.id] = -1);
    const isBipartite = vertices.every(v => {
      if (color[v.id] === -1) {
        return bfsColor(v.id, color, built);
      }
      return true;
    });
    built.push({ vertices, edges, highlightVertices: [], highlightEdges: [], line: 0, message: isBipartite ? "Bipartite" : "Not bipartite" });
    runFrames(built);
  };

  const bfsColor = (start, color, built) => {
    const queue = [start];
    color[start] = 0;
    built.push({ vertices, edges, highlightVertices: [start], highlightEdges: [], line: 1, message: `Colored ${start} as 0` });
    while (queue.length > 0) {
      const u = queue.shift();
      adjList[u].forEach(neigh => {
        if (color[neigh.to] === -1) {
          color[neigh.to] = 1 - color[u];
          queue.push(neigh.to);
          built.push({ vertices, edges, highlightVertices: [u, neigh.to], highlightEdges: [{ u, v: neigh.to }], line: 2, message: `Colored ${neigh.to} as ${color[neigh.to]}` });
        } else if (color[neigh.to] === color[u]) {
          built.push({ vertices, edges, highlightVertices: [u, neigh.to], highlightEdges: [{ u, v: neigh.to }], line: 3, message: "Same color conflict" });
          return false;
        }
      });
    }
    return true;
  };

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
  
// Renders edges first, then vertices on top.
// Highlights nodes or edges that are active in the current frame.
// Shows weights if isWeighted is true.
  const renderGraph = () => {
    const currentFrame = frames[cur] || { vertices, edges, highlightVertices: [], highlightEdges: [] };
    return (
      <svg className="graph-canvas" width="800" height="600">
        {/* Edges */}
        {currentFrame.edges.map((e, idx) => {
          const u = currentFrame.vertices.find(v => v.id === e.u);
          const v = currentFrame.vertices.find(v => v.id === e.v);
          if (!u || !v) return null;
          const isHighlighted = currentFrame.highlightEdges.some(he => he.u === e.u && he.v === e.v);
          return (
            <g key={idx}>
              <line
                x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                stroke={isHighlighted ? "red" : "black"}
                strokeWidth={isHighlighted ? 3 : 2}
              />
              {isWeighted && (
                <text
                  x={(u.x + v.x) / 2} y={(u.y + v.y) / 2}
                  textAnchor="middle"
                  fontSize="12"
                  fill="blue"
                >
                  {e.weight}
                </text>
              )}
            </g>
          );
        })}
        {/* Vertices */}
        {currentFrame.vertices.map((v) => {
          const isHighlighted = currentFrame.highlightVertices.includes(v.id);
          return (
            <g key={v.id}>
              <circle
                cx={v.x} cy={v.y} r="20"
                fill={isHighlighted ? "yellow" : "lightblue"}
                stroke="black"
                strokeWidth="2"
              />
              <text
                x={v.x} y={v.y + 5}
                textAnchor="middle"
                fontSize="14"
                fill="black"
              >
                {v.id}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="visualizer-container">
      <div className="left-panel">
        <div className="controls card">
          <h3>Graph Controls</h3>

          <div className="row">
            <label>
              <input type="checkbox" checked={isDirected} onChange={(e) => setIsDirected(e.target.checked)} />
              Directed
            </label>
            <label>
              <input type="checkbox" checked={isWeighted} onChange={(e) => setIsWeighted(e.target.checked)} />
              Weighted
            </label>
          </div>

          <div className="row">
            <input placeholder="vertex id or u,v[,weight]" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
            <select value={selectedAlgo} onChange={(e) => setSelectedAlgo(e.target.value)}>
              <option value="addVertex">Add Vertex</option>
              <option value="removeVertex">Remove Vertex</option>
              <option value="addEdge">Add Edge</option>
              <option value="removeEdge">Remove Edge</option>
              <option value="bfs">BFS</option>
              <option value="dfs">DFS</option>
              <option value="dijkstra">Dijkstra</option>
              <option value="bellmanFord">Bellman-Ford</option>
              <option value="floydWarshall">Floyd-Warshall</option>
              <option value="aStar">A*</option>
              <option value="prim">Prim's MST</option>
              <option value="kruskal">Kruskal's MST</option>
              <option value="topologicalSort">Topological Sort</option>
              <option value="cycleDetection">Cycle Detection</option>
              <option value="scc">SCC (Kosaraju)</option>
              <option value="bipartite">Bipartite Check</option>
            </select>
            <button onClick={() => {
              switch (selectedAlgo) {
                case 'addVertex': addVertex(); break;
                case 'removeVertex': removeVertex(); break;
                case 'addEdge': addEdge(); break;
                case 'removeEdge': removeEdge(); break;
                case 'bfs': bfs(); break;
                case 'dfs': dfs(); break;
                case 'dijkstra': dijkstra(); break;
                case 'bellmanFord': bellmanFord(); break;
                case 'floydWarshall': floydWarshall(); break;
                case 'aStar': aStar(); break;
                case 'prim': prim(); break;
                case 'kruskal': kruskal(); break;
                case 'topologicalSort': topologicalSort(); break;
                case 'cycleDetection': cycleDetection(); break;
                case 'scc': scc(); break;
                case 'bipartite': bipartite(); break;
                default: break;
              }
            }}>Run</button>
          </div>

          <div className="play-controls">
            <button onClick={handleStepBack}>◀</button>
            <button onClick={handlePlayPause}>{playing ? "Pause" : "Play"}</button>
            <button onClick={handleStepForward}>▶</button>
            <span className="frame-info">{frames.length ? `${cur+1}/${frames.length}` : "0/0"}</span>
          </div>

          <div className="message">{message}</div>
          <div className="complexity">
            Complexity: {getComplexity()}
          </div>
        </div>

        <PseudocodePanel
          codeLines={getCodeLines()}
          highlight={frames[cur] ? frames[cur].line : -1}
        />
      </div>

      <div className="canvas card">
        <h3>Graph Visualization</h3>
        <div className="graph-canvas">
          {renderGraph()}
        </div>
        <div className="canvas-note">
          <small>Yellow = highlighted vertex, Red = highlighted edge</small>
        </div>

        <div className="representations">
          <h4>Adjacency List</h4>
          <pre>{JSON.stringify(adjList, null, 2)}</pre>
          <h4>Adjacency Matrix</h4>
          <pre>{adjMatrix.map(row => row.join(' ')).join('\n')}</pre>
          <h4>Edge List</h4>
          <pre>{edgeList.map(e => `${e.u}-${e.v}:${e.weight}`).join('\n')}</pre>
        </div>
      </div>
    </div>
  );
}
// 🧭 High-Level Overview

// This file defines a Graph Visualizer React component that allows users to:

// Build a graph interactively (add/remove vertices and edges)

// Toggle directed and weighted options

// Run and visualize multiple graph algorithms (BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Prim’s, Kruskal’s, Topological Sort, SCC, etc.)

// See animations step-by-step using a “frames” system

// Display pseudocode and messages for the current step

// It uses:

// React hooks (useState, useRef, useEffect)

// A small GraphNode class for vertex data

// SVG rendering for nodes and edges

// A PseudocodePanel component to show code highlights and complexities

// How the Animation Works Visually

//  React + Frames System

// Each algorithm builds frames = [{ vertices, edges, highlights, message }].

// cur (current frame index) is updated either manually or via timer.

// Every time cur changes:

// React re-renders the SVG using that frame’s data.

// The pseudocode panel highlights the correct line.

// A message appears describing what’s happening.

// This gives the illusion of animation — React just updates DOM elements every frame!