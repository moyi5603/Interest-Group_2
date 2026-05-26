import { cn } from "@/lib/utils";

type Props = {
  coverUrl?: string;
  name: string;
  className?: string;
  rounded?: "lg" | "full";
};

const GroupAvatar = ({
  coverUrl,
  name,
  className,
  rounded = "lg",
}: Props) => {
  const roundClass = rounded === "full" ? "rounded-full" : "rounded-lg";

  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt=""
        className={cn(
          "shrink-0 object-cover",
          roundClass,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-primary to-primary-glow font-bold text-white",
        roundClass,
        className,
      )}
    >
      {name[0]}
    </div>
  );
};

export default GroupAvatar;
