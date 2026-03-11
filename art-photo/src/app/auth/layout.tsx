import { Camera } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-tertiary/20" />
      <div className="absolute -right-16 bottom-1/4 h-48 w-48 rotate-12 rounded-3xl bg-secondary/15" />
      <div className="absolute left-1/4 top-16 h-16 w-16 rounded-full border-4 border-dashed border-quaternary/25" />
      <div className="absolute bottom-20 right-1/3 h-12 w-12 rotate-45 bg-primary/10" />
      <Link href="/" className="relative mb-8 flex items-center gap-3 hover-pop">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground bg-primary shadow-pop">
          <Camera className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Art Photo Studio
        </span>
      </Link>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
