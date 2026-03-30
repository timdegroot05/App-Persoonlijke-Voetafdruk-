import { FiHome } from "react-icons/fi"
import { LuCarFront, LuSalad, LuZap } from "react-icons/lu"

function CategoryNav({category}){

  return(

    <div className="category-nav">

      <div className={category === "voeding" ? "icon active" : "icon"}><LuSalad /></div>

      <div className={category === "transport" ? "icon active" : "icon"}><LuCarFront /></div>

      <div className={category === "energie" ? "icon active" : "icon"}><LuZap /></div>

      <div className={category === "wonen" ? "icon active" : "icon"}><FiHome /></div>

    </div>

  )

}

export default CategoryNav
