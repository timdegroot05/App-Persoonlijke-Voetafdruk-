import { FiHome } from "react-icons/fi"
import { LuCarFront, LuSalad, LuShoppingBag, LuZap } from "react-icons/lu"

const iconByCategory = {
  voeding: LuSalad,
  transport: LuCarFront,
  energie: LuZap,
  wonen: FiHome,
  consumptie: LuShoppingBag,
}

function CategoryNav({ category, categories = [] }) {
  const visibleCategories =
    categories.length > 0
      ? categories
      : ["voeding", "transport", "energie", "wonen", "consumptie"]

  return (
    <div className="category-nav">
      {visibleCategories.map((item) => {
        const Icon = iconByCategory[item]

        return (
          <div key={item} className={category === item ? "icon active" : "icon"}>
            <Icon />
          </div>
        )
      })}
    </div>
  )
}

export default CategoryNav
