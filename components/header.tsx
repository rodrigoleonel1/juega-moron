import NavItem from "./nav-item";

const navItems = [
  { name: "Inicio", url: "/" },
  { name: "Fixture", url: "/fixture" },
  { name: "Plantel", url: "/plantel" },
];

export function Header() {
  return (
    <header className="relative z-10 flex gap-4 font-bold px-10 pt-4 md: justify-center">
      <nav>
        <ul className="m-0 flex list-none gap-2 p-0">
          {navItems.map((item) => (
            <NavItem key={item.name} name={item.name} url={item.url} />
          ))}
        </ul>
      </nav>
    </header>
  );
}
