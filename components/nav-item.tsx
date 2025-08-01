import Link from "next/link";

export default function NavItem({ name, url }: { name: string; url: string }) {
  return (
    <Link href={url}>
      <div className="group relative cursor-pointer rounded-md hover:bg-black/60 transition-all px-2">
        <div className="relative overflow-hidden">
          <span className="block transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            {name}
          </span>
          <span className="absolute inset-0 transform translate-y-0 group-hover:-translate-y-full transition-transform duration-500 ease-out">
            {name}
          </span>
        </div>
      </div>
    </Link>
  );
}
