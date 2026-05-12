import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import type { BlockComponentProps } from "./block-renderer-types";

type SignatureBlockType = Extract<Block, { type: BlockType.Signature }>;

export function SignatureBlock({ block }: BlockComponentProps) {
  const signatureBlock = block as SignatureBlockType;

  return (
    <div className="grid gap-4 pt-8 text-sm" style={blockStylesToCss(signatureBlock.styles)}>
      <div>
        <div className="h-10 border-b border-slate-900" />
        <div className="mt-1 text-xs text-slate-600">{signatureBlock.content.label}</div>
      </div>
      {signatureBlock.content.showDate ? (
        <div className="max-w-48">
          <div className="h-8 border-b border-slate-900" />
          <div className="mt-1 text-xs text-slate-600">Date</div>
        </div>
      ) : null}
    </div>
  );
}
