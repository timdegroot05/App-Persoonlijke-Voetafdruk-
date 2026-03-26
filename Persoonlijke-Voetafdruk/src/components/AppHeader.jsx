function AppHeader({ title, icon, rightContent = null }) {
  return (
    <header className="home-header app-header-sticky">
      <div className="header-left">{icon}</div>
      <h1 className="header-title">{title}</h1>
      <div className="header-right">{rightContent}</div>
    </header>
  )
}

export default AppHeader
