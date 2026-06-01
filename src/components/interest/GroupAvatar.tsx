import { cn } from "@/lib/utils";

type Props = {
  avatarUrl?: string;
  /** @deprecated 使用 avatarUrl */
  coverUrl?: string;
  name: string;
  className?: string;
  rounded?: "lg" | "full";
};

const GroupAvatar = ({
  avatarUrl,
  coverUrl,
  name,
  className,
  rounded = "lg",
}: Props) => {
  const roundClass = rounded === "full" ? "rounded-full" : "rounded-lg";
  const imageUrl = avatarUrl ?? coverUrl;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
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
