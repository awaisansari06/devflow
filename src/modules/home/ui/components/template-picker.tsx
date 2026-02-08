"use client";

import { Template } from "@/lib/templates";
import { TemplateGrid } from "@/components/template-grid";
import { useTemplateHistory } from "@/hooks/use-template-history";
import { cn } from "@/lib/utils";

type Props = {
  onPick?: (prompt: string) => void;
  className?: string;
};

export function TemplatePicker({ onPick, className }: Props) {
  const { history, addToHistory, clearHistory } = useTemplateHistory();

  const handleSelectTemplate = (template: Template) => {
    // Add to history
    addToHistory(template.id);

    // Call the onPick callback with the template's prompt
    onPick?.(template.prompt);
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto pt-5", className)}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Choose a Template</h2>
        <p className="text-sm text-muted-foreground">
          Start with a pre-built template or search for something specific
        </p>
      </div>

      <TemplateGrid
        onSelectTemplate={handleSelectTemplate}
        recentlyUsedIds={history}
        onClearHistory={clearHistory}
      />
    </div>
  );
}
