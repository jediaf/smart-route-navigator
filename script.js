// Global variables
let map;
let graph;
let startPoint = null;
let endPoint = null;
let pathLayer = null;
let startMarker = null;
let endMarker = null;
let nodeMarkers = [];
let edgeLines = [];

// Initialize map
function initMap() {
  // Istanbul center (default)
  const istanbul = [41.0082, 28.9784];
  map = L.map("map").setView(istanbul, 15);

  // Add OpenStreetMap layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Listen for map click events
  map.on("click", onMapClick);

  // Listen for reset button click
  document.getElementById("resetBtn").addEventListener("click", resetMap);

  // Load graph data
  loadGraphData();
}

// Load graph data
async function loadGraphData() {
  try {
    const response = await fetch("graph-data.json");
    const data = await response.json();

    graph = data;

    // Render the graph on the map
    renderGraph();
  } catch (error) {
    console.error("Error loading graph data:", error);
  }
}

// Render the graph on the map
function renderGraph() {
  // Clear existing node markers
  clearNodeMarkers();

  // Add nodes to the map
  for (const nodeId in graph.nodes) {
    const node = graph.nodes[nodeId];

    const nodeIcon = L.divIcon({
      html: `<div style="background-color: #3498db; border-radius: 50%; width: 12px; height: 12px;"></div>`,
      className: "node-marker",
      iconSize: [12, 12],
    });

    const marker = L.marker([node.lat, node.lng], { icon: nodeIcon })
      .bindTooltip(node.name)
      .addTo(map);

    nodeMarkers.push(marker);
  }

  // Add edges to the map
  renderEdges();
}

// Render edges on the map
function renderEdges() {
  // Clear existing edge lines
  clearEdgeLines();

  // Add edges to the map
  for (const edge of graph.edges) {
    const sourceNode = graph.nodes[edge.source];
    const targetNode = graph.nodes[edge.target];

    const line = L.polyline(
      [
        [sourceNode.lat, sourceNode.lng],
        [targetNode.lat, targetNode.lng],
      ],
      {
        color: "#95a5a6",
        weight: 2,
        opacity: 0.7,
      }
    )
      .bindTooltip(`${edge.description} (${edge.weight}m)`)
      .addTo(map);

    edgeLines.push(line);
  }
}

// Map click event handler
function onMapClick(e) {
  const latlng = e.latlng;

  // Find the closest node
  const closestNode = findClosestNode(latlng);

  if (!startPoint) {
    // First click - set start point
    startPoint = closestNode;

    // Create start marker
    const startIcon = L.divIcon({
      html: `<div style="background-color: green; border-radius: 50%; width: 15px; height: 15px;"></div>`,
      className: "start-marker",
      iconSize: [15, 15],
    });

    startMarker = L.marker([startPoint.lat, startPoint.lng], {
      icon: startIcon,
    })
      .bindTooltip(`Start: ${startPoint.name}`)
      .addTo(map);

    console.log("Start point selected:", startPoint.name);
  } else if (!endPoint) {
    // Second click - set end point

    // Don't allow selecting the same node
    if (closestNode.id === startPoint.id) {
      alert("Please select a different node for the destination.");
      return;
    }

    endPoint = closestNode;

    // Create end marker
    const endIcon = L.divIcon({
      html: `<div style="background-color: red; border-radius: 50%; width: 15px; height: 15px;"></div>`,
      className: "end-marker",
      iconSize: [15, 15],
    });

    endMarker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon })
      .bindTooltip(`Destination: ${endPoint.name}`)
      .addTo(map);

    console.log("End point selected:", endPoint.name);

    // Calculate and show the shortest path
    calculateAndShowPath();
  }
}

// Find the closest node to a latlng
function findClosestNode(latlng) {
  let closestNode = null;
  let minDistance = Infinity;

  for (const nodeId in graph.nodes) {
    const node = graph.nodes[nodeId];
    const distance = calculateDistance(
      latlng.lat,
      latlng.lng,
      node.lat,
      node.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestNode = node;
    }
  }

  return closestNode;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Calculate and show the shortest path
function calculateAndShowPath() {
  // Calculate shortest path using Dijkstra's algorithm
  const dijkstra = new Dijkstra(graph);
  const result = dijkstra.findShortestPath(startPoint.id, endPoint.id);

  if (result.path.length === 0) {
    alert("No path found between these two points!");
    return;
  }

  // Create path coordinates
  const pathCoordinates = [];
  for (const nodeId of result.path) {
    const node = graph.nodes[nodeId];
    pathCoordinates.push([node.lat, node.lng]);
  }

  // Remove existing path layer
  if (pathLayer) {
    map.removeLayer(pathLayer);
  }

  // Show path on map
  pathLayer = L.polyline(pathCoordinates, {
    color: "#2980b9",
    weight: 5,
    opacity: 0.8,
  }).addTo(map);

  // Adjust map to fit the path
  map.fitBounds(pathLayer.getBounds(), { padding: [50, 50] });

  // Show path information
  showPathInfo(result);
}

// Show path information in the panel
function showPathInfo(result) {
  const pathInfoElement = document.getElementById("pathInfo");
  const distanceElement = document.getElementById("distance");
  const durationElement = document.getElementById("duration");
  const stepsElement = document.getElementById("steps");

  // Make information visible
  pathInfoElement.classList.remove("hidden");

  // Display distance
  distanceElement.textContent = result.distance;

  // Calculate estimated time (assuming walking speed of 1.4 m/s)
  const durationMinutes = Math.round(result.distance / (1.4 * 60));
  durationElement.textContent = durationMinutes;

  // Clear steps
  stepsElement.innerHTML = "";

  // Add steps
  if (result.path.length > 1) {
    for (let i = 0; i < result.path.length - 1; i++) {
      const fromNode = graph.nodes[result.path[i]];
      const toNode = graph.nodes[result.path[i + 1]];

      // Find the edge between these two nodes
      const edge = findEdge(fromNode.id, toNode.id);

      const li = document.createElement("li");
      li.textContent = `Go from ${fromNode.name} to ${toNode.name} via ${edge.description} (${edge.weight}m)`;
      stepsElement.appendChild(li);
    }
  }
}

// Find the edge between two nodes
function findEdge(sourceId, targetId) {
  for (const edge of graph.edges) {
    if (
      (edge.source === sourceId && edge.target === targetId) ||
      (edge.source === targetId && edge.target === sourceId)
    ) {
      return edge;
    }
  }
  return null;
}

// Reset the map
function resetMap() {
  // Clear start and end points
  startPoint = null;
  endPoint = null;

  // Clear markers
  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
  }

  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
  }

  // Clear path
  if (pathLayer) {
    map.removeLayer(pathLayer);
    pathLayer = null;
  }

  // Hide info panel
  document.getElementById("pathInfo").classList.add("hidden");

  // Clear steps
  document.getElementById("steps").innerHTML = "";
}

// Clear node markers
function clearNodeMarkers() {
  for (const marker of nodeMarkers) {
    map.removeLayer(marker);
  }
  nodeMarkers = [];
}

// Clear edge lines
function clearEdgeLines() {
  for (const line of edgeLines) {
    map.removeLayer(line);
  }
  edgeLines = [];
}

// When the page loads, initialize the map
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the map
  initMap();
});
