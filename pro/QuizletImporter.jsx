// client/src/components/QuizletImporter.jsx
import { useState } from 'react'

function parseVocab(raw) {
  // Handles: tab, comma, semicolon, " - ", " : ", 2+ spaces
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const items = []
  
  for (const line of lines) {
    let parts = null
    if (line.includes('\t')) parts = line.split('\t')
    else if (line.includes(' - ')) parts = line.split(' - ')
    else if (line.includes(' : ')) parts = line.split(' : ')
    else if (line.includes(';')) parts = line.split(';')
    else if (line.includes(',')) parts = line.split(',')
    else parts = line.split(/\s{2,}/)
    
    if (parts.length >= 2) {
      const fr = parts[0].trim()
      const en = parts.slice(1).join(' ').trim()
      if (fr && en) items.push({ fr, en })
    }
  }
  return items
}

export default function QuizletImporter({ onImport }) {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState([])
  
  const handlePaste = (e) => {
    // auto-parse on paste
    setTimeout(() => {
      const items = parseVocab(e.target.value)
      setPreview(items.slice(0, 5))
    }, 50)
  }
  
  const handleImport = () => {
    const items = parseVocab(text)
    if (items.length < 3) {
      alert('Need at least 3 terms. Check format: French [tab] English')
      return
    }
    localStorage.setItem('lastDeck', JSON.stringify(items))
    onImport(items)
  }
  
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Import from Quizlet — 10 seconds</h2>
      <ol className="text-sm text-gray-600 mb-3 list-decimal ml-4 space-y-1">
        <li>Open your Quizlet set → ••• → Export</li>
        <li>Copy all text (Ctrl+A, Ctrl+C)</li>
        <li>Paste below</li>
      </ol>
      
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder={`bonjour\thello\nchat\tcat\nchien\tdog`}
        className="w-full h-40 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleImport}
          disabled={!text}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700"
        >
          Use this deck ({preview.length ? parseVocab(text).length : 0} terms)
        </button>
        <button
          onClick={() => onImport(null)} // triggers sample deck
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Use sample A1
        </button>
      </div>
      
      {preview.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-1">Preview:</p>
          <ul className="text-sm">
            {preview.map((p,i) => (
              <li key={i}>{p.fr} → {p.en}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
