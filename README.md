# 🧠 Smart Route Navigator

A web-based interactive map application to find the shortest route between two points using **Dijkstra's Algorithm** and **Leaflet.js**.

---

## 🚀 Features

- 📍 Clickable interactive map with custom nodes and roads
- 🔎 Shortest path calculation using Dijkstra’s algorithm
- 🛣️ Route visualization with markers and polyline
- 🧭 Distance and estimated time display
- 🗺️ Location tooltips and edge descriptions
- 🔄 Reset button to clear selection

---
Implementation Summary:
1. Graph Structure
Nodes and edges are defined in a separate graph-data.json file.

Each node has an id, name, and geographic coordinates (lat, lng).

Edges contain source, target, weight, and description.

2. Map Interface
Leaflet.js is used to render a fully interactive map centered on Istanbul.

Nodes are marked visually with custom icons and tooltips.

Edges are drawn using polyline lines, also labeled with tooltip distances.

3. User Interaction
On the first click, the user selects a start point.

On the second click, the destination point is selected.

The closest nodes to the clicked locations are automatically snapped.

4. Path Calculation
A custom implementation of Dijkstra’s Algorithm is used (dijkstra.js).

The algorithm calculates the shortest weighted path between two nodes.

The result includes the full path, total distance, and step-by-step directions.

5. Visualization
The computed shortest path is drawn with a distinct polyline.

Distance and estimated walking time are shown in an info panel.

Route steps include road names and segment lengths.

-----------
How It Works (Example):
User clicks on "Central Station" and then on "Museum".

App finds closest node IDs, e.g. "1" and "9".

Dijkstra’s algorithm runs and returns shortest path: [1, 4, 7, 9].

Map shows blue route with tooltips, steps panel shows directions like:

Go from Central Station to Market Square via Square Street (200m)

------------

## 🧱 Technologies Used

| Component     | Technology        |
|---------------|-------------------|
| Frontend      | HTML, CSS, JavaScript |
| Map Library   | Leaflet.js        |
| Algorithm     | Custom Dijkstra implementation |
| Data Format   | JSON (graph structure) |

---

## 📁 Project Structure
smart-route-navigator/ ├── index.html # Main HTML layout ├── style.css # Styling and layout ├── script.js # Map + logic ├── dijkstra.js # Dijkstra algorithm ├── graph-data.json # Nodes and weighted edges ├── README.md

