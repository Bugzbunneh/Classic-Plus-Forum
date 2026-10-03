import Link from "next/link";
import { GameIcon } from "@/components/game-icon";
import { PageContainer } from "@/components/page-container";

export default function NotFound() {
  return (
    <PageContainer width="narrow" className="items-center justify-center text-center">
      <div className="flex animate-rise-in flex-col items-center gap-4">
        <GameIcon name="compass" className="size-20 animate-float text-gold-400 drop-shadow-[0_0_18px_rgb(224_189_94/0.45)]" />
        <h1 className="heading text-gold-gradient text-6xl">404</h1>
        <p className="text-charcoal-300">
          This page doesn&apos;t exist. Maybe it wandered off into Silithus.
        </p>
        <Link href="/" className="btn btn-primary">
          Hearth back to the forum
        </Link>
      </div>
    </PageContainer>
  );
}
