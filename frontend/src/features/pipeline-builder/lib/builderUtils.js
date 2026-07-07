import dagre from '@dagrejs/dagre';

export const GRID_SIZE = 20;
export const NODE_GAP = 40;

export const NODE_DIMENSIONS = {
  customInput: { width: 260, height: 220 },
  customOutput: { width: 260, height: 220 },
  llm: { width: 260, height: 180 },
  text: { width: 320, height: 260 },
  transform: { width: 260, height: 220 },
  filter: { width: 260, height: 220 },
  api: { width: 260, height: 260 },
  branch: { width: 260, height: 220 },
  merge: { width: 260, height: 180 },
};

const fallbackDimensions = { width: 260, height: 220 };

export const DEFAULT_VIEWPORT = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const MIN_ZOOM = 0.4;
export const MAX_ZOOM = 1.5;

export const FIT_VIEW_OPTIONS = {
  padding: 0.18,
  minZoom: 0.5,
  maxZoom: 1,
  duration: 240,
};

export const getNodeDimensions = (nodeOrType) => {
  const node = typeof nodeOrType === 'string' ? { type: nodeOrType } : nodeOrType;
  const estimated = NODE_DIMENSIONS[node?.type] || fallbackDimensions;

  return {
    width: node?.width ?? node?.measured?.width ?? estimated.width,
    height: node?.height ?? node?.measured?.height ?? estimated.height,
  };
};

const snapCoordinate = (value) => Math.max(GRID_SIZE, Math.round(value / GRID_SIZE) * GRID_SIZE);

const overlaps = (candidate, existing) => (
  candidate.x < existing.x + existing.width + NODE_GAP
  && candidate.x + candidate.width + NODE_GAP > existing.x
  && candidate.y < existing.y + existing.height + NODE_GAP
  && candidate.y + candidate.height + NODE_GAP > existing.y
);

const getSearchOffsets = (rings = 24) => {
  const offsets = [];

  for (let x = -rings; x <= rings; x += 1) {
    for (let y = -rings; y <= rings; y += 1) {
      offsets.push({ x, y });
    }
  }

  return offsets.sort((first, second) => {
    const firstDistance = first.x ** 2 + first.y ** 2;
    const secondDistance = second.x ** 2 + second.y ** 2;

    return firstDistance - secondDistance
      || Math.abs(first.x) - Math.abs(second.x)
      || second.y - first.y
      || second.x - first.x;
  });
};

const searchOffsets = getSearchOffsets();

export const findAvailablePosition = (nodes, desiredPosition, nodeType) => {
  const dimensions = getNodeDimensions(nodeType);
  const desired = {
    x: snapCoordinate(desiredPosition.x),
    y: snapCoordinate(desiredPosition.y),
  };
  const existingRects = nodes.map((node) => ({
    ...node.position,
    ...getNodeDimensions(node),
  }));

  for (const offset of searchOffsets) {
    const candidate = {
      x: snapCoordinate(desired.x + offset.x * GRID_SIZE),
      y: snapCoordinate(desired.y + offset.y * GRID_SIZE),
      ...dimensions,
    };

    if (!existingRects.some((existing) => overlaps(candidate, existing))) {
      return { x: candidate.x, y: candidate.y };
    }
  }

  return desired;
};

export const layoutPipeline = (nodes, edges, direction = 'LR') => {
  if (nodes.length === 0) {
    return [];
  }

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: 70,
    ranksep: 110,
    marginx: GRID_SIZE * 2,
    marginy: GRID_SIZE * 2,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, getNodeDimensions(node));
  });

  edges.forEach((edge) => {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);
    const dimensions = getNodeDimensions(node);

    return {
      ...node,
      position: {
        x: snapCoordinate(position.x - dimensions.width / 2),
        y: snapCoordinate(position.y - dimensions.height / 2),
      },
    };
  });
};
