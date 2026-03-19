function ProgressBar({current, total}){

  const percentage = Math.round((current / total) * 100)

  return(

    <div className="progress-container">

      <div className="progress-text">
        {percentage}%
      </div>

      <div className="progress-bar">

        <div
          className="progress"
          style={{width:`${percentage}%`}}
        />

      </div>

    </div>

  )

}

export default ProgressBar