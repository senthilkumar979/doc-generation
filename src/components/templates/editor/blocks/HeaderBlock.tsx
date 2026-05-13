"use client";

import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import { extractVariableKeys } from "@/lib/templates/template-variables";
import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import { renderPreviewText, useTemplateVariables, type BlockComponentProps } from "./block-renderer-types";

type HeaderBlockType = Extract<Block, { type: BlockType.Header }>;

export function HeaderBlock({ block, previewMode }: BlockComponentProps) {
  const headerBlock = block as HeaderBlockType;
  const variables = useTemplateVariables();
  const updateBlockContent = useTemplateEditorStore((state) => state.updateBlockContent);
  const content = previewMode ? renderPreviewText(headerBlock.content.text, variables) : headerBlock.content.text;
  const commonProps = {
    contentEditable: !previewMode,
    suppressContentEditableWarning: true,
    style: blockStylesToCss(headerBlock.styles),
    onInput: (event: React.FormEvent<HTMLHeadingElement>) => {
      const text = event.currentTarget.innerText;
      if (extractVariableKeys(text).length > 0) updateBlockContent(headerBlock.id, { text });
    },
    onBlur: (event: React.FocusEvent<HTMLHeadingElement>) => updateBlockContent(headerBlock.id, { text: event.currentTarget.innerText }),
  };

  if (headerBlock.content.level === 1) return <h1 className="text-3xl font-semibold" {...commonProps}>{content}</h1>;
  if (headerBlock.content.level === 2) return <h2 className="text-2xl font-semibold" {...commonProps}>{content}</h2>;
  return <h3 className="text-xl font-semibold" {...commonProps}>{content}</h3>;
}
