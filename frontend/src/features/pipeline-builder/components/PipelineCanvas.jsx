// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { shallow } from 'zustand/shallow';
import { usePipelineStore as useStore } from '../store/pipelineStore';
import { nodeTypes } from '../nodes/nodeRegistry';
import {
  DEFAULT_VIEWPORT,
  FIT_VIEW_OPTIONS,
  GRID_SIZE,
  MAX_ZOOM,
  MIN_ZOOM,
  findAvailablePosition,
  getNodeDimensions,
} from '../lib/builderUtils';
import { CommandToolbar } from './CommandToolbar';
import styles from './PipelineCanvas.module.css';

import 'reactflow/dist/style.css';

const minCanvasHeight = 560;
const canvasBottomPadding = 180;
const proOptions = { hideAttribution: true };
const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  beginNodeDrag: state.beginNodeDrag,
  endNodeDrag: state.endNodeDrag,
  undo: state.undo,
  redo: state.redo,
  deleteSelected: state.deleteSelected,
  duplicateSelected: state.duplicateSelected,
});

export const PipelineCanvas = ({ onOpenPalette }) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      beginNodeDrag,
      endNodeDrag,
      undo,
      redo,
      deleteSelected,
      duplicateSelected,
    } = useStore(selector, shallow);

    const getInitNodeData = (nodeID, type) => {
      return { id: nodeID, nodeType: `${type}` };
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();

          if (!reactFlowInstance) {
            return;
          }
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const projectedPosition = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });
            const position = findAvailablePosition(nodes, projectedPosition, type);

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [addNode, getNodeID, nodes, reactFlowInstance]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const fitWorkflowToView = useCallback(() => {
      reactFlowInstance?.fitView(FIT_VIEW_OPTIONS);
    }, [reactFlowInstance]);

    useEffect(() => {
      const handleKeyboardCommand = (event) => {
        const target = event.target;
        const isEditing = target instanceof HTMLElement && (
          target.isContentEditable
          || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
        );

        if (isEditing) {
          return;
        }

        const commandKey = event.metaKey || event.ctrlKey;
        const key = event.key.toLowerCase();

        if (commandKey && key === 'z') {
          event.preventDefault();
          event.shiftKey ? redo() : undo();
        } else if (commandKey && event.code === 'KeyD') {
          event.preventDefault();
          duplicateSelected();
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault();
          deleteSelected();
        }
      };

      window.addEventListener('keydown', handleKeyboardCommand, true);
      return () => window.removeEventListener('keydown', handleKeyboardCommand, true);
    }, [deleteSelected, duplicateSelected, redo, undo]);

    const canvasHeight = useMemo(() => {
      if (!nodes.length) {
        return minCanvasHeight;
      }

      const lowestNodeBottom = nodes.reduce((lowestBottom, node) => {
        const { height: nodeHeight } = getNodeDimensions(node);
        const nodeBottom = node.position.y + nodeHeight;

        return Math.max(lowestBottom, nodeBottom);
      }, 0);

      return Math.ceil(Math.max(minCanvasHeight, lowestNodeBottom + canvasBottomPadding));
    }, [nodes]);

    return (
      <>
        <CommandToolbar onFitView={fitWorkflowToView} onOpenPalette={onOpenPalette} />
        <div
            ref={reactFlowWrapper}
            className={styles.flowShell}
            style={{ height: `${canvasHeight}px` }}
            data-pipeline-canvas
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStart={beginNodeDrag}
                onNodeDragStop={endNodeDrag}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                defaultViewport={DEFAULT_VIEWPORT}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                fitViewOptions={FIT_VIEW_OPTIONS}
                snapToGrid
                snapGrid={[GRID_SIZE, GRID_SIZE]}
                connectionLineType='smoothstep'
                deleteKeyCode={null}
            >
                <Background color="#d6deef" gap={GRID_SIZE} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
      </>
    )
}
