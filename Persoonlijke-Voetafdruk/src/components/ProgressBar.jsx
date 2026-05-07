function ProgressBar({ current, total }) {
  const rawPercentage = total > 0 ? (current / total) * 100 : 0
  const percentage = Number(rawPercentage.toFixed(1))
  const label =
    Number.isInteger(percentage) ? `${percentage}%` : `${percentage.toFixed(1)}%`

  return (
    <div className="progress-container">
      <div className="progress-text">
        {label}
      </div>

      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
