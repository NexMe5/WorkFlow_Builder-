import { BaseNode } from './BaseNode';

export const TransformNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Transform"
    subtitle="Map data"
    fields={[
      {
        name: 'operation',
        label: 'Operation',
        type: 'select',
        defaultValue: 'Uppercase',
        options: ['Uppercase', 'Lowercase', 'Trim', 'JSON Parse'],
      },
    ]}
    handles={[
      { type: 'target', position: 'left', id: 'input', label: 'input' },
      { type: 'source', position: 'right', id: 'output', label: 'output' },
    ]}
  />
);

export const FilterNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Filter"
    subtitle="Keep matches"
    fields={[
      {
        name: 'condition',
        label: 'Condition',
        defaultValue: 'score > 0.8',
      },
    ]}
    handles={[
      { type: 'target', position: 'left', id: 'items', label: 'items' },
      { type: 'source', position: 'right', id: 'matched', label: 'matched' },
    ]}
  />
);

export const ApiNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="API"
    subtitle="HTTP request"
    fields={[
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        defaultValue: 'GET',
        options: ['GET', 'POST', 'PUT', 'PATCH'],
      },
      {
        name: 'url',
        label: 'URL',
        defaultValue: 'https://api.example.com',
      },
    ]}
    handles={[
      { type: 'target', position: 'left', id: 'body', label: 'body' },
      { type: 'source', position: 'right', id: 'response', label: 'response' },
    ]}
  />
);

export const BranchNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Branch"
    subtitle="Route by rule"
    fields={[
      {
        name: 'rule',
        label: 'Rule',
        defaultValue: 'status === "ready"',
      },
    ]}
    handles={[
      { type: 'target', position: 'left', id: 'input', label: 'input' },
      { type: 'source', position: 'right', id: 'true', label: 'true', top: '35%' },
      { type: 'source', position: 'right', id: 'false', label: 'false', top: '70%' },
    ]}
  />
);

export const MergeNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Merge"
    subtitle="Combine inputs"
    fields={[
      {
        name: 'strategy',
        label: 'Strategy',
        type: 'select',
        defaultValue: 'Append',
        options: ['Append', 'Merge JSON', 'First Available'],
      },
    ]}
    handles={[
      { type: 'target', position: 'left', id: 'left', label: 'left', top: '35%' },
      { type: 'target', position: 'left', id: 'right', label: 'right', top: '70%' },
      { type: 'source', position: 'right', id: 'merged', label: 'merged' },
    ]}
  />
);
