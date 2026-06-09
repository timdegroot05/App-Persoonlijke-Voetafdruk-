import ForestSprite from "./ForestSprite"

const OBJECT_COPY = {
  tree: "Deze boom laat zien hoe gezond je CO2-bos op dit moment is.",
  plant: "Planten groeien terug door duurzame keuzes en bosmissies.",
  water: "Water staat voor herstel. Bij goede keuzes wordt het bos levendiger.",
  fire: "Vuur en rook verschijnen wanneer je uitstoot boven je doel komt.",
}

const FOREST_OBJECTS = {
  healthy: [
    { id: "far-tree-left", type: "tree", variant: "healthy", label: "Achterste boom", x: "12%", y: "49%", size: 82, depth: "back" },
    { id: "far-tree-right", type: "tree", variant: "healthy", label: "Achterste boom", x: "88%", y: "50%", size: 82, depth: "back" },
    { id: "mid-tree-left", type: "tree", variant: "healthy", label: "Gezonde boom", x: "25%", y: "61%", size: 112, depth: "mid" },
    { id: "mid-tree-right", type: "tree", variant: "healthy", label: "Gezonde boom", x: "75%", y: "62%", size: 108, depth: "mid" },
    { id: "main-tree", type: "tree", variant: "healthy", label: "Sterke hoofboom", x: "50%", y: "61%", size: 164, depth: "hero" },
    { id: "front-tree-left", type: "tree", variant: "grow", label: "Nieuwe boom", x: "30%", y: "78%", size: 90, depth: "front" },
    { id: "front-tree-right", type: "tree", variant: "grow", label: "Nieuwe boom", x: "72%", y: "79%", size: 88, depth: "front" },
    { id: "plant-one", type: "plant", variant: "healthy", label: "Bloeiende plant", x: "16%", y: "85%", size: 54, depth: "front" },
    { id: "plant-two", type: "plant", variant: "grow", label: "Groeiende plant", x: "43%", y: "86%", size: 50, depth: "front" },
    { id: "plant-three", type: "plant", variant: "healthy", label: "Bloeiende plant", x: "84%", y: "85%", size: 54, depth: "front" },
    { id: "water", type: "water", variant: "idle", label: "Heldere waterpoel", x: "55%", y: "91%", size: 148, depth: "front" },
  ],
  good: [
    { id: "far-tree-left", type: "tree", variant: "healthy", label: "Achterste boom", x: "15%", y: "51%", size: 76, depth: "back" },
    { id: "far-tree-right", type: "tree", variant: "healthy", label: "Achterste boom", x: "84%", y: "52%", size: 76, depth: "back" },
    { id: "mid-tree-left", type: "tree", variant: "healthy", label: "Gezonde boom", x: "30%", y: "65%", size: 96, depth: "mid" },
    { id: "mid-tree-right", type: "tree", variant: "healthy", label: "Gezonde boom", x: "72%", y: "66%", size: 94, depth: "mid" },
    { id: "main-tree", type: "tree", variant: "healthy", label: "Hoofdboom", x: "50%", y: "64%", size: 148, depth: "hero" },
    { id: "plant-one", type: "plant", variant: "healthy", label: "Kleine plant", x: "22%", y: "85%", size: 50, depth: "front" },
    { id: "plant-two", type: "plant", variant: "healthy", label: "Kleine plant", x: "79%", y: "86%", size: 50, depth: "front" },
    { id: "water", type: "water", variant: "idle", label: "Rustige waterpoel", x: "55%", y: "91%", size: 130, depth: "front" },
  ],
  recovering: [
    { id: "far-tree-left", type: "tree", variant: "damaged", label: "Herstellende boom", x: "14%", y: "52%", size: 80, depth: "back" },
    { id: "far-tree-right", type: "tree", variant: "healthy", label: "Groene bosrand", x: "85%", y: "52%", size: 80, depth: "back" },
    { id: "mid-tree-left", type: "tree", variant: "healthy", label: "Nieuwe boom", x: "29%", y: "67%", size: 94, depth: "mid" },
    { id: "main-tree", type: "tree", variant: "grow", label: "Herstellende hoofboom", x: "51%", y: "64%", size: 150, depth: "hero" },
    { id: "mid-tree-right", type: "tree", variant: "damaged", label: "Droge boom", x: "76%", y: "69%", size: 88, depth: "mid" },
    { id: "plant-one", type: "plant", variant: "grow", label: "Nieuwe spruit", x: "20%", y: "85%", size: 52, depth: "front" },
    { id: "plant-two", type: "plant", variant: "grow", label: "Groeiende plant", x: "45%", y: "86%", size: 52, depth: "front" },
    { id: "plant-three", type: "plant", variant: "healthy", label: "Kleine plant", x: "82%", y: "86%", size: 48, depth: "front" },
    { id: "water", type: "water", variant: "splash", label: "Herstelwater", x: "56%", y: "91%", size: 136, depth: "front" },
  ],
  bad: [
    { id: "back-dead-left", type: "tree", variant: "damaged", label: "Droge boom", x: "18%", y: "58%", size: 86, depth: "back" },
    { id: "main-tree", type: "tree", variant: "damaged", label: "Belaste hoofboom", x: "52%", y: "64%", size: 140, depth: "hero" },
    { id: "back-dead-right", type: "tree", variant: "dead", label: "Kale boom", x: "80%", y: "65%", size: 86, depth: "mid" },
    { id: "dry-plant-left", type: "plant", variant: "dry", label: "Droge plant", x: "27%", y: "85%", size: 48, depth: "front" },
    { id: "dry-plant-right", type: "plant", variant: "dry", label: "Droge plant", x: "70%", y: "86%", size: 46, depth: "front" },
    { id: "water-low", type: "water", variant: "low", label: "Laag water", x: "52%", y: "92%", size: 102, depth: "front" },
    { id: "fire", type: "fire", variant: "idle", label: "Klein vuur", x: "83%", y: "81%", size: 62, depth: "front" },
  ],
  critical: [
    { id: "dead-left", type: "tree", variant: "dead", label: "Dode boom", x: "20%", y: "61%", size: 96, depth: "mid" },
    { id: "dead-main", type: "tree", variant: "dead", label: "Zwaar beschadigde boom", x: "52%", y: "62%", size: 148, depth: "hero" },
    { id: "dead-right", type: "tree", variant: "dead", label: "Kale boom", x: "80%", y: "68%", size: 90, depth: "mid" },
    { id: "dry-plant", type: "plant", variant: "dry", label: "Verdroogde plant", x: "34%", y: "85%", size: 46, depth: "front" },
    { id: "fire-main", type: "fire", variant: "strong", label: "Sterk vuur", x: "72%", y: "82%", size: 84, depth: "front" },
    { id: "fire-side", type: "fire", variant: "idle", label: "Brandplek", x: "26%", y: "82%", size: 58, depth: "front" },
  ],
}

