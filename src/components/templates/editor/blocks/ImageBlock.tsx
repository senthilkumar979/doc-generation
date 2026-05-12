/* eslint-disable @next/next/no-img-element */

import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import type { BlockComponentProps } from "./block-renderer-types";

type ImageBlockType = Extract<Block, { type: BlockType.Image }>;

export function ImageBlock({ block, previewMode }: BlockComponentProps) {
  const imageBlock = block as ImageBlockType;
  const variableName = /\{\{\s*([^}\s]+)\s*\}\}/.exec(imageBlock.content.src)?.[1];

  if (!previewMode && variableName) {
    return (
      <div
        className="flex items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"
        style={{ ...blockStylesToCss(imageBlock.styles), width: imageBlock.content.width, height: imageBlock.content.height }}
      >
        Image from {`{{${variableName}}}`}
      </div>
    );
  }

  if (!imageBlock.content.src) {
    return <div className="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{imageBlock.content.alt || "Image"}</div>;
  }

  return (
    <img
      src={imageBlock.content.src}
      alt={imageBlock.content.alt}
      width={imageBlock.content.width}
      height={imageBlock.content.height}
      className="max-w-full"
      style={{ ...blockStylesToCss(imageBlock.styles), objectFit: imageBlock.content.objectFit }}
    />
  );
}
