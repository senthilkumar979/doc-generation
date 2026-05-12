/* eslint-disable jsx-a11y/alt-text */

import type { ReactElement } from "react";
import { Document, Image, Page, Text, View, pdf } from "@react-pdf/renderer";

import { BlockType, type Block, type Template, type TemplateVariable } from "@/types/template";

import { SignatureBlock, TableBlock, TwoColumnBlock } from "./template-react-pdf-blocks";
import { blockStylesToReactPDF, interpolate, pageStyle, streamToBuffer } from "./template-react-pdf-utils";

type TemplateData = Record<string, unknown>;

interface TemplatePDFDocumentProps {
  template: Template;
  data: TemplateData;
}

export function templateToReactPDF(template: Template, data: TemplateData): ReactElement {
  return <TemplatePDFDocument template={template} data={data} />;
}

export { blockStylesToReactPDF, interpolate };

export function renderBlock(block: Block, data: TemplateData, variables: TemplateVariable[] = []): ReactElement {
  const style = blockStylesToReactPDF(block.styles);

  switch (block.type) {
    case BlockType.Header:
      return (
        <Text key={block.id} style={[{ fontSize: headerFontSize[block.content.level], fontWeight: "bold", marginBottom: 8 }, style]}>
          {interpolate(block.content.text, data, variables)}
        </Text>
      );
    case BlockType.Text:
      return (
        <Text key={block.id} style={[{ fontSize: 11, lineHeight: 1.45, marginBottom: 8 }, style]}>
          {interpolate(block.content.text, data, variables)}
        </Text>
      );
    case BlockType.Table:
      return <TableBlock key={block.id} block={block} data={data} style={style} variables={variables} />;
    case BlockType.Image:
      return (
        <Image
          key={block.id}
          src={interpolate(block.content.src, data, variables)}
          style={[{ width: block.content.width, height: block.content.height, objectFit: block.content.objectFit, marginBottom: 8 }, style]}
        />
      );
    case BlockType.Divider:
      return <View key={block.id} style={[{ borderTopWidth: block.content.thickness, borderTopColor: block.content.color, marginVertical: 8 }, style]} />;
    case BlockType.Spacer:
      return <View key={block.id} style={[{ height: block.content.height }, style]} />;
    case BlockType.TwoColumn:
      return <TwoColumnBlock key={block.id} block={block} data={data} renderBlock={renderBlock} style={style} variables={variables} />;
    case BlockType.Signature:
      return <SignatureBlock key={block.id} block={block} style={style} />;
    case BlockType.PageBreak:
      return <View key={block.id} break />;
  }
}

export function TemplatePDFDocument({ template, data }: TemplatePDFDocumentProps): ReactElement {
  return (
    <Document title={template.name}>
      <Page size={template.pageSize.toUpperCase() as "A4" | "LETTER" | "LEGAL"} orientation={template.orientation} style={pageStyle(template)}>
        {template.blocks.map((block) => renderBlock(block, data, template.variables))}
      </Page>
    </Document>
  );
}

export async function renderTemplateToPDFBuffer(template: Template, data: TemplateData): Promise<Buffer> {
  const document = templateToReactPDF(template, data) as Parameters<typeof pdf>[0];
  const stream = await pdf(document).toBuffer();
  return streamToBuffer(stream);
}

const headerFontSize = { 1: 22, 2: 18, 3: 15 };
