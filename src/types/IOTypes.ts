export const IOType = {
  String: 'string' as const,
  Number: 'number' as const,
  Dataset: 'dataset' as const,
  Image: 'image' as const,
  Markdown: 'markdown' as const
} as const;

export type IOType = typeof IOType[keyof typeof IOType];

export type IOValue = string | File | unknown[];

export type IOPort = {
  id: string;
  label: string;
  type: IOType;
  name: string;
  value?: IOValue;
};

export type CellIO = {
  inputs: IOPort[];
  outputs: IOPort[];
}; 