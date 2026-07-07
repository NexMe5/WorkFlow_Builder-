import styles from './NodePalette.module.css';

export const NodePaletteItem = ({ type, label, variant, onSelect }) => {
    const onDragStart = (event, nodeType) => {
      const appData = { nodeType }
      event.currentTarget.classList.add(styles.dragging);
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };
  
    return (
      <button
        type="button"
        className={[styles.item, styles[variant]].filter(Boolean).join(' ')}
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => event.currentTarget.classList.remove(styles.dragging)}
        onClick={() => onSelect?.(type)}
        title={`Drag or click to add ${label}`}
        draggable
      >
          <span>{label}</span>
      </button>
    );
  };
  
