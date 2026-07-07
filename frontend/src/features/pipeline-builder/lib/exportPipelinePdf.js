import { getRectOfNodes, getTransformForBounds } from 'reactflow';
import { getNodeDimensions } from './builderUtils';

const EXPORT_WIDTH = 1800;
const EXPORT_HEIGHT = 1040;
const EXPORT_PADDING = 0.12;
const PDF_MARGIN = 10;
const PDF_HEADER_HEIGHT = 28;
const PDF_FOOTER_HEIGHT = 10;
const EXPORT_EDGE_COLOR = '#2563eb';

const applyTemporaryAttributes = (element, attributes) => {
  const originalAttributes = Object.keys(attributes).map((name) => ({
    name,
    value: element.getAttribute(name),
  }));

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  return () => {
    originalAttributes.forEach(({ name, value }) => {
      if (value === null) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value);
      }
    });
  };
};

export const prepareEdgesForExport = (viewportElement) => {
  const restoreCallbacks = [];

  viewportElement.querySelectorAll('.react-flow__edge-path').forEach((path) => {
    restoreCallbacks.push(applyTemporaryAttributes(path, {
      stroke: EXPORT_EDGE_COLOR,
      'stroke-width': '3',
      'stroke-dasharray': 'none',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }));
  });

  viewportElement.querySelectorAll('.react-flow__arrowhead polyline').forEach((arrowhead) => {
    restoreCallbacks.push(applyTemporaryAttributes(arrowhead, {
      stroke: EXPORT_EDGE_COLOR,
      'stroke-width': '2.5',
      fill: 'none',
    }));
  });

  return () => {
    restoreCallbacks.reverse().forEach((restore) => restore());
  };
};

const getExportFilename = () => {
  const date = new Date().toISOString().slice(0, 10);
  return `pipeline-workflow-${date}.pdf`;
};

const addSummaryPill = (pdf, label, value, x, width, color) => {
  pdf.setFillColor(...color);
  pdf.roundedRect(x, 17, width, 8, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${label}: ${value}`, x + width / 2, 22.2, { align: 'center' });
};

export async function exportPipelinePdf({ nodes, summary }) {
  if (!nodes.length) {
    throw new Error('Add at least one node before exporting.');
  }

  const viewportElement = document.querySelector(
    '[data-pipeline-canvas] .react-flow__viewport'
  );

  if (!viewportElement) {
    throw new Error('The workflow canvas is not ready yet.');
  }

  const [{ toPng }, { jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
  ]);
  const nodesWithDimensions = nodes.map((node) => ({
    ...node,
    ...getNodeDimensions(node),
  }));
  const bounds = getRectOfNodes(nodesWithDimensions);
  const [x, y, zoom] = getTransformForBounds(
    bounds,
    EXPORT_WIDTH,
    EXPORT_HEIGHT,
    0.1,
    2,
    EXPORT_PADDING
  );
  const restoreEdges = prepareEdgesForExport(viewportElement);
  let diagram;

  try {
    diagram = await toPng(viewportElement, {
      backgroundColor: '#f8fafc',
      cacheBust: true,
      height: EXPORT_HEIGHT,
      pixelRatio: 1.5,
      style: {
        height: `${EXPORT_HEIGHT}px`,
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        width: `${EXPORT_WIDTH}px`,
      },
      width: EXPORT_WIDTH,
    });
  } finally {
    restoreEdges();
  }

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth - PDF_MARGIN * 2;
  const imageHeight = pageHeight - PDF_HEADER_HEIGHT - PDF_FOOTER_HEIGHT;

  pdf.setProperties({
    title: 'Pipeline Studio Workflow',
    subject: 'Exported workflow diagram',
    author: 'Pipeline Studio',
    creator: 'Pipeline Studio',
  });
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.text('Pipeline Studio Workflow', PDF_MARGIN, 12);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Generated ${new Date().toLocaleString()}`, PDF_MARGIN, 16.2);

  addSummaryPill(pdf, 'Nodes', summary.num_nodes, pageWidth - 104, 27, [37, 99, 235]);
  addSummaryPill(pdf, 'Edges', summary.num_edges, pageWidth - 73, 27, [14, 165, 164]);
  addSummaryPill(
    pdf,
    'Valid DAG',
    summary.is_dag ? 'Yes' : 'No',
    pageWidth - 42,
    32,
    summary.is_dag ? [22, 163, 74] : [220, 38, 38]
  );

  pdf.setDrawColor(203, 213, 225);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(
    PDF_MARGIN,
    PDF_HEADER_HEIGHT,
    imageWidth,
    imageHeight,
    2,
    2,
    'FD'
  );
  pdf.addImage(
    diagram,
    'PNG',
    PDF_MARGIN + 1,
    PDF_HEADER_HEIGHT + 1,
    imageWidth - 2,
    imageHeight - 2,
    undefined,
    'FAST'
  );

  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    'Workflow diagram exported from Pipeline Studio',
    pageWidth / 2,
    pageHeight - 4,
    { align: 'center' }
  );
  pdf.save(getExportFilename());
}
