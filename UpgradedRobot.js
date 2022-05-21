"use strict"

const roads = [
    "Alice's House-Bob's House-3",   "Alice's House-Cabin-5",
    "Alice's House-Post Office-2",   "Bob's House-Town Hall-8",
    "Daria's House-Ernie's House-1", "Daria's House-Town Hall-5",
    "Ernie's House-Grete's House-3", "Grete's House-Farm-6",
    "Grete's House-Shop-2",          "Marketplace-Farm-3",
    "Marketplace-Post Office-2",     "Marketplace-Shop-1",
    "Marketplace-Town Hall-4",       "Shop-Town Hall-5",
    "HUST-Marketplace-3",            "HUST-Cabin-7"
  ];
  
  function buildGraph(edges) {	// Hàm xây dựng danh sách kề với các đường đi ở trên
      let graph = Object.create(null);
      function addEdge(from, to, weight) {	// Hàm add một cạnh from->to vào danh sách kề
          if (graph[from] == null) {
              graph[from] = [[to, weight]];
          }
          else {
              graph[from].push([to, weight]);
          }
      }
      
      for (let [from, to, weight] of edges.map(r => r.split("-"))) { // Tách các phần tử r[i] thành 2 xâu ngăn cách bởi dấu "-" và gán from, to 2 giá trị này
          addEdge(from, to, weight);
          addEdge(to, from, weight);
          //console.log(from, to, weight);
      }
      return graph;
  }

  function buildNodes(edges) {
    let Nodes = [];
    
    function addNodes(node) {
      if (!Nodes.some(n  => n == node)) {
        Nodes.push(node);
      }
    }

    for (let [from, to, weight] of edges.map(r => r.split("-"))) {
      addNodes(from);
      addNodes(to);
    }

    return Nodes;
  }

  const nodes = buildNodes(roads);
  const roadGraph = buildGraph(roads);

  function randomPick(array) {	// Hàm trả về một phần tử ngẫu nhiên trong mảng array
    let choice = Math.floor(Math.random() * array.length);
    // Math.random(): Trả về một số ngẫu nhiên trong khoảng [0,1]
    // Math.floor(a): Lấy phần nguyên của một số thực a
    // Dòng lệnh trên khai báo biến choice và khởi tạo cho choice một giá trị nằm trong khoảng [0, array.length]
    return array[choice];
  }

  let minDist = [];
  const start = randomPick(nodes);
  let destination;
  do {
    destination = randomPick(nodes);
  }
  while (start == destination);

  //console.log(roadGraph[start]);

  console.log(`Robot starts at ${start}`);
  console.log(`Finished at ${destination}`);
  
  for (let i of nodes) {
    if (i == start) {
      minDist[i] = 0;
    }
    else {
      minDist[i] = Infinity;
    }
  }

  function BFS(currentPlace, currentWeight) {
    for (let [next, weight] of roadGraph[currentPlace]) {
        //console.log(next, weight);
      if (minDist[next] > currentWeight + (weight*1)) {
        minDist[next] = currentWeight + (weight*1);
        BFS(next, currentWeight + (weight*1));
      }
      else {
        continue;
      }
    }
  }

  BFS(start, 0);

  for (let i of nodes) {
    console.log(i);
    console.log(minDist[i]);
  }

  let visited = [];
  let trace = Object.create(null);

  for (let i of nodes) {
      visited[i] = false;
  }

  function DFS(currentPlace, currentWeight) {
      if (currentPlace == destination) return

      for (let [next, weight] of roadGraph[currentPlace]) {
        if (minDist[currentPlace] + weight * 1 == minDist[next]) {
            if (trace[next] == null) trace[next] = [currentPlace];
            else {
                if (!trace[next].some(t => t == currentPlace)) {
                    trace[next].push(currentPlace);
                }
            }

            if (visited[next] == false) {
                DFS(next, minDist[next]);
                visited[next] = true;
            }
        }
      }
  }

  DFS(start, 0);
  
  let pathCount = 0;

  function DFS2(currentPlace, currentPath) {

    if (currentPlace == start) {
      let path = currentPath.reverse();
      pathCount++;
      path.push(destination);
      console.log(`Path number ${pathCount}:`);
      console.log(path);
    }

    if (trace[currentPlace]) {
      for (let prev of trace[currentPlace]) { 
        if (!currentPath) {
          currentPath = [prev];
        }
        else {
          currentPath.push(prev);
        }
        DFS2(prev, currentPath);
        currentPath.pop();
      }
    }

  }

  DFS2(destination, null);