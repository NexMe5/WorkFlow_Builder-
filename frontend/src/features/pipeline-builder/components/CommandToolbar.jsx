import {
  CopyPlus,
  Maximize2,
  Redo2,
  Shapes,
  Sparkles,
  Trash2,
  Undo2,
} from 'lucide-react';
import { usePipelineStore as useStore } from '../store/pipelineStore';
import styles from './CommandToolbar.module.css';

const CommandButton = ({ label, icon: Icon, disabled = false, onClick, className = '' }) => (
  <button
    type="button"
    className={[styles.button, className].filter(Boolean).join(' ')}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
  >
    <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
  </button>
);

export const CommandToolbar = ({ onFitView, onOpenPalette }) => {
  const nodeCount = useStore((state) => state.nodes.length);
  const selectedCount = useStore((state) => (
    state.nodes.filter((node) => node.selected).length
    + state.edges.filter((edge) => edge.selected).length
  ));
  const canUndo = useStore((state) => state.past.length > 0);
  const canRedo = useStore((state) => state.future.length > 0);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const duplicateSelected = useStore((state) => state.duplicateSelected);
  const deleteSelected = useStore((state) => state.deleteSelected);
  const autoLayout = useStore((state) => state.autoLayout);

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Builder commands">
      <div className={styles.group}>
        <CommandButton label="Undo" icon={Undo2} onClick={undo} disabled={!canUndo} />
        <CommandButton label="Redo" icon={Redo2} onClick={redo} disabled={!canRedo} />
        <span className={styles.separator} aria-hidden="true" />
        <CommandButton label="Duplicate selected" icon={CopyPlus} onClick={duplicateSelected} disabled={selectedCount === 0} />
        <CommandButton label="Delete selected" icon={Trash2} onClick={deleteSelected} disabled={selectedCount === 0} />
        <span className={styles.separator} aria-hidden="true" />
        <CommandButton label="Auto layout" icon={Sparkles} onClick={autoLayout} disabled={nodeCount < 2} />
        <CommandButton label="Fit workflow to view" icon={Maximize2} onClick={onFitView} disabled={nodeCount === 0} />
      </div>
      <CommandButton label="Open node palette" icon={Shapes} onClick={onOpenPalette} className={styles.nodesButton} />
    </div>
  );
};
