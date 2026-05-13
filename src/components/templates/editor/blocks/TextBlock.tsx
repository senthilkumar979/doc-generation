"use client";

import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import { extractVariableKeys } from "@/lib/templates/template-variables";
import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import { renderEditText, renderPreviewText, useTemplateVariables, type BlockComponentProps } from "./block-renderer-types";

type TextBlockType = Extract<Block, { type: BlockType.Text }>;

export function TextBlock({ block, previewMode }: BlockComponentProps) {
  const textBlock = block as TextBlockType;
  const variables = useTemplateVariables();
  const updateBlockContent = useTemplateEditorStore((state) => state.updateBlockContent);

  return (
    <div
      className="whitespace-pre-wrap text-sm leading-6"
      contentEditable={!previewMode}
      suppressContentEditableWarning
      style={blockStylesToCss(textBlock.styles)}
      onInput={(event) => {
        const text = event.currentTarget.innerText;
        if (extractVariableKeys(text).length > 0) updateBlockContent(textBlock.id, { text });
      }}
      onBlur={(event) => updateBlockContent(textBlock.id, { text: event.currentTarget.innerText })}
    >
      {previewMode ? renderPreviewText(textBlock.content.text, variables) : renderEditText(textBlock.content.text)}
    </div>
  );
}