function ForestLayer({ status, actionEffect, isEmpty, onInspectObject }) {
  const objects = FOREST_OBJECTS[status.id] || FOREST_OBJECTS.good

  return (
    <div className="forest-main-layer">
      <div className="forest-ground-zone" aria-hidden="true">
        <span className="forest-spotlight" />
        <span className="forest-floor-texture" />
        <span className="forest-river" />
        <span className="forest-river-bank bank-one" />
        <span className="forest-river-bank bank-two" />
        <span className="grass-clump grass-one" />
        <span className="grass-clump grass-two" />
        <span className="grass-clump grass-three" />
        <span className="grass-clump grass-four" />
        <span className="grass-clump grass-five" />
        <span className="flower-dot flower-one" />
        <span className="flower-dot flower-two" />
        <span className="flower-dot flower-three" />
        <span className="flower-dot flower-four" />
        <span className="forest-foreground-grass" />
      </div>

      <div className={`forest-object-layer effect-${actionEffect}`}>
        {isEmpty && (
          <div className="forest-empty-message" role="status">
            <strong>Je bos is nog leeg</strong>
            <span>Begin met CO2 besparen om bomen te planten.</span>
          </div>
        )}

        {objects.map((object) => (
          <ForestSprite
            key={object.id}
            {...object}
            onInspect={() =>
              onInspectObject({
                title: object.label,
                message: OBJECT_COPY[object.type],
              })
            }
          />
        ))}
      </div>
    </div>
  )
}

export default ForestLayer
