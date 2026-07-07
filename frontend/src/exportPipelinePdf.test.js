import { prepareEdgesForExport } from './features/pipeline-builder/lib/exportPipelinePdf';

describe('PDF connector preparation', () => {
  test('inlines connector and arrowhead styles, then restores the live SVG', () => {
    const viewport = document.createElement('div');
    viewport.innerHTML = `
      <svg>
        <defs>
          <marker class="react-flow__arrowhead">
            <polyline stroke="#b1b1b7" stroke-width="1" fill="none" />
          </marker>
        </defs>
        <path class="react-flow__edge-path" fill="none" />
      </svg>
    `;
    const path = viewport.querySelector('.react-flow__edge-path');
    const arrowhead = viewport.querySelector('.react-flow__arrowhead polyline');

    const restore = prepareEdgesForExport(viewport);

    expect(path.getAttribute('stroke')).toBe('#2563eb');
    expect(path.getAttribute('stroke-width')).toBe('3');
    expect(path.getAttribute('stroke-dasharray')).toBe('none');
    expect(arrowhead.getAttribute('stroke')).toBe('#2563eb');
    expect(arrowhead.getAttribute('stroke-width')).toBe('2.5');

    restore();

    expect(path.hasAttribute('stroke')).toBe(false);
    expect(path.hasAttribute('stroke-width')).toBe(false);
    expect(arrowhead.getAttribute('stroke')).toBe('#b1b1b7');
    expect(arrowhead.getAttribute('stroke-width')).toBe('1');
  });
});
