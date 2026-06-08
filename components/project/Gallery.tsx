import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  return (
    <div className="flex flex-col gap-6" data-cursor="arrow">
      {images.map((src) => (
        <Reveal key={src}>
          <BlurImage src={src} label={name} ratio="16 / 9" className="max-h-[85vh]" sizes="(max-width: 768px) 100vw, 75vw" />
        </Reveal>
      ))}
    </div>
  );
}
