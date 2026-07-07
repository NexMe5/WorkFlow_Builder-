// toolbar.js

import { X } from 'lucide-react';
import { nodePalette } from '../nodes/nodeRegistry';
import { usePipelineStore as useStore } from '../store/pipelineStore';
import { NodePaletteItem } from './NodePaletteItem';
import styles from './NodePalette.module.css';

const cx = (...classNames) => classNames.filter(Boolean).join(' ');

export const NodePalette = ({ isOpen = false, onClose }) => {
    const addNodeOfType = useStore((state) => state.addNodeOfType);

    const handleSelectNode = (type) => {
      addNodeOfType(type);
      onClose?.();
    };

    return (
        <section
          className={cx(styles.palette, isOpen && styles.open)}
          aria-label="Node palette"
          aria-hidden={!isOpen ? undefined : false}
        >
            <div className={styles.title}>
                <span>Node Palette</span>
                <button className={styles.close} type="button" onClick={onClose} aria-label="Close node palette" title="Close node palette">
                  <X size={20} aria-hidden="true" />
                </button>
            </div>
            <div className={styles.grid}>
                {nodePalette.map((node) => (
                    <NodePaletteItem
                      key={node.type}
                      type={node.type}
                      label={node.label}
                      variant={node.variant}
                      onSelect={handleSelectNode}
                    />
                ))}
            </div>
        </section>
    );
};
