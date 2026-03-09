function CategoryNav({category}){

  return(

    <div className="category-nav">

      <div className={category === "voeding" ? "icon active" : "icon"}>🍽</div>

      <div className={category === "transport" ? "icon active" : "icon"}>🚗</div>

      <div className={category === "energie" ? "icon active" : "icon"}>⚡</div>

      <div className={category === "wonen" ? "icon active" : "icon"}>🏠</div>

    </div>

  )

}

export default CategoryNav