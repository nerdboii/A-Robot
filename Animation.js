(function() {
  "use strict";

  let active = null;

  const places = {
    "Alice's House": { x: 279, y: 100 },
    "Bob's House": { x: 295, y: 203 },
    Cabin: { x: 372, y: 67 },
    "Daria's House": { x: 183, y: 285 },
    "Ernie's House": { x: 50, y: 283 },
    Farm: { x: 36, y: 118 },
    "Grete's House": { x: 35, y: 187 },
    Marketplace: { x: 162, y: 110 },
    "Post Office": { x: 205, y: 57 },
    Shop: { x: 137, y: 212 },
    "Town Hall": { x: 202, y: 213 }
  };
  const placeKeys = Object.keys(places);

  const speed = 2;

  class Animation {
    constructor(worldState, robot, robotState) {
      this.worldState = worldState;
      this.robot = robot;
      this.robotState = robotState;
      this.turn = 0;

      let outer = window.__sandbox
          ? window.__sandbox.output.div
          : document.body,
        doc = outer.ownerDocument;
      this.node = outer.appendChild(doc.createElement("div"));
      this.node.style.cssText =
        "position: relative; line-height: 0.1; margin-left: 10px";
      this.map = this.node.appendChild(doc.createElement("img"));
      this.map.src = "http://eloquentjavascript.net/img/village2x.png";
      this.map.style.cssText = "vertical-align: -8px";
      this.robotElt = this.node.appendChild(doc.createElement("div"));
      this.robotElt.style.cssText = `position: absolute; transition: left ${0.8 /
        speed}s, top ${0.8 / speed}s;`;
      let robotPic = this.robotElt.appendChild(doc.createElement("img"));
      robotPic.src = "http://eloquentjavascript.net/img/robot_moving2x.gif";
      this.parcels = [];

      this.text = this.node.appendChild(doc.createElement("span"));
      this.button = this.node.appendChild(doc.createElement("button"));
      this.button.style.cssText =
        "color: white; background: #28b; border: none; border-radius: 2px; padding: 2px 5px; line-height: 1.1; font-family: sans-serif; font-size: 80%";
      this.button.textContent = "Stop";

      this.button.addEventListener("click", () => this.clicked());
      this.schedule();

      this.updateView();
      this.updateParcels();

      this.robotElt.addEventListener("transitionend", () =>
        this.updateParcels()
      );
    }

    updateView() {
      let pos = places[this.worldState.place];
      this.robotElt.style.top = pos.y - 38 + "px";
      this.robotElt.style.left = pos.x - 16 + "px";

      this.text.textContent = ` Turn ${this.turn} `;
    }

    updateParcels() {
      while (this.parcels.length) this.parcels.pop().remove();
      let heights = {};
      for (let { place, address } of this.worldState.parcels) {
        let height = heights[place] || (heights[place] = 0);
        heights[place] += 14;
        let node = document.createElement("div");
        let offset = placeKeys.indexOf(address) * 16;
        node.style.cssText =
          "position: absolute; height: 16px; width: 16px; background-image: url(http://eloquentjavascript.net/img/parcel2x.png); background-position: 0 -" +
          offset +
          "px";
        if (place == this.worldState.place) {
          node.style.left = "25px";
          node.style.bottom = 20 + height + "px";
          this.robotElt.appendChild(node);
        } else {
          let pos = places[place];
          node.style.left = pos.x - 5 + "px";
          node.style.top = pos.y - 10 - height + "px";
          this.node.appendChild(node);
        }
        this.parcels.push(node);
      }
    }

    tick() {
      let { direction, memory } = this.robot(this.worldState, this.robotState);
      this.worldState = this.worldState.move(direction);
      this.robotState = memory;
      this.turn++;
      this.updateView();
      if (this.worldState.parcels.length == 0) {
        this.button.remove();
        this.text.textContent = `Finished after ${this.turn} turns`;
        this.robotElt.firstChild.src =
          "http://eloquentjavascript.net/img/robot_idle2x.png";
      } else {
        this.schedule();
      }
    }

    schedule() {
      this.timeout = setTimeout(() => this.tick(), 1000 / speed);
    }

    clicked() {
      if (this.timeout == null) {
        this.schedule();
        this.button.textContent = "Stop";
        this.robotElt.firstChild.src =
          "http://eloquentjavascript.net/img/robot_moving2x.gif";
      } else {
        clearTimeout(this.timeout);
        this.timeout = null;
        this.button.textContent = "Start";
        this.robotElt.firstChild.src =
          "http://eloquentjavascript.net/img/robot_idle2x.png";
      }
    }
  }

  window.runRobotAnimation = function(worldState, robot, robotState) {
    if (active && active.timeout != null) clearTimeout(active.timeout);
    active = new Animation(worldState, robot, robotState);
  };
})();

  const roads = [
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
  ];
  
  function buildGraph(edges) {	// Hàm xây dựng danh sách kề với các đường đi ở trên
      let graph = Object.create(null);
      function addEdge(from, to) {	// Hàm add một cạnh from->to vào danh sách kề
          if (graph[from] == null) {
              graph[from] = [to];
          }
          else {
              graph[from].push(to);
          }
      }
      
      for (let [from, to] of edges.map(r => r.split("-"))) { // Tách các phần tử r[i] thành 2 xâu ngăn cách bởi dấu "-" và gán from, to 2 giá trị này
          addEdge(from, to);
          addEdge(to, from);
      }
      return graph;
  }

  function addNodes(edges) {
    let Nodes = [];
    
    function addNodes(node) {
      if (!Nodes.some(n  => n == node)) {
        Nodes.push(node);
      }
    }

    for (let [from, to] of edges.map(r => r.split("-"))) {
      addNodes(from);
      addNodes(to);
    }

    return Nodes;
  }

  const nodes = addNodes(roads);
  const roadGraph = buildGraph(roads);

  let VillageState = class VillageState {
      // Lớp VillageState thể hiện trạng thái hiện tại của làng, robot, các bưu kiện
      // place: thể hiện vị trí hiện tại của robot
      // parcels: Dãy thể hiện trạng thái của các bưu kiện
      // 	    bao gồm place: 	vị trí hiện tại của bưu kiện
      //	    	    address:	vị trí cần đưa bưu kiện đến	
  
      constructor (place, parcels) {
          this.place = place;
          this.parcels = parcels;
      }
      // Hàm tạo, khởi tạo các giá trị place và parcels.
  
      move(destination) {		// Trả về trạng thái của làng sau khi di chuyển đến destination
          if (!roadGraph[this.place].includes(destination)) {
              return this;	// Nếu không thể đến được destination từ vị trí hiện tại, thì ở yên tại chỗ
          }
          else {
              let parcels = this.parcels.map(		// Ánh xạ dãy parcels theo hàm ở dưới
                  p =>
                  {	// Hàm ánh xạ, sau khi hàm này được thực hiện, các bưu kiện sẽ được update các giá trị mới
                      if (p.place != this.place) return p;
                      // Bưu kiện đang xét nằm ở vị trí khác vị trí hiện tại
                      return {place: destination, address: p.address};
  
                      // Robot sẽ đưa những bưu kiện ở vị trí này đến địa điểm tiếp theo trên đường đi
                      // Cập nhật trạng thái tiếp theo của các bưu kiện
                  }
              ).filter(p => p.place != p.address);
              // Robot sẽ để lại những bưu kiện có địa chỉ nhận ở vị trí hiện tại
              // Dòng lệnh này loại bỏ những bưu kiện như thế khỏi danh sách những bưu kiện cần vận chuyển
  
              return new VillageState(destination, parcels);
              // Trả về trạng thái sau khi robot di chuyển đến địa điểm tiếp theo
          }
        }
    };
  
  function runRobot(state, robot, memory) {
      for (let turn = 0;; turn++) {
          if (state.parcels.length == 0) {
          // Vòng for được thực hiện cho đến khi không còn bưu kiện cần giao
              console.log(`Done in ${turn} turns`);
              break;
          }
  
      let action = robot(state, memory);
      // Hành động hiện tại của robot
      state = state.move(action.direction);
      // Trạng thái của robot và các bưu kiện sau khi di chuyển đến điểm tiếp theo
      memory = action.memory;
      // Bộ nhớ của robot được cập nhật
      console.log(`Moved to ${action.direction}`);
      }
  }

  VillageState.random = function(parcelCount = 5) {	// Hàm khởi tạo một trạng thái ngẫu nhiên của các bưu kiện
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        // Gán một địa điểm ngẫu nhiên cho địa chỉ người nhận bưu kiện

        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
            // Gán một địa điểm ngẫu nhiên cho địa chỉ người gửi bưu kiện
        } while (place == address);	// Việc gán giá trị sẽ được lặp lại cho đến khi địa chỉ người gửi và người nhận là khác nhau
        
        parcels.push({place, address});
        // Thêm phần tử bưu kiện mới khởi tạo vào dãy chứa các bưu kiện
    }
    return new VillageState("Post Office", parcels);
};
  
  function randomPick(array) {	// Hàm trả về một phần tử ngẫu nhiên trong mảng array
      let choice = Math.floor(Math.random() * array.length);
      // Math.random(): Trả về một số ngẫu nhiên trong khoảng [0,1]
      // Math.floor(a): Lấy phần nguyên của một số thực a
      // Dòng lệnh trên khai báo biến choice và khởi tạo cho choice một giá trị nằm trong khoảng [0, array.length]
      return array[choice];
  }
  
  function randomRobot(state) {
      return {
          direction: randomPick(roadGraph[state.place])
          // Chọn điểm đến tiếp theo ngẫu nhiên cho robot
      };
  }
  
  const mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
  ];    // Lộ trình được định sẵn cho robot

  function routeRobot(state, memory) {
      if (memory.length == 0) {
          memory = mailRoute;   // Nạp bộ nhớ để robot có thể di chuyển theo đúng đường.
      }

      return {direction: memory[0], memory: memory.slice(1)};
  }

  function findRoute(graph, from, to) {     // Tìm lộ trình nên đi khi đang ở một vị trí "from"
      let work = [{at: from, route: []}];   // Dãy work lưu địa điểm tiếp theo nên đến "at" và lộ trình đưa ta đến đây "route"
      for (let i = 0; i < work.length; i++) {
          let {at, route} = work[i];        // Khởi tạo giá trị at và route là quãng đường nên đi tiếp theo

          for (let place of graph[at]) {    // Những địa điểm có thể đi đến trong bước tiếp theo
              if (place == to) return route.concat(place);  // Nếu từ "at" có thể đi đến thẳng "to", ta thêm "to" vào lộ trình những địa điểm nên đến
              if (!work.some(w => w.at == place)) {                     // Nếu trong mảng work không có lộ trình đi đến điểm "place"
                  work.push({at: place, route: route.concat(place)});   // Thì ta thêm place vào lộ trình công việc (Tức là thêm trạng thái đang ở "place" và lộ trình để đến trạng thái này)
              }
          }
      }
  }

  function goalOrientedRobot({place, parcels}, route) {       // Trả về hướng đi tiếp theo và bộ nhớ của robot sau đó
    if (route.length == 0) {        // Chưa xác định được lộ trình
      let parcel = parcels[0];      // Xét gói bưu kiện tiếp theo cần gửi
      if (parcel.place != place) {  // Nếu vị trí hiện tại không có gói bưu kiện đang xét
        route = findRoute(roadGraph, place, parcel.place);  // Tìm lộ trình đi đến vị trí của gói bưu kiện đang xét
      }
      else {                        // Trường hợp đang ở cùng vị trí với bưu kiện đang xét
        route = findRoute(roadGraph, place, parcel.address);  // Tìm lộ trình giao gói bưu kiện đó
      }
    }
    return {direction: route[0], memory: route.slice(1)};   // Trả về hướng đi là vị trí tiếp theo trong lộ trình đã tìm được ở trên
                                                            // Và lược bỏ hướng đi của bước trước đó trong lộ trình này
  }




  //runRobotAnimation(VillageState.random(), randomRobot); : Robot chạy theo hướng ngẫu nhiên
  //runRobotAnimation(VillageState.random(), routeRobot, []); : Robot chạy theo một lộ trình định sẵn (max: 26 turns)
  runRobotAnimation(VillageState.random(), goalOrientedRobot, []); //: Robot tự tính toán ra hướng đi phù hợp sau mỗi bước đi
  

  let minDist = [];
  const start = randomPick(nodes);

  console.log(roadGraph[start]);

  console.log(`Robot starts at ${start}`);
  
  for (let i of nodes) {
    if (i == start) {
      minDist[i] = 0;
    }
    else {
      minDist[i] = Infinity;
    }
  }

  function BFS(currentPlace, currentWeight) {
    for (let next of roadGraph[currentPlace]) {
      if (minDist[next] > currentWeight + 1) {
        minDist[next] = currentWeight + 1;
        BFS(next, currentWeight + 1);
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