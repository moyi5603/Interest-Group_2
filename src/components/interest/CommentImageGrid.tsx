import { cn } from "@/lib/utils";

type Props = {
  imageUrls: string[];
  onImageClick?: (index: number) => void;
  className?: string;
};

const CommentImageGrid = ({ imageUrls, onImageClick, className }: Props) => {
  if (imageUrls.length === 0) return null;

  return (
    <div className={cn("mt-2 grid grid-cols-3 gap-1", className)}>
      {imageUrls.map((url, index) => (
        <button
          key={`${url}-${index}`}
          type="button"
          onClick={() => onImageClick?.(index)}
          className="aspect-square w-full overflow-hidden rounded-lg bg-muted"
        >
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};

export default CommentImageGrid;
