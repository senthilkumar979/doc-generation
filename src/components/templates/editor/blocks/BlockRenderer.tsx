import { BlockType, type Block } from "@/types/template";

import { DividerBlock } from "./DividerBlock";
import { HeaderBlock } from "./HeaderBlock";
import { ImageBlock } from "./ImageBlock";
import { PageBreakBlock } from "./PageBreakBlock";
import { SignatureBlock } from "./SignatureBlock";
import { SpacerBlock } from "./SpacerBlock";
import { TableBlock } from "./TableBlock";
import { TextBlock } from "./TextBlock";
import { TwoColumnBlock } from "./TwoColumnBlock";

interface BlockRendererProps {
  block: Block;
  previewMode: boolean;
}

export function BlockRenderer({ block, previewMode }: BlockRendererProps) {
  switch (block.type) {
    case BlockType.Header:
      return <HeaderBlock block={block} previewMode={previewMode} />;
    case BlockType.Text:
      return <TextBlock block={block} previewMode={previewMode} />;
    case BlockType.Table:
      return <TableBlock block={block} previewMode={previewMode} />;
    case BlockType.Image:
      return <ImageBlock block={block} previewMode={previewMode} />;
    case BlockType.Divider:
      return <DividerBlock block={block} previewMode={previewMode} />;
    case BlockType.Spacer:
      return <SpacerBlock block={block} previewMode={previewMode} />;
    case BlockType.TwoColumn:
      return <TwoColumnBlock block={block} previewMode={previewMode} />;
    case BlockType.Signature:
      return <SignatureBlock block={block} previewMode={previewMode} />;
    case BlockType.PageBreak:
      return <PageBreakBlock block={block} previewMode={previewMode} />;
  }
}
