// submit.js

import { useState } from 'react';
import { shallow } from 'zustand/shallow';
import { parsePipeline } from '../api/pipelineApi';
import { exportPipelinePdf } from '../lib/exportPipelinePdf';
import { usePipelineStore as useStore } from '../store/pipelineStore';
import styles from './SubmitButton.module.css';

const selector = (state) => ({
    nodes: state.nodes,
    edges: state.edges,
});

export const SubmitButton = () => {
    const { nodes, edges } = useStore(selector, shallow);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState('');

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setStatus('Validating workflow...');

        try {
            const result = await parsePipeline(nodes, edges);
            setStatus('Creating your PDF...');
            await exportPipelinePdf({ nodes, summary: result });
            setStatus(
                `Downloaded PDF - ${result.num_nodes} nodes - ${result.num_edges} edges - ${result.is_dag ? 'Valid DAG' : 'Contains a cycle'}`
            );
        } catch (error) {
            setStatus(`Unable to export workflow: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.bar}>
            <button
                className={styles.button}
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || nodes.length === 0}
            >
                {isSubmitting ? 'Preparing PDF...' : 'Submit & Download PDF'}
            </button>
            <span className={styles.status} role="status" aria-live="polite">
                {nodes.length === 0 ? 'Add a node to enable export' : status}
            </span>
        </div>
    );
};
