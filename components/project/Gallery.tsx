import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";

export default function Gallery({ seed, ratios }: { seed: string; ratios: string[] }) {
  return (
    <div className="flex flex-col gap-6" data-cursor="arrow">
      {ratios.map((r, i) => (
        <Reveal key={i}>
          <BlurImage seed={`${seed}-${i}`} ratio={r} />
        </Reveal>
      ))}
    </div>
  );
}
