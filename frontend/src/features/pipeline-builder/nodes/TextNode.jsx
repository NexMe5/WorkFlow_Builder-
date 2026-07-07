import { useEffect, useMemo, useState } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import { BaseNode } from './BaseNode';

const variablePattern = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

const extractVariables = (text) => {
  const variables = new Set();
  let match = variablePattern.exec(text);

  while (match) {
    variables.add(match[1]);
    match = variablePattern.exec(text);
  }

  variablePattern.lastIndex = 0;
  return Array.from(variables);
};

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const updateNodeInternals = useUpdateNodeInternals();

  const variables = useMemo(() => extractVariables(currText), [currText]);
  const variableKey = variables.join('|');
  const longestLineLength = Math.max(12, ...currText.split('\n').map((line) => line.length));
  const nodeWidth = Math.min(520, Math.max(280, longestLineLength * 8 + 96));

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals, variableKey]);

  return (
    <BaseNode
      id={id}
      data={data}
      title="Text"
      subtitle="Template"
      width={nodeWidth}
      fields={[
        {
          name: 'text',
          label: 'Text',
          type: 'textarea',
          rows: 3,
          defaultValue: currText,
          placeholder: 'Write text with {{ variables }}',
        },
      ]}
      handles={[
        ...variables.map((variable, index) => ({
          type: 'target',
          position: 'left',
          id: `var-${variable}`,
          label: variable,
          top: `${((index + 1) / (variables.length + 1)) * 100}%`,
        })),
        { type: 'source', position: 'right', id: 'output', label: 'text' },
      ]}
      onFieldChange={(fieldName, value) => {
        if (fieldName === 'text') {
          setCurrText(value);
        }
      }}
    />
  );
};
