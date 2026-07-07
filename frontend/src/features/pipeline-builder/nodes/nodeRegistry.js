import { InputNode } from './InputNode';
import { LLMNode } from './LLMNode';
import { OutputNode } from './OutputNode';
import { TextNode } from './TextNode';
import {
  ApiNode,
  BranchNode,
  FilterNode,
  MergeNode,
  TransformNode,
} from './UtilityNodes';

export const nodeRegistry = {
  customInput: { label: 'Input', component: InputNode, variant: 'source' },
  llm: { label: 'LLM', component: LLMNode, variant: 'ai' },
  customOutput: { label: 'Output', component: OutputNode, variant: 'output' },
  text: { label: 'Text', component: TextNode, variant: 'data' },
  transform: { label: 'Transform', component: TransformNode, variant: 'data' },
  filter: { label: 'Filter', component: FilterNode, variant: 'logic' },
  api: { label: 'API', component: ApiNode, variant: 'ai' },
  branch: { label: 'Branch', component: BranchNode, variant: 'logic' },
  merge: { label: 'Merge', component: MergeNode, variant: 'output' },
};

export const nodeTypes = Object.fromEntries(
  Object.entries(nodeRegistry).map(([type, config]) => [type, config.component])
);

export const nodePalette = Object.entries(nodeRegistry).map(([type, config]) => ({
  type,
  label: config.label,
  variant: config.variant,
}));
