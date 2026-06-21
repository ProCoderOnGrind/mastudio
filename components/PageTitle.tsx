export default function PageTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h1 className={`page-title px-5 pt-10 pb-8 ${className}`}>{children}</h1>;
}
