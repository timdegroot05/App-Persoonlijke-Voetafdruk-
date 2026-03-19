import { calculateImpact } from "../utils/calculateImpact"
import { questions } from "../data/questions"

function Result({answers}){

  const result = calculateImpact(answers,questions)

  return(

    <div className="result">

      <h1>Jouw Impact</h1>

      <div className="score">
        {result.total}
      </div>

      <div className="category-scores">

        {Object.entries(result.categories).map(([key,value])=>(
          
          <div key={key} className="category-score">

            <strong>{key}</strong> : {value}

          </div>

        ))}

      </div>

      <p>
        Hoe lager je score hoe duurzamer je leeft.
      </p>

    </div>

  )

}

export default Result