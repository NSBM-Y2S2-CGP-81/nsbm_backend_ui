// components/EventCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  hall: string;
  status: "upcoming" | "past" | "cancelled";
  image: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventCard({
  title,
  date,
  location,
  hall,
  status,
  image,
  onEdit,
  onDelete,
}: EventCardProps) {
  const statusColor = {
    upcoming: "bg-green-500",
    past: "bg-gray-500",
    cancelled: "bg-red-500",
  };

  return (
    <Card className="rounded-2xl overflow-hidden shadow-md dark:bg-muted">
      <img src={image} alt={title} className="w-full h-40 object-cover" />
      <CardContent className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{date} • {location}</p>
        <p className="text-sm text-muted-foreground">Hall: {hall}</p>
        <Badge className={statusColor[status]}>{status}</Badge>
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

