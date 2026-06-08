import AppHeader from "./AppHeader"
import BottomNav from "./BottomNav"

function MobilePageShell({
  title,
  icon,
  className = "",
  contentClassName = "",
  children,
  showBottomNav = true,
}) {
  return (
    <div className={`mobile-page-shell ${className}`.trim()}>
      <AppHeader title={title} icon={icon} />
      <div className={`mobile-page-shell-content ${contentClassName}`.trim()}>
        {children}
      </div>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  )
}

export default MobilePageShell
