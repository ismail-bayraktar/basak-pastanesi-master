import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: Omit<React.ComponentProps<"div">, "ref">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
