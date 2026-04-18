export function parseQuizletText(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const cards = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let term = "";
    let definition = "";

    // Try different separators in order of specificity
    if (line.includes("\t")) {
      [term, definition] = line.split("\t");
    } else if (line.includes(" - ")) {
      [term, definition] = line.split(" - ");
    } else if (line.includes(" : ")) {
      [term, definition] = line.split(" : ");
    } else if (line.includes(";")) {
      [term, definition] = line.split(";");
    } else if (line.includes(",")) {
      [term, definition] = line.split(",");
    } else {
      // Fall back to 2+ spaces
      const parts = line.split(/\s{2,}/);
      if (parts.length >= 2) {
        term = parts[0];
        definition = parts.slice(1).join(" ");
      }
    }

    term = (term || "").trim();
    definition = (definition || "").trim();

    if (term && definition) {
      cards.push({
        id: `card-${i + 1}`,
        term,
        definition,
      });
    }
  }

  return cards;
}

export function buildQuestion(cards, askedCardIds = new Set()) {
  if (cards.length < 4) {
    return null;
  }

  const availableCards = cards.filter((card) => !askedCardIds.has(card.id));
  const sourcePool = availableCards.length > 0 ? availableCards : cards;
  const answerCard = sourcePool[Math.floor(Math.random() * sourcePool.length)];
  const distractors = cards
    .filter((card) => card.id !== answerCard.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((card) => card.definition);

  const options = [...distractors, answerCard.definition]
    .sort(() => Math.random() - 0.5)
    .map((label, index) => ({
      id: `${answerCard.id}-option-${index}`,
      label,
      isCorrect: label === answerCard.definition,
    }));

  return {
    id: `question-${answerCard.id}-${Date.now()}`,
    cardId: answerCard.id,
    prompt: answerCard.term,
    answer: answerCard.definition,
    options,
  };
}
