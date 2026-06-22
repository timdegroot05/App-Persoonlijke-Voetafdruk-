import { NavLink } from "react-router-dom"
import { FiActivity, FiAward, FiBarChart2 } from "react-icons/fi"
import { LuLeaf, LuTrees } from "react-icons/lu"

const navItems = [
  { to: "/bos", label: "Bos", icon: LuTrees },
  { to: "/activiteiten", label: "Acties", icon: FiActivity },
  { to: "/missies", label: "Missies", icon: FiAward },
  { to: "/overzicht", label: "Inzicht", icon: FiBarChart2 },
  { to: "/tips", label: "Tips", icon: LuLeaf },
]

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Hoofdnavigatie">
      {navItems.map((item) => {
        const NavIcon = item.icon

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `bottom-nav-item${isActive ? " active" : ""}`
            }
          >
            <span className="bottom-nav-icon" aria-hidden="true">
              <NavIcon />
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export default BottomNav
