export function calculateImpact(answers, questions) {
  const categories = {}

  const total = questions.reduce((sum, question) => {
    const impact = Number(answers?.[question.id]?.impact) || 0

    if (!categories[question.category]) {
      categories[question.category] = 0
    }

    categories[question.category] += impact
    return sum + impact
  }, 0)

  return {
    total,
    categories,
  }
}
