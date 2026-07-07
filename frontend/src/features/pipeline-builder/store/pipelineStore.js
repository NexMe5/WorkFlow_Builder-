import { createWithEqualityFn } from 'zustand/traditional';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
} from 'reactflow';
import { findAvailablePosition, layoutPipeline } from '../lib/builderUtils';

const historyLimit = 50;

const cloneSnapshot = (state) => ({
  nodes: state.nodes.map((node) => ({ ...node, data: { ...node.data } })),
  edges: state.edges.map((edge) => ({ ...edge })),
});

const withHistory = (state, nextState) => ({
  ...nextState,
  past: [...state.past, cloneSnapshot(state)].slice(-historyLimit),
  future: [],
  dragSnapshot: null,
});

const positionsChanged = (before, after) => before.nodes.some((node) => {
  const currentNode = after.nodes.find((candidate) => candidate.id === node.id);
  return currentNode
    && (currentNode.position.x !== node.position.x || currentNode.position.y !== node.position.y);
});

const replaceNodeIdInHandle = (handleId, previousId, nextId) => {
  if (typeof handleId !== 'string') {
    return handleId;
  }

  return handleId.replace(`${previousId}-`, `${nextId}-`);
};

export const usePipelineStore = createWithEqualityFn((set, get) => ({
  nodeIDs: {},
  nodes: [],
  edges: [],
  past: [],
  future: [],
  dragSnapshot: null,

  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    newIDs[type] = (newIDs[type] || 0) + 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  addNode: (node) => {
    set((state) => withHistory(state, { nodes: [...state.nodes, node] }));
  },

  addNodeOfType: (type, desiredPosition = { x: 80, y: 80 }) => {
    set((state) => {
      const nextNodeIDs = { ...state.nodeIDs };
      nextNodeIDs[type] = (nextNodeIDs[type] || 0) + 1;
      const id = `${type}-${nextNodeIDs[type]}`;
      const node = {
        id,
        type,
        position: findAvailablePosition(state.nodes, desiredPosition, type),
        data: { id, nodeType: type },
      };

      return withHistory(state, {
        nodeIDs: nextNodeIDs,
        nodes: [...state.nodes, node],
      });
    });
  },

  onNodesChange: (changes) => {
    set((state) => {
      const nextNodes = applyNodeChanges(changes, state.nodes);
      const removedNodeIds = new Set(
        changes.filter((change) => change.type === 'remove').map((change) => change.id)
      );

      if (removedNodeIds.size === 0) {
        return { nodes: nextNodes };
      }

      return withHistory(state, {
        nodes: nextNodes,
        edges: state.edges.filter(
          (edge) => !removedNodeIds.has(edge.source) && !removedNodeIds.has(edge.target)
        ),
      });
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const nextEdges = applyEdgeChanges(changes, state.edges);
      const removesEdge = changes.some((change) => change.type === 'remove');
      return removesEdge ? withHistory(state, { edges: nextEdges }) : { edges: nextEdges };
    });
  },

  onConnect: (connection) => {
    set((state) => withHistory(state, {
      edges: addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.Arrow, height: 20, width: 20 },
      }, state.edges),
    }));
  },

  autoLayout: () => {
    set((state) => (
      state.nodes.length < 2
        ? {}
        : withHistory(state, { nodes: layoutPipeline(state.nodes, state.edges) })
    ));
  },

  beginNodeDrag: () => {
    set((state) => (state.dragSnapshot ? {} : { dragSnapshot: cloneSnapshot(state) }));
  },

  endNodeDrag: () => {
    set((state) => {
      if (!state.dragSnapshot || !positionsChanged(state.dragSnapshot, state)) {
        return { dragSnapshot: null };
      }

      return {
        past: [...state.past, state.dragSnapshot].slice(-historyLimit),
        future: [],
        dragSnapshot: null,
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.past.length === 0) {
        return {};
      }

      const previous = state.past[state.past.length - 1];
      return {
        ...previous,
        past: state.past.slice(0, -1),
        future: [cloneSnapshot(state), ...state.future].slice(0, historyLimit),
        dragSnapshot: null,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) {
        return {};
      }

      const next = state.future[0];
      return {
        ...next,
        past: [...state.past, cloneSnapshot(state)].slice(-historyLimit),
        future: state.future.slice(1),
        dragSnapshot: null,
      };
    });
  },

  deleteSelected: () => {
    set((state) => {
      const selectedNodeIds = new Set(
        state.nodes.filter((node) => node.selected).map((node) => node.id)
      );
      const selectedEdgeIds = new Set(
        state.edges.filter((edge) => edge.selected).map((edge) => edge.id)
      );

      if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) {
        return {};
      }

      return withHistory(state, {
        nodes: state.nodes.filter((node) => !selectedNodeIds.has(node.id)),
        edges: state.edges.filter((edge) => (
          !selectedEdgeIds.has(edge.id)
          && !selectedNodeIds.has(edge.source)
          && !selectedNodeIds.has(edge.target)
        )),
      });
    });
  },

  duplicateSelected: () => {
    set((state) => {
      const selectedNodes = state.nodes.filter((node) => node.selected);

      if (selectedNodes.length === 0) {
        return {};
      }

      const nextNodeIDs = { ...state.nodeIDs };
      const occupiedNodes = [...state.nodes];
      const idMap = new Map();
      const duplicates = selectedNodes.map((node) => {
        nextNodeIDs[node.type] = (nextNodeIDs[node.type] || 0) + 1;
        const nextId = `${node.type}-${nextNodeIDs[node.type]}`;
        const position = findAvailablePosition(
          occupiedNodes,
          { x: node.position.x + 60, y: node.position.y + 60 },
          node.type
        );
        const duplicate = {
          ...node,
          id: nextId,
          position,
          selected: true,
          data: { ...node.data, id: nextId, nodeType: node.type },
        };

        idMap.set(node.id, nextId);
        occupiedNodes.push(duplicate);
        return duplicate;
      });
      const selectedIds = new Set(selectedNodes.map((node) => node.id));
      const duplicateEdges = state.edges
        .filter((edge) => selectedIds.has(edge.source) && selectedIds.has(edge.target))
        .map((edge) => {
          const source = idMap.get(edge.source);
          const target = idMap.get(edge.target);
          return {
            ...edge,
            id: `copy-${edge.id}-${source}-${target}`,
            source,
            target,
            sourceHandle: replaceNodeIdInHandle(edge.sourceHandle, edge.source, source),
            targetHandle: replaceNodeIdInHandle(edge.targetHandle, edge.target, target),
            selected: false,
          };
        });

      return withHistory(state, {
        nodeIDs: nextNodeIDs,
        nodes: [
          ...state.nodes.map((node) => ({ ...node, selected: false })),
          ...duplicates,
        ],
        edges: [
          ...state.edges.map((edge) => ({ ...edge, selected: false })),
          ...duplicateEdges,
        ],
      });
    });
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set((state) => ({
      nodes: state.nodes.map((node) => (
        node.id === nodeId
          ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
          : node
      )),
    }));
  },

  resetStore: () => {
    set({
      nodeIDs: {},
      nodes: [],
      edges: [],
      past: [],
      future: [],
      dragSnapshot: null,
    });
  },
}));
