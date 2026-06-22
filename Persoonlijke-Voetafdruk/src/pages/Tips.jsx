import { useEffect, useMemo, useState } from "react"
import { FiArrowRight, FiSearch } from "react-icons/fi"
import { LuLeaf } from "react-icons/lu"
import MobilePageShell from "../components/MobilePageShell"
import { allTipCards, tipCategories } from "../data/tips"

const ALL_CATEGORIES = [{ id: "all", label: "Alles" }, ...tipCategories]

function Tips() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredCards = useMemo(() => {
    return allTipCards.filter((card) => {
      const categoryMatches = activeCategory === "all" || card.category === activeCategory
      const textMatches =
        normalizedSearch.length === 0 ||
        `${card.title} ${card.body} ${card.categoryLabel} ${card.type}`
          .toLowerCase()
          .includes(normalizedSearch)

      return categoryMatches && textMatches
    })
  }, [activeCategory, normalizedSearch])
  const isSearching = normalizedSearch.length > 0
  const highlightCards = filteredCards.length > 0 ? filteredCards : allTipCards
  const highlightPreviewCards = useMemo(() => highlightCards.slice(0, 8), [highlightCards])
  const activeCard = highlightPreviewCards[activeIndex % highlightPreviewCards.length]
  const visibleCategories =
    activeCategory === "all"
      ? tipCategories
      : tipCategories.filter((category) => category.id === activeCategory)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % highlightPreviewCards.length)
    }, 4800)

    return () => window.clearInterval(timerId)
  }, [highlightPreviewCards.length])

  return (
    <MobilePageShell
      title="Tips"
      icon={<LuLeaf />}
      className="tips-page"
      contentClassName="tips-content"
    >
      <section className="tips-hero-card">
        <div className="tips-hero-copy">
          <p className="section-label dark">Vandaag</p>
          <h1>{activeCard.title}</h1>
          <p>{activeCard.body}</p>
        </div>
        <div className="tips-hero-visual" aria-hidden="true">
          <span className="tips-hero-sun" />
          <span className="tips-hero-cloud" />
          <span className="tips-hero-leaf leaf-a" />
          <span className="tips-hero-leaf leaf-b" />
          <span className="tips-hero-ground" />
        </div>
        <div className="tips-progress-dots" aria-label="Automatische tips">
          {highlightPreviewCards.map((card, index) => (
            <button
              key={`${card.type}-${card.title}`}
              type="button"
              className={index === activeIndex % 8 ? "active" : ""}
              onClick={() => setActiveIndex(index)}
              aria-label={`Toon ${card.type.toLowerCase()} ${card.title}`}
            />
          ))}
        </div>
      </section>

      <section className="tips-control-card" aria-label="Zoek en filter tips">
        <label className="tips-search-field">
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Zoek op fiets, douche, kleding..."
            aria-label="Zoek tips en feitjes"
          />
        </label>
        <div className="tips-category-chips" aria-label="Tipcategorieën">
          {ALL_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={activeCategory === category.id ? "active" : ""}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
        <p>
          {isSearching
            ? `Je zoekt naar "${searchTerm.trim()}" · ${filteredCards.length} resultaten`
            : `${filteredCards.length} tips en feitjes beschikbaar`}
        </p>
      </section>

      {filteredCards.length === 0 ? (
        <section className="tips-empty-card">
          <h2>Geen tips gevonden</h2>
          <p>Probeer een andere zoekterm of kies een andere categorie.</p>
        </section>
      ) : null}

      {isSearching && filteredCards.length > 0 ? (
        <section className="tips-search-results-card" aria-label="Zoekresultaten">
          <div className="tips-search-results-header">
            <div>
              <p className="section-label dark">Zoekresultaten</p>
              <h2>Resultaten voor “{searchTerm.trim()}”</h2>
            </div>
            <strong>{filteredCards.length}</strong>
          </div>
          <div className="tips-search-results-list">
            {filteredCards.slice(0, 18).map((card) => (
              <article key={`search-${card.type}-${card.category}-${card.title}`}>
                <div>
                  <span>{card.type} · {card.categoryLabel}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="tips-horizontal-section">
        <div className="tips-section-header">
          <div>
            <p className="section-label dark">Uitgelicht</p>
            <h2>{activeCategory === "all" ? "Alle categorieën" : activeCard.categoryLabel}</h2>
          </div>
          <FiArrowRight aria-hidden="true" />
        </div>
        <div className="tips-horizontal-rail" aria-label="Horizontaal scrollbare resultaten">
          {filteredCards.slice(0, 40).map((card) => (
            <article key={`${card.type}-${card.category}-${card.title}`} className={`tips-list-card compact ${card.type === "Feitje" ? "fact" : ""}`}>
              <span>{card.type}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <small>{card.categoryLabel}</small>
            </article>
          ))}
        </div>
      </section>

      {visibleCategories.map((category) => {
        const categoryCards = filteredCards.filter((card) => card.category === category.id)
        if (categoryCards.length === 0) return null

        return (
          <section key={category.id} className="tips-horizontal-section">
            <div className="tips-section-header">
              <div>
                <p className="section-label dark">Categorie</p>
                <h2>{category.label}</h2>
              </div>
              <FiArrowRight aria-hidden="true" />
            </div>
            <div className="tips-horizontal-rail" aria-label={`Horizontaal scrollbare ${category.label} tips`}>
              {categoryCards.map((card) => (
                <article key={`${card.type}-${card.title}`} className={`tips-list-card compact ${card.type === "Feitje" ? "fact" : ""}`}>
                  <span>{card.type}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </MobilePageShell>
  )
}

export default Tips
