import {
  DEFAULT_VIEWPORT,
  FIT_VIEW_OPTIONS,
  MAX_ZOOM,
  MIN_ZOOM,
  findAvailablePosition,
  getNodeDimensions,
  layoutPipeline,
} from './features/pipeline-builder/lib/builderUtils';

describe('builder viewport configuration', () => {
  test('starts nodes at their authored scale', () => {
    expect(DEFAULT_VIEWPORT).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  test('keeps interactive and fitted zoom inside production limits', () => {
    expect(MIN_ZOOM).toBeGreaterThan(0);
    expect(DEFAULT_VIEWPORT.zoom).toBeGreaterThanOrEqual(MIN_ZOOM);
    expect(DEFAULT_VIEWPORT.zoom).toBeLessThanOrEqual(MAX_ZOOM);
    expect(FIT_VIEW_OPTIONS.minZoom).toBeGreaterThanOrEqual(MIN_ZOOM);
    expect(FIT_VIEW_OPTIONS.maxZoom).toBeLessThanOrEqual(MAX_ZOOM);
  });
});

describe('automatic pipeline layout', () => {
  test('orders a connected graph from left to right without overlap', () => {
    const nodes = [
      { id: 'input-1', type: 'customInput', position: { x: 0, y: 0 }, data: { label: 'Input' } },
      { id: 'text-1', type: 'text', position: { x: 0, y: 0 }, data: { label: 'Text' } },
      { id: 'output-1', type: 'customOutput', position: { x: 0, y: 0 }, data: { label: 'Output' } },
    ];
    const edges = [
      { id: 'e1', source: 'input-1', target: 'text-1' },
      { id: 'e2', source: 'text-1', target: 'output-1' },
    ];
    const layouted = layoutPipeline(nodes, edges);

    expect(layouted[0].position.x).toBeLessThan(layouted[1].position.x);
    expect(layouted[1].position.x).toBeLessThan(layouted[2].position.x);
    expect(layouted[0].data).toBe(nodes[0].data);
  });
});

describe('smart node placement', () => {
  test('keeps a requested open position and snaps it to the grid', () => {
    expect(findAvailablePosition([], { x: 107, y: 94 }, 'customInput')).toEqual({ x: 100, y: 100 });
  });

  test('moves a new node away from an occupied drop position', () => {
    const existingNode = {
      id: 'customInput-1',
      type: 'customInput',
      position: { x: 100, y: 100 },
      ...getNodeDimensions('customInput'),
    };
    const nextPosition = findAvailablePosition([existingNode], { x: 100, y: 100 }, 'customOutput');

    expect(nextPosition).toEqual({ x: 100, y: 360 });
    expect(nextPosition.x).toBeGreaterThanOrEqual(20);
    expect(nextPosition.y).toBeGreaterThanOrEqual(20);
  });
});
