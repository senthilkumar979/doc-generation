"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import type { Block, BlockStyles } from "@/types/template";

import { ColorInput, Field, NumberWithUnit, SegmentedControl } from "./properties-panel-fields";

export function PropertiesPanelStyleTab({ block }: { block: Block }) {
  const updateBlockStyles = useTemplateEditorStore((state) => state.updateBlockStyles);
  const updateBlock = useTemplateEditorStore((state) => state.updateBlock);
  const updateStyle = (styles: Partial<BlockStyles>) => updateBlockStyles(block.id, styles);

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <Field label="Text Color">
          <ColorInput value={block.styles.color} onChange={(color) => updateStyle({ color })} />
        </Field>
        <Field label="Background Color">
          <ColorInput value={block.styles.backgroundColor} onChange={(backgroundColor) => updateStyle({ backgroundColor })} />
        </Field>
        <Field label="Border Color">
          <ColorInput value={block.styles.borderColor} onChange={(borderColor) => updateStyle({ borderColor })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Font Size">
          <NumberWithUnit unit="px" value={block.styles.fontSize} onChange={(fontSize) => updateStyle({ fontSize })} />
        </Field>
        <Field label="Border Width">
          <NumberWithUnit unit="px" value={block.styles.borderWidth} onChange={(borderWidth) => updateStyle({ borderWidth })} />
        </Field>
        <Field label="Border Radius">
          <NumberWithUnit unit="px" value={block.styles.borderRadius} onChange={(borderRadius) => updateStyle({ borderRadius })} />
        </Field>
      </div>
      <Field label="Font Weight">
        <SegmentedControl value={weightValue(block.styles.fontWeight)} options={fontWeightOptions} onChange={(fontWeight) => updateStyle({ fontWeight })} />
      </Field>
      <Field label="Text Align">
        <SegmentedControl value={block.styles.textAlign ?? "left"} options={textAlignOptions} onChange={(textAlign) => updateStyle({ textAlign })} />
      </Field>
      <Field label="Font Family">
        <Select value={block.styles.fontFamily ?? ""} onValueChange={(fontFamily) => updateStyle({ fontFamily })}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <SpacingInputs label="Padding" value={block.styles.padding} onChange={(padding) => updateStyle({ padding })} />
      <SpacingInputs label="Margin" value={block.styles.margin} onChange={(margin) => updateStyle({ margin })} />
      <Button variant="outline" size="sm" className="w-full" onClick={() => updateBlock(block.id, { styles: {} })}>
        Reset Styles
      </Button>
    </div>
  );
}

function SpacingInputs({
  label,
  value,
  onChange,
}: {
  label: string;
  value: BlockStyles["padding"];
  onChange: (value: NonNullable<BlockStyles["padding"]>) => void;
}) {
  const spacing = typeof value === "object" && value !== null ? value : {};
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Field key={side} label={side}>
            <NumberWithUnit unit="px" value={spacing[side]} onChange={(next) => onChange({ ...spacing, [side]: next })} />
          </Field>
        ))}
      </div>
    </div>
  );
}

function weightValue(value: BlockStyles["fontWeight"]): "normal" | "medium" | "bold" {
  if (value === "bold" || value === 700) return "bold";
  if (value === "medium" || value === "semibold" || value === 500 || value === 600) return "medium";
  return "normal";
}

const fontWeightOptions = [
  { label: "Normal", value: "normal" },
  { label: "Medium", value: "medium" },
  { label: "Bold", value: "bold" },
] as const;

const textAlignOptions = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
] as const;

const fontFamilies = ["Inter", "Roboto", "Merriweather", "Playfair Display", "Courier New"];
