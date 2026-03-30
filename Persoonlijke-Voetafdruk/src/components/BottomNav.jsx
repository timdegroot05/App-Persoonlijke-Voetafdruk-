import { NavLink } from "react-router-dom"
import { FiActivity, FiBarChart2, FiHome } from "react-icons/fi"
import { HiOutlineCalculator } from "react-icons/hi"
import { LuTrees } from "react-icons/lu"

const navItems = [
  { to: "/home", label: "Home", icon: FiHome },
  { to: "/activiteiten", label: "Acties", icon: FiActivity },
  { to: "/overzicht", label: "Overzicht", icon: FiBarChart2 },
  { to: "/calculator", label: "Calc", icon: HiOutlineCalculator },
  { to: "/bos", label: "Bos", icon: LuTrees },
]

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Hoofdnavigatie">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `bottom-nav-item${isActive ? " active" : ""}`
          }
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            <Icon />
          </span>
          <span className="bottom-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
