import { BaseNode } from './BaseNode';

export const LLMNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="LLM"
      subtitle="Generate response"
      fields={[
        {
          name: 'model',
          label: 'Model',
          type: 'select',
          defaultValue: 'GPT-4o',
          options: ['GPT-4o', 'Claude', 'Local'],
        },
      ]}
      handles={[
        { type: 'target', position: 'left', id: 'system', label: 'system', top: '35%' },
        { type: 'target', position: 'left', id: 'prompt', label: 'prompt', top: '70%' },
        { type: 'source', position: 'right', id: 'response', label: 'response' },
      ]}
    />
  );
};
