import NavItem from "./nav-item";

const navItems = [
  { name: "Inicio", url: "/" },
  { name: "Fixture", url: "/fixture" },
  // { name: "Plantel", url: "/plantel" },
  // { name: "Noticias", url: "/noticias" },
];

export function Header() {
  return (
    <header className="relative z-10 flex gap-4 font-bold px-10 pt-4">
      <nav className="flex gap-2">
        {navItems.map((item) => (
          <NavItem key={item.name} name={item.name} url={item.url} />
        ))}
      </nav>
    </header>
  );
}
