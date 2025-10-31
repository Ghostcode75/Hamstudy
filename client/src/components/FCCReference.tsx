import { ExternalLink, BookOpen } from "lucide-react";
import { getFCCReferenceLink, formatFCCReference, getFCCReferenceDescription } from "@/utils/fccReferences";
import { Button } from "@/components/ui/button";

interface FCCReferenceProps {
  reference: string | null;
  className?: string;
  showDescription?: boolean;
}

export function FCCReference({ reference, className = "", showDescription = true }: FCCReferenceProps) {
  if (!reference) return null;
  
  const link = getFCCReferenceLink(reference);
  const formatted = formatFCCReference(reference);
  const description = getFCCReferenceDescription(reference);
  
  if (!link) return null;
  
  return (
    <div className={`flex items-start gap-2 ${className}`} data-testid="fcc-reference">
      <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">FCC Part {formatted}</span>
          {showDescription && description && (
            <span className="text-sm text-muted-foreground">- {description}</span>
          )}
        </div>
        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          asChild
          data-testid="link-fcc-reference"
        >
          <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            View Official Regulation
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}
