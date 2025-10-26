import { MapPin, Clock } from "lucide-react";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { LikeButton } from "@/components/ui/LikeButton";

interface DogCardProps {
  name: string;
  breed: string;
  age: string;
  distance: string;
  image: string;
  description: string;
  reasons: string[];
  onLike?: (liked: boolean) => void;
}

export function DogCard({ name, breed, age, distance, image, description, reasons, onLike }: DogCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-black/5 transition hover:shadow-md">
      <div className="flex gap-4">
        <div
          className="h-24 w-24 flex-shrink-0 rounded-2xl bg-gradient-to-br ring-1 ring-black/5"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
                {name}
              </h3>
              <p className="text-sm" style={{ color: "var(--ink)", opacity: 0.6 }}>
                {breed} • {age}
              </p>
            </div>
          </div>

          <p className="mb-3 text-sm line-clamp-2" style={{ color: "var(--ink)", opacity: 0.8 }}>
            {description}
          </p>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {reasons.map((reason, i) => (
              <ReasonChip key={i} label={reason} />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--ink)", opacity: 0.6 }}>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {distance}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                En ligne
              </span>
            </div>
            <LikeButton onToggle={onLike} />
          </div>
        </div>
      </div>
    </div>
  );
}
