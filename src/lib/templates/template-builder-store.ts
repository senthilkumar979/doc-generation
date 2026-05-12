import { create } from "zustand";

import { BlockType, createDefaultBlock, type Block, type BlockStyles, type Template, type TemplateVariable } from "@/types/template";

import {
  type BlockDirection,
  duplicateBlockById,
  insertBlockAfter,
  moveBlockById,
  removeBlockById,
  updateBlockById,
} from "./template-builder-blocks";

const HISTORY_LIMIT = 50;

type TemplateMetaUpdates = Partial<Omit<Template, "blocks" | "variables">>;
type BlockContentUpdates = Partial<Block["content"]>;

interface TemplateBuilderState {
  template: Template;
  selectedBlockId: string | null;
  isDirty: boolean;
  history: Template[];
  historyIndex: number;
  previewMode: boolean;
  setTemplate: (template: Template) => void;
  updateTemplateMeta: (meta: TemplateMetaUpdates) => void;
  addBlock: (type: BlockType, afterBlockId?: string) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (id: string, direction: BlockDirection) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  updateBlockStyles: (id: string, styles: Partial<BlockStyles>) => void;
  updateBlockContent: (id: string, content: BlockContentUpdates) => void;
  selectBlock: (id: string | null) => void;
  addVariable: (variable: TemplateVariable) => void;
  removeVariable: (key: string) => void;
  updateVariable: (key: string, updates: Partial<TemplateVariable>) => void;
  undo: () => void;
  redo: () => void;
  setPreviewMode: (val: boolean) => void;
  markClean: () => void;
}

export const useTemplateBuilderStore = create<TemplateBuilderState>((set) => ({
  template: createInitialTemplate(),
  selectedBlockId: null,
  isDirty: false,
  history: [createInitialTemplate()],
  historyIndex: 0,
  previewMode: false,
  setTemplate: (template) => set({ template, history: [cloneTemplate(template)], historyIndex: 0, isDirty: false, selectedBlockId: null }),
  updateTemplateMeta: (meta) => set((state) => commit(state, { ...state.template, ...meta })),
  addBlock: (type, afterBlockId) =>
    set((state) => {
      const block = createDefaultBlock(type);
      const result = afterBlockId ? insertBlockAfter(state.template.blocks, afterBlockId, block) : { blocks: state.template.blocks, changed: false };
      const blocks = result.changed ? result.blocks : [...state.template.blocks, block];
      return commit(state, { ...state.template, blocks }, block.id);
    }),
  removeBlock: (id) =>
    set((state) => {
      const result = removeBlockById(state.template.blocks, id);
      if (!result.changed) return state;
      const selectedBlockId = state.selectedBlockId === id ? null : state.selectedBlockId;
      return commit(state, { ...state.template, blocks: result.blocks }, selectedBlockId);
    }),
  duplicateBlock: (id) =>
    set((state) => {
      const result = duplicateBlockById(state.template.blocks, id);
      if (!result.changed) return state;
      return commit(state, { ...state.template, blocks: result.blocks }, result.duplicatedId ?? state.selectedBlockId);
    }),
  moveBlock: (id, direction) =>
    set((state) => {
      const result = moveBlockById(state.template.blocks, id, direction);
      return result.changed ? commit(state, { ...state.template, blocks: result.blocks }) : state;
    }),
  updateBlock: (id, updates) =>
    set((state) => updateBlockInState(state, id, (block) => ({ ...block, ...updates }) as Block)),
  updateBlockStyles: (id, styles) =>
    set((state) => updateBlockInState(state, id, (block) => ({ ...block, styles: { ...block.styles, ...styles } }) as Block)),
  updateBlockContent: (id, content) =>
    set((state) => updateBlockInState(state, id, (block) => ({ ...block, content: { ...block.content, ...content } }) as Block)),
  selectBlock: (id) => set({ selectedBlockId: id }),
  addVariable: (variable) => set((state) => commit(state, { ...state.template, variables: [...state.template.variables, variable] })),
  removeVariable: (key) =>
    set((state) => commit(state, { ...state.template, variables: state.template.variables.filter((variable) => variable.key !== key) })),
  updateVariable: (key, updates) =>
    set((state) =>
      commit(state, {
        ...state.template,
        variables: state.template.variables.map((variable) => (variable.key === key ? { ...variable, ...updates } : variable)),
      }),
    ),
  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const historyIndex = state.historyIndex - 1;
      return { ...state, template: cloneTemplate(state.history[historyIndex]), historyIndex, isDirty: true };
    }),
  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const historyIndex = state.historyIndex + 1;
      return { ...state, template: cloneTemplate(state.history[historyIndex]), historyIndex, isDirty: true };
    }),
  setPreviewMode: (val) => set({ previewMode: val }),
  markClean: () => set({ isDirty: false }),
}));

function updateBlockInState(state: TemplateBuilderState, id: string, updater: (block: Block) => Block): TemplateBuilderState {
  const result = updateBlockById(state.template.blocks, id, updater);
  return result.changed ? commit(state, { ...state.template, blocks: result.blocks }) : state;
}

function commit(state: TemplateBuilderState, template: Template, selectedBlockId = state.selectedBlockId): TemplateBuilderState {
  const currentHistory = state.history.slice(0, state.historyIndex + 1);
  const history = [...currentHistory, cloneTemplate(template)].slice(-HISTORY_LIMIT);
  return { ...state, template, selectedBlockId, isDirty: true, history, historyIndex: history.length - 1 };
}

function cloneTemplate(template: Template): Template {
  return structuredClone(template);
}

function createInitialTemplate(): Template {
  return {
    id: "",
    name: "Untitled template",
    description: "",
    orgId: "",
    createdAt: "",
    updatedAt: "",
    pageSize: "A4",
    orientation: "portrait",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    variables: [],
    blocks: [],
  };
}
