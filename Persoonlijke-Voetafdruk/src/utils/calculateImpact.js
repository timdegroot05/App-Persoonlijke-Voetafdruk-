export function calculateImpact(answers, questions){

  let total = 0
  let categories = {}

  answers.forEach((answer, index) => {

    const category = questions[index].category

    total += answer

    if(!categories[category]){
      categories[category] = 0
    }

    categories[category] += answer

  })

  return {
    total,
    categories
  }

}