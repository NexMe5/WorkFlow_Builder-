import { BaseNode } from './BaseNode';

export const OutputNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Output"
      subtitle="Final result"
      fields={[
        {
          name: 'outputName',
          label: 'Name',
          defaultValue: ({ id: nodeId }) => nodeId.replace('customOutput-', 'output_'),
        },
        {
          name: 'outputType',
          label: 'Type',
          type: 'select',
          defaultValue: 'Text',
          options: [
            { value: 'Text', label: 'Text' },
            { value: 'Image', label: 'Image' },
          ],
        },
      ]}
      handles={[{ type: 'target', position: 'left', id: 'value', label: 'value' }]}
    />
  );
};
