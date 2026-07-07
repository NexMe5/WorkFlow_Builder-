import { BaseNode } from './BaseNode';

export const InputNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Input"
      subtitle="Start data"
      fields={[
        {
          name: 'inputName',
          label: 'Name',
          defaultValue: ({ id: nodeId }) => nodeId.replace('customInput-', 'input_'),
        },
        {
          name: 'inputType',
          label: 'Type',
          type: 'select',
          defaultValue: 'Text',
          options: ['Text', 'File'],
        },
      ]}
      handles={[{ type: 'source', position: 'right', id: 'value', label: 'value' }]}
    />
  );
};
