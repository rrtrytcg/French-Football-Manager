export function parseQuizletText(rawText) {
  const rows = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const cards = rows.flatMap((row, index) => {
    const [term, definition, ...rest] = row.split("\t");
    if (!term || !definition || rest.length > 0) {
      return [];
    }

    return [
      {
        id: `card-${index + 1}`,
        term: term.trim(),
        definition: definition.trim(),
      },
    ];
  });

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
