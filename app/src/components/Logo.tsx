import { Home } from "lucide-react";
import Link from "next/link";

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const iconSize = size === "large" ? "w-6 h-6" : "w-5 h-5";
  const boxSize = size === "large" ? "h-11 w-11" : "h-9 w-9";
  const textSize = size === "large" ? "text-xl" : "text-lg";

  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className={`flex ${boxSize} items-center justify-center rounded-xl bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]`}>
        <Home className={`${iconSize} fill-current`} />
      </div>
      <span className={`${textSize} font-bold tracking-tight text-white`}>OpenHouse</span>
    </Link>
  );
}
