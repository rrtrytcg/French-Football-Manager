import { z } from "zod";

const VocabItem = z.object({ fr: z.string().min(1), en: z.string().min(1) });
const VocabList = z.array(VocabItem).min(3).max(500);

export function parseQuizletText(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let fr = "";
    let en = "";

    if (line.includes("\t")) {
      [fr, en] = line.split("\t");
    } else if (line.includes(" - ")) {
      [fr, en] = line.split(" - ");
    } else if (line.includes(" : ")) {
      [fr, en] = line.split(" : ");
    } else if (line.includes(";")) {
      [fr, en] = line.split(";");
    } else if (line.includes(",")) {
      [fr, en] = line.split(",");
    } else {
      const parts = line.split(/\s{2,}/);
      if (parts.length >= 2) {
        fr = parts[0];
        en = parts.slice(1).join(" ");
      }
    }

    fr = (fr || "").trim();
    en = (en || "").trim();

    if (fr && en) {
      items.push({ fr, en });
    }
  }

  return VocabList.parse(items);
}

export function buildCardsFromVocab(vocabItems) {
  return vocabItems.map((item, i) => ({
    id: `card-${i + 1}`,
    term: item.fr,
    definition: item.en,
  }));
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
