import { Badge } from "@/components/ui/badge";

export function PropertyTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" className="h-auto px-3 py-1 text-muted-foreground">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
