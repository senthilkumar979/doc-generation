export enum BlockType {
  Header = "header",
  Text = "text",
  Table = "table",
  Image = "image",
  Divider = "divider",
  Spacer = "spacer",
  TwoColumn = "two-column",
  Signature = "signature",
  PageBreak = "page-break",
}

export interface Template {
  id: string;
  name: string;
  description: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  pageSize: PageSize;
  orientation: PageOrientation;
  margins: TemplateMargins;
  variables: TemplateVariable[];
  blocks: Block[];
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: TemplateVariableType;
  defaultValue?: string;
}

export interface BlockStyles {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  fontFamily?: string;
  textAlign?: TextAlign;
  padding?: number | BoxSpacing;
  margin?: number | BoxSpacing;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  width?: number | string;
}

export type Block =
  | HeaderBlock
  | TextBlock
  | TableBlock
  | ImageBlock
  | DividerBlock
  | SpacerBlock
  | TwoColumnBlock
  | SignatureBlock
  | PageBreakBlock;

interface BaseBlock<TType extends BlockType, TContent> {
  id: string;
  type: TType;
  styles: BlockStyles;
  content: TContent;
  locked: boolean;
}

type HeaderBlock = BaseBlock<BlockType.Header, HeaderContent>;
type TextBlock = BaseBlock<BlockType.Text, TextContent>;
type TableBlock = BaseBlock<BlockType.Table, TableContent>;
type ImageBlock = BaseBlock<BlockType.Image, ImageContent>;
type DividerBlock = BaseBlock<BlockType.Divider, DividerContent>;
type SpacerBlock = BaseBlock<BlockType.Spacer, SpacerContent>;
type TwoColumnBlock = BaseBlock<BlockType.TwoColumn, TwoColumnContent>;
type SignatureBlock = BaseBlock<BlockType.Signature, SignatureContent>;
type PageBreakBlock = BaseBlock<BlockType.PageBreak, Record<string, never>>;

interface HeaderContent {
  text: string;
  level: 1 | 2 | 3;
}

interface TextContent {
  text: string;
}

interface TableContent {
  columns: TableColumn[];
  rows: TemplateVariableReference | TableRow[];
  showHeader: boolean;
  alternateRowColor: string;
  headerStyle: BlockStyles;
}

interface TableColumn {
  key: string;
  label: string;
  align: TextAlign;
}

interface ImageContent {
  src: string | TemplateVariableReference;
  alt: string;
  width: number;
  height: number;
  objectFit: "contain" | "cover";
}

interface DividerContent {
  thickness: number;
  color: string;
}

interface SpacerContent {
  height: number;
}

interface TwoColumnContent {
  left: Block[];
  right: Block[];
  split: "50-50" | "60-40" | "40-60" | "70-30";
}

interface SignatureContent {
  label: string;
  showDate: boolean;
}

interface TemplateMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

type PageSize = "A4" | "Letter" | "Legal";
type PageOrientation = "portrait" | "landscape";
type TemplateVariableType = "text" | "number" | "date" | "currency" | "boolean";
type TemplateVariableReference = `{{${string}}}`;
type TableRow = Record<string, string | number | boolean | null>;
type TextAlign = "left" | "center" | "right";
type FontWeight = "normal" | "medium" | "semibold" | "bold" | number;

interface BoxSpacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}
