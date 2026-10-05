export interface TypingTextSample {
  id: string;
  title: string;
  author: string;
  text: string;
}

// Top 250 common Monkeytype typing test words for muscle memory training
export const MONKEYTYPE_WORDS: string[] = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they',
  'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'his',
  'from', 'they', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would',
  'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
  'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
  'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need', 'large', 'under',
  'never', 'same', 'another', 'while', 'last', 'might', 'sound', 'house', 'world', 'below',
  'ask', 'going', 'school', 'important', 'until', 'form', 'food', 'keep', 'children', 'feet',
  'land', 'side', 'without', 'boy', 'once', 'animal', 'life', 'enough', 'took', 'four', 'head',
  'above', 'kind', 'began', 'almost', 'live', 'page', 'got', 'earth', 'need', 'far', 'hand',
  'high', 'year', 'mother', 'light', 'country', 'father', 'let', 'night', 'picture', 'being',
  'study', 'second', 'soon', 'story', 'since', 'white', 'ever', 'paper', 'hard', 'near',
  'sentence', 'better', 'best', 'across', 'during', 'today', 'however', 'sure', 'knew',
  'try', 'told', 'young', 'sun', 'thing', 'whole', 'hear', 'example', 'heard', 'several',
  'change', 'answer', 'room', 'sea', 'against', 'top', 'turned', 'learn', 'point', 'city',
  'play', 'toward', 'five', 'using', 'himself', 'usually', 'money', 'seen', 'car', 'morning',
  'order', 'listen', 'fast', 'true', 'hundred', 'five', 'remember', 'step', 'early', 'hold',
  'west', 'ground', 'interest', 'reach', 'fast', 'sing', 'listen', 'six', 'table', 'travel',
  'less', 'morning', 'ten', 'simple', 'several', 'vowel', 'toward', 'war', 'lay', 'against',
  'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve', 'appear', 'road', 'map',
  'rain', 'rule', 'govern', 'pull', 'cold', 'notice', 'voice', 'fall', 'power', 'town',
  'fine', 'drive', 'lead', 'cry', 'dark', 'machine', 'note', 'wait', 'plan', 'figure',
  'star', 'box', 'noun', 'field', 'rest', 'correct', 'able', 'pound', 'done', 'beauty',
  'drive', 'stood', 'contain', 'front', 'teach', 'week', 'final', 'gave', 'green', 'oh',
  'quick', 'develop', 'sleep', 'warm', 'free', 'minute', 'strong', 'special', 'mind', 'behind',
  'clear', 'tail', 'produce', 'fact', 'street', 'inch', 'lot', 'nothing', 'course', 'stay',
  'wheel', 'full', 'force', 'blue', 'object', 'decide', 'surface', 'deep', 'moon', 'island',
  'foot', 'yet', 'busy', 'test', 'record', 'boat', 'common', 'gold', 'possible', 'plane',
  'age', 'dry', 'wonder', 'laugh', 'thousand', 'ago', 'ran', 'check', 'game', 'shape',
  'yes', 'hot', 'miss', 'brought', 'heat', 'snow', 'bed', 'bring', 'sit', 'perhaps',
  'fill', 'east', 'weight', 'language', 'among',
];

/**
 * Generates a completely random Monkeytype-style word sequence.
 * Every match will be 100% unique, chaotic, and pure muscle memory typing.
 */
export function generateMonkeyTypeText(wordCount = 25): TypingTextSample {
  const chosenWords: string[] = [];
  let prevWord = '';

  for (let i = 0; i < wordCount; i++) {
    let word = '';
    let attempts = 0;
    do {
      const idx = Math.floor(Math.random() * MONKEYTYPE_WORDS.length);
      word = MONKEYTYPE_WORDS[idx];
      attempts++;
    } while (word === prevWord && attempts < 10);

    chosenWords.push(word);
    prevWord = word;
  }

  const text = chosenWords.join(' ');
  const id = `monkeytype-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    title: 'MonkeyType Sprint',
    author: `${wordCount} Random Words`,
    text,
  };
}

export const TYPING_TEXT_SAMPLES: TypingTextSample[] = [
  {
    id: 'talk-is-cheap',
    title: 'Show Me The Code',
    author: 'Linus Torvalds',
    text: 'Talk is cheap. Show me the code. Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
  },
  {
    id: 'mechanical-beast',
    title: 'Keycap Duel',
    author: 'Bro v Bro Arcade',
    text: 'Listen to the thunderous clatter of mechanical switches echoing in the arena. Every keystroke is pure horsepower, and only one racer will cross the checkered line.',
  },
  {
    id: 'binary-humor',
    title: 'Base Three',
    author: 'Retro Coder',
    text: 'There are ten types of people in the world: those who understand binary, those who do not, and those who definitely did not expect a base three joke.',
  },
  {
    id: 'turbo-reflexes',
    title: 'Cyber Drift',
    author: 'Neon Street',
    text: 'Drop the clutch, shift into fifth gear, and keep your hands planted on the home row keys. Hesitation is the enemy of maximum velocity.',
  },
  {
    id: 'bug-hunting',
    title: 'Feature Or Bug',
    author: 'Anonymous Dev',
    text: 'It is not a bug, it is an undocumented feature. If debugging is the process of removing software bugs, then programming must be the process of putting them in.',
  },
  {
    id: 'stay-hungry',
    title: 'The Great Attempt',
    author: 'Bruce Lee',
    text: 'Do not fear failure. In great attempts it is glorious even to fail. But losing a typing duel to your best bro is completely out of the question.',
  },
  {
    id: 'matrix-drift',
    title: 'The Construct',
    author: 'Morpheus',
    text: 'You have to let it all go. Fear, doubt, and disbelief. Free your mind, loosen your wrists, and let your fingers dance across the keys without looking down.',
  },
  {
    id: 'coffee-code',
    title: 'Caffeine Surge',
    author: 'Coffee Devotee',
    text: 'A programmer is an organism that turns caffeine into clean logic. When the turbo kicks in, ninety words per minute feels like cruising in slow motion.',
  },
];
