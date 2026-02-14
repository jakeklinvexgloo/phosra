import type { MovementEntry } from "@/lib/movements"

const sizes = {
  sm: { img: "w-5 h-5", emoji: "text-lg" },
  md: { img: "w-7 h-7", emoji: "text-2xl" },
  lg: { img: "w-8 h-8", emoji: "text-3xl" },
  xl: { img: "w-10 h-10", emoji: "text-4xl" },
}

export function MovementIcon({
  movement,
  size = "md",
}: {
  movement: MovementEntry
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const s = sizes[size]
  if (movement.iconUrl) {
    return (
      <img
        src={movement.iconUrl}
        alt=""
        className={`${s.img} rounded-md object-contain`}
      />
    )
  }
  return <span className={s.emoji}>{movement.iconEmoji}</span>
}
