// server/src/quiz.js - add this
import { z } from 'zod'

const VocabItem = z.object({ fr: z.string().min(1), en: z.string().min(1) })
const VocabList = z.array(VocabItem).min(3).max(500)

export function parseQuizletText(raw) {
  const lines = raw.split(/\r?\n/)
  const items = []
  
  for (let line of lines) {
    line = line.trim()
    if (!line) continue
    
    let [fr, en] = ['', '']
    if (line.includes('\t')) [fr, en] = line.split('\t')
    else if (line.includes(' - ')) [fr, en] = line.split(' - ')
    else if (line.includes(' : ')) [fr, en] = line.split(' : ')
    else if (line.includes(';')) [fr, en] = line.split(';')
    else {
      const parts = line.split(/\s{2,}/)
      fr = parts[0]; en = parts.slice(1).join(' ')
    }
    
    if (fr && en) items.push({ fr: fr.trim(), en: en.trim() })
  }
  
  return VocabList.parse(items)
}

// in your socket handler:
socket.on('teacher:setVocab', (rawText, cb) => {
  try {
    const vocab = parseQuizletText(rawText)
    room.vocab = vocab
    cb({ ok: true, count: vocab.length })
  } catch (e) {
    cb({ ok: false, error: 'Invalid format. Use French[tab]English' })
  }
})
