import { useState, useEffect } from "react";

function parseVocab(raw) {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items = [];
  
  for (const line of lines) {
    let parts = null;
    if (line.includes('\t')) parts = line.split('\t');
    else if (line.includes(' - ')) parts = line.split(' - ');
    else if (line.includes(' : ')) parts = line.split(' : ');
    else if (line.includes(';')) parts = line.split(';');
    else if (line.includes(',')) parts = line.split(',');
    else parts = line.split(/\s{2,}/);
    
    if (parts && parts.length >= 2) {
      const fr = parts[0].trim();
      const en = parts.slice(1).join(' ').trim();
      if (fr && en) items.push({ fr, en });
    }
  }
  return items;
}

function getRecentDecks() {
  try {
    const stored = localStorage.getItem('recentDecks');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentDeck(deck) {
  const recent = getRecentDecks();
  const newEntry = {
    name: deck.name || `${deck.items.length} terms`,
    count: deck.items.length,
    items: deck.items,
    savedAt: Date.now(),
  };
  const updated = [newEntry, ...recent.filter(d => d.name !== newEntry.name)].slice(0, 3);
  localStorage.setItem('recentDecks', JSON.stringify(updated));
  return updated;
}

export default function QuizletImporter({ onImport, onClose }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState([]);
  const [recentDecks, setRecentDecks] = useState([]);
  const [activeTab, setActiveTab] = useState('paste');

  useEffect(() => {
    setRecentDecks(getRecentDecks());
  }, []);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);
    const items = parseVocab(value);
    setPreview(items.slice(0, 5));
  };

  const handlePaste = () => {
    setTimeout(() => {
      const items = parseVocab(text);
      setPreview(items.slice(0, 5));
    }, 50);
  };

  const handleImport = () => {
    const items = parseVocab(text);
    if (items.length < 3) {
      alert('Need at least 3 terms. Check format: French [tab] English');
      return;
    }
    const deck = { name: `Custom deck (${items.length} terms)`, items };
    saveRecentDeck(deck);
    onImport(items);
  };

  const handleUseSample = () => {
    const sampleItems = [
      { fr: "bonjour", en: "hello" },
      { fr: "au revoir", en: "goodbye" },
      { fr: "merci", en: "thank you" },
      { fr: "s'il vous plaît", en: "please" },
      { fr: "oui", en: "yes" },
      { fr: "non", en: "no" },
      { fr: "chat", en: "cat" },
      { fr: "chien", en: "dog" },
      { fr: "maison", en: "house" },
      { fr: "école", en: "school" },
      { fr: "livre", en: "book" },
      { fr: "eau", en: "water" },
    ];
    const deck = { name: 'Sample A1 (12 terms)', items: sampleItems };
    saveRecentDeck(deck);
    onImport(sampleItems);
  };

  const handleUseRecent = (deck) => {
    onImport(deck.items);
  };

  const termCount = parseVocab(text).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="rounded-3xl border border-teal-400/30 bg-slate-950/95 p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold uppercase tracking-[0.15em] text-white">
            Import Vocabulary
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          {['paste', 'sample', 'recent'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full font-display text-sm uppercase tracking-[0.14em] transition ${
                activeTab === tab
                  ? 'bg-teal-400 text-slate-950'
                  : 'border border-white/20 text-white hover:border-teal-400/40'
              }`}
            >
              {tab === 'paste' ? 'Paste from Quizlet' : tab === 'sample' ? 'Sample A1' : 'Recent Decks'}
            </button>
          ))}
        </div>

        {activeTab === 'paste' && (
          <>
            <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                Quizlet Export Steps (4 seconds)
              </p>
              <ol className="text-sm text-slate-300 list-decimal ml-4 space-y-1">
                <li>Open your Quizlet set → click <strong>•••</strong></li>
                <li>Click <strong>Export</strong></li>
                <li>Click <strong>Copy text</strong></li>
                <li>Paste below</li>
              </ol>
            </div>

            <textarea
              value={text}
              onChange={handleTextChange}
              onPaste={handlePaste}
              placeholder={`bonjour\thello\nchat\tcat\nchien\tdog\n\nAlso works with:\nbonjour - hello\nbonjour : hello\nbonjour, hello`}
              className="w-full h-40 rounded-2xl border border-white/10 bg-slate-900/80 p-4 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400/50 focus:outline-none"
              autoFocus
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleImport}
                disabled={termCount < 3}
                className="flex-1 rounded-full bg-gold px-6 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold/90 transition"
              >
                Use this deck ({termCount} terms)
              </button>
              <button
                onClick={handleUseSample}
                className="rounded-full border border-teal-400/40 px-4 py-3 font-display uppercase tracking-[0.14em] text-teal-200 hover:bg-teal-400/10 transition"
              >
                Use Sample
              </button>
            </div>

            {preview.length > 0 && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Preview (first 5 terms):</p>
                <ul className="text-sm space-y-1">
                  {preview.map((p, i) => (
                    <li key={i} className="text-slate-300">
                      <span className="text-gold">{p.fr}</span> → {p.en}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {activeTab === 'sample' && (
          <div className="text-center py-8">
            <div className="mb-4 text-5xl">🇫🇷</div>
            <p className="font-display text-xl uppercase tracking-[0.15em] text-white mb-2">
              Sample A1 Deck
            </p>
            <p className="text-slate-400 mb-6">12 basic French vocabulary terms</p>
            <div className="grid grid-cols-2 gap-2 text-sm mb-6 max-h-40 overflow-y-auto">
              {[
                { fr: "bonjour", en: "hello" },
                { fr: "merci", en: "thank you" },
                { fr: "chat", en: "cat" },
                { fr: "chien", en: "dog" },
                { fr: "maison", en: "house" },
                { fr: "école", en: "school" },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-slate-900/50 p-2">
                  <span className="text-gold">{item.fr}</span> → {item.en}
                </div>
              ))}
            </div>
            <button
              onClick={handleUseSample}
              className="rounded-full bg-gold px-8 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-slate-950 hover:bg-gold/90 transition"
            >
              Use Sample A1
            </button>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="py-4">
            {recentDecks.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No recent decks. Import one to save it here.</p>
            ) : (
              <div className="space-y-3">
                {recentDecks.map((deck, i) => (
                  <button
                    key={i}
                    onClick={() => handleUseRecent(deck)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-left hover:border-teal-400/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-display text-lg uppercase tracking-[0.12em] text-white">
                          {deck.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {deck.count} terms • Saved {new Date(deck.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-gold text-xl">→</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
