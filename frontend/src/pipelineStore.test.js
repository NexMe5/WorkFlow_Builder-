import { usePipelineStore as useStore } from './features/pipeline-builder/store/pipelineStore';

const inputNode = {
  id: 'customInput-1',
  type: 'customInput',
  position: { x: 100, y: 100 },
  data: { id: 'customInput-1', nodeType: 'customInput' },
};

describe('pipeline editing history', () => {
  beforeEach(() => {
    useStore.getState().resetStore();
  });

  test('undoes and redoes node creation', () => {
    useStore.getState().addNode(inputNode);
    expect(useStore.getState().nodes).toHaveLength(1);

    useStore.getState().undo();
    expect(useStore.getState().nodes).toHaveLength(0);

    useStore.getState().redo();
    expect(useStore.getState().nodes).toHaveLength(1);
  });

  test('adds palette nodes with unique IDs and collision-aware placement', () => {
    useStore.getState().addNodeOfType('customInput');
    useStore.getState().addNodeOfType('customInput');
    const [first, second] = useStore.getState().nodes;

    expect(first.id).toBe('customInput-1');
    expect(second.id).toBe('customInput-2');
    expect(second.position).not.toEqual(first.position);
  });

  test('duplicates selected nodes into an available position', () => {
    useStore.setState({
      nodeIDs: { customInput: 1 },
      nodes: [{ ...inputNode, selected: true }],
    });

    useStore.getState().duplicateSelected();
    const state = useStore.getState();

    expect(state.nodes).toHaveLength(2);
    expect(state.nodes[1].id).toBe('customInput-2');
    expect(state.nodes[1].position).not.toEqual(inputNode.position);
    expect(state.nodes[1].selected).toBe(true);
  });

  test('deletes selected nodes and connected edges, then restores them', () => {
    useStore.setState({
      nodes: [
        { ...inputNode, selected: true },
        { id: 'text-1', type: 'text', position: { x: 500, y: 100 }, data: {} },
      ],
      edges: [{ id: 'e1', source: 'customInput-1', target: 'text-1' }],
    });

    useStore.getState().deleteSelected();
    expect(useStore.getState().nodes).toHaveLength(1);
    expect(useStore.getState().edges).toHaveLength(0);

    useStore.getState().undo();
    expect(useStore.getState().nodes).toHaveLength(2);
    expect(useStore.getState().edges).toHaveLength(1);
  });
});
