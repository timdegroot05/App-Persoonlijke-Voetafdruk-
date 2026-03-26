import { NavLink } from "react-router-dom"

const navItems = [
  { to: "/home", label: "Home", icon: "🏠" },
  { to: "/activiteiten", label: "Acties", icon: "🌱" },
  { to: "/overzicht", label: "Overzicht", icon: "📊" },
  { to: "/calculator", label: "Calc", icon: "🧮" },
  { to: "/bos", label: "Bos", icon: "🌳" },
]

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Hoofdnavigatie">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav-item${isActive ? " active" : ""}`
          }
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
