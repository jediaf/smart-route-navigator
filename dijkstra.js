/**
 * Dijkstra's algorithm implementation
 * Finds the shortest path on a weighted graph
 */
class Dijkstra {
  constructor(graph) {
    this.graph = graph;
  }

  /**
   * Finds the shortest path between two nodes
   * @param {string} startId - Start node ID
   * @param {string} endId - Destination node ID
   * @returns {Object} - Object containing path information
   */
  findShortestPath(startId, endId) {
    // If start and end nodes are the same
    if (startId === endId) {
      return {
        path: [startId],
        distance: 0,
      };
    }

    const nodes = this.graph.nodes;
    const edges = this.graph.edges;

    // Distance table - distance of all nodes from the start
    const distances = {};
    // To keep track of visited nodes
    const visited = {};
    // To track previous node for each node
    const previous = {};
    // Priority queue for nodes to visit
    const queue = new PriorityQueue();

    // Set initial values for all nodes
    for (const node in nodes) {
      if (node === startId) {
        distances[node] = 0;
        queue.enqueue(node, 0);
      } else {
        distances[node] = Infinity;
        queue.enqueue(node, Infinity);
      }
      previous[node] = null;
    }

    // Main algorithm loop
    while (!queue.isEmpty()) {
      // Get node with lowest distance
      const currentNode = queue.dequeue();

      // If we reached the target node, break
      if (currentNode === endId) break;

      // Mark as visited
      visited[currentNode] = true;

      // Check all neighbors of current node
      for (const edge of edges) {
        if (edge.source === currentNode || edge.target === currentNode) {
          // Find the neighbor node
          const neighbor =
            edge.source === currentNode ? edge.target : edge.source;

          // Skip already visited nodes
          if (visited[neighbor]) continue;

          // Calculate new distance
          const distance = distances[currentNode] + edge.weight;

          // If new distance is shorter, update
          if (distance < distances[neighbor]) {
            distances[neighbor] = distance;
            previous[neighbor] = currentNode;
            queue.updatePriority(neighbor, distance);
          }
        }
      }
    }

    // If target node is unreachable
    if (distances[endId] === Infinity) {
      return {
        path: [],
        distance: Infinity,
      };
    }

    // Build the shortest path
    const path = [];
    let current = endId;

    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    return {
      path: path,
      distance: distances[endId],
    };
  }
}

/**
 * Priority Queue implementation
 * Required for Dijkstra's algorithm
 */
class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }

  dequeue() {
    return this.values.shift().val;
  }

  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }

  isEmpty() {
    return this.values.length === 0;
  }

  updatePriority(val, priority) {
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i].val === val) {
        this.values[i].priority = priority;
        break;
      }
    }
    this.sort();
  }
}
