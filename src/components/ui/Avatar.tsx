import Image from "next/image";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
}

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

const sizePx = { sm: 28, md: 36, lg: 44 };

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, src, size = "md", online }: AvatarProps) {
  const cls = sizeClasses[size];
  const px = sizePx[size];

  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          className={`${cls} rounded-full object-cover ring-2 ring-white dark:ring-stone-950`}
        />
      ) : (
        <div
          className={`${cls} flex items-center justify-center rounded-full bg-stone-200 font-semibold text-stone-600 ring-2 ring-white dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-950`}
          role="img"
          aria-label={name}
        >
          {initials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-stone-950 ${
            online ? "bg-emerald-500" : "bg-stone-400"
          }`}
          role="status"
          aria-label={online ? `${name} is online` : `${name} is offline`}
        />
      )}
    </div>
  );
}
