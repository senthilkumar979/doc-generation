import { createBuilderTemplateAction } from "@/actions/create-builder-template";
import { Button } from "@/components/ui/button";

export function CreateBuilderTemplateButton() {
  return (
    <form action={createBuilderTemplateAction}>
      <Button type="submit">New builder template</Button>
    </form>
  );
}
