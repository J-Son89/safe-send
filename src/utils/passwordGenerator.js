// Cryptographically secure password generation
const generateSecurePassword = () => {
  // Use crypto.getRandomValues for true randomness
  const getRandomInt = (max) => {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] % max
  }

  const getRandomHex = (length) => {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Much larger word lists for significantly more entropy
  const adjectives = [
    'abundant', 'accurate', 'adorable', 'advanced', 'afraid', 'aggressive', 'agreeable', 'alert', 'alive', 'amazing',
    'ancient', 'angry', 'annoyed', 'anxious', 'artistic', 'ashamed', 'astonishing', 'attractive', 'average', 'awesome',
    'beautiful', 'bewildered', 'bitter', 'bizarre', 'black', 'bloody', 'blue', 'blushing', 'boring', 'brainy',
    'brave', 'breakable', 'bright', 'brown', 'bumpy', 'calm', 'careful', 'careless', 'caring', 'cautious',
    'charming', 'cheerful', 'chilly', 'chubby', 'clean', 'clear', 'clever', 'cloudy', 'clumsy', 'cold',
    'colorful', 'comfortable', 'concerned', 'confident', 'confused', 'cool', 'cooperative', 'courageous', 'crazy', 'creamy',
    'creepy', 'criminal', 'crispy', 'cruel', 'curious', 'cute', 'dangerous', 'dark', 'deadly', 'deep',
    'delicate', 'delicious', 'delightful', 'depressed', 'determined', 'different', 'difficult', 'disgusted', 'distinct', 'disturbed',
    'dizzy', 'doubtful', 'drab', 'dull', 'eager', 'early', 'easy', 'elegant', 'embarrassed', 'empty',
    'enchanted', 'encouraging', 'energetic', 'enormous', 'enthusiastic', 'envious', 'evil', 'excited', 'expensive', 'exuberant',
    'fair', 'faithful', 'famous', 'fancy', 'fantastic', 'fierce', 'filthy', 'fine', 'foolish', 'fragile',
    'frail', 'frantic', 'fresh', 'friendly', 'frightened', 'funny', 'fuzzy', 'gentle', 'gifted', 'glamorous',
    'gleaming', 'glorious', 'good', 'gorgeous', 'graceful', 'greasy', 'great', 'green', 'grieving', 'grotesque',
    'grumpy', 'handsome', 'happy', 'healthy', 'helpful', 'helpless', 'hideous', 'high', 'hollow', 'homely',
    'horrible', 'huge', 'hungry', 'hurt', 'icy', 'ill', 'important', 'impossible', 'inexpensive', 'innocent',
    'inquisitive', 'itchy', 'jealous', 'jittery', 'jolly', 'joyous', 'kind', 'large', 'lazy', 'light',
    'lively', 'lonely', 'long', 'lovely', 'lucky', 'magnificent', 'miniature', 'modern', 'mysterious', 'nasty',
    'naughty', 'nervous', 'nice', 'nutty', 'obedient', 'obnoxious', 'odd', 'old', 'open', 'outrageous',
    'outstanding', 'panicky', 'perfect', 'plain', 'pleasant', 'poised', 'poor', 'powerful', 'precious', 'prickly',
    'proud', 'putrid', 'puzzled', 'quaint', 'real', 'relieved', 'repulsive', 'rich', 'scary', 'selfish',
    'shiny', 'shy', 'silly', 'sleepy', 'smiling', 'smoggy', 'sore', 'sparkling', 'splendid', 'spotless',
    'stormy', 'strange', 'stupid', 'successful', 'super', 'talented', 'tame', 'tender', 'tense', 'terrible',
    'thankful', 'thoughtful', 'thoughtless', 'thrilled', 'tiny', 'tired', 'tough', 'troubled', 'ugly', 'uninterested',
    'unsightly', 'unusual', 'upset', 'uptight', 'vast', 'victorious', 'vivacious', 'wandering', 'weary', 'wicked',
    'wide', 'wild', 'witty', 'worried', 'worrisome', 'wrong', 'young', 'zealous'
  ]

  const nouns = [
    'aardvark', 'alligator', 'alpaca', 'antelope', 'armadillo', 'baboon', 'badger', 'barracuda', 'beaver', 'bison',
    'bluebird', 'bobcat', 'buffalo', 'butterfly', 'camel', 'cardinal', 'caribou', 'chameleon', 'cheetah', 'chipmunk',
    'cobra', 'condor', 'cougar', 'coyote', 'cricket', 'crocodile', 'crow', 'deer', 'dolphin', 'donkey',
    'dragonfly', 'duck', 'eagle', 'elephant', 'elk', 'falcon', 'ferret', 'finch', 'firefly', 'flamingo',
    'fox', 'frog', 'gazelle', 'giraffe', 'goat', 'goose', 'gorilla', 'grasshopper', 'grizzly', 'hamster',
    'hawk', 'hedgehog', 'heron', 'hippo', 'horse', 'hummingbird', 'hyena', 'iguana', 'jackal', 'jaguar',
    'kangaroo', 'koala', 'ladybug', 'leopard', 'lion', 'lizard', 'llama', 'lobster', 'lynx', 'macaw',
    'mantis', 'meerkat', 'mongoose', 'monkey', 'moose', 'moth', 'mouse', 'mule', 'octopus', 'opossum',
    'otter', 'owl', 'panda', 'panther', 'parrot', 'peacock', 'pelican', 'penguin', 'pheasant', 'pig',
    'pigeon', 'platypus', 'porcupine', 'prairie', 'quail', 'rabbit', 'raccoon', 'raven', 'rhinoceros', 'robin',
    'salamander', 'salmon', 'seal', 'shark', 'sheep', 'skunk', 'sloth', 'snake', 'sparrow', 'spider',
    'squirrel', 'starfish', 'stingray', 'swan', 'tiger', 'toucan', 'turtle', 'vulture', 'walrus', 'weasel',
    'whale', 'wolf', 'wolverine', 'woodpecker', 'yak', 'zebra', 'asteroid', 'comet', 'galaxy', 'meteor',
    'nebula', 'planet', 'satellite', 'star', 'supernova', 'universe', 'canyon', 'cliff', 'desert', 'forest',
    'glacier', 'island', 'lake', 'mountain', 'ocean', 'prairie', 'river', 'valley', 'volcano', 'waterfall',
    'blizzard', 'breeze', 'cloud', 'cyclone', 'drizzle', 'fog', 'frost', 'hail', 'hurricane', 'lightning',
    'mist', 'rain', 'rainbow', 'snow', 'storm', 'sunshine', 'thunder', 'tornado', 'wind', 'crystal',
    'diamond', 'emerald', 'garnet', 'gold', 'granite', 'marble', 'onyx', 'opal', 'pearl', 'platinum',
    'quartz', 'ruby', 'sapphire', 'silver', 'topaz', 'turquoise', 'anchor', 'arrow', 'bridge', 'castle',
    'compass', 'crown', 'dagger', 'fortress', 'hammer', 'helm', 'key', 'lantern', 'mask', 'mirror',
    'prism', 'scroll', 'shield', 'spear', 'sword', 'telescope', 'throne', 'torch', 'tower', 'treasure'
  ]

  const symbols = ['!', '@', '#', '$', '%', '&', '*', '+', '=', '?', '^', '~']

  // Generate components with crypto random
  const adjective = adjectives[getRandomInt(adjectives.length)]
  const noun = nouns[getRandomInt(nouns.length)]
  const number1 = getRandomInt(1000) // 0-999 for more entropy
  const number2 = getRandomInt(1000) // 0-999 for more entropy  
  const symbol = symbols[getRandomInt(symbols.length)]
  const hexSuffix = getRandomHex(2) // 4 hex characters for additional entropy

  // Create array of password components
  const components = [
    adjective.charAt(0).toUpperCase() + adjective.slice(1),
    noun.charAt(0).toUpperCase() + noun.slice(1),
    number1.toString(),
    number2.toString(),
    symbol,
    hexSuffix
  ]

  // Randomly shuffle the components using Fisher-Yates algorithm
  for (let i = components.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1)
    ;[components[i], components[j]] = [components[j], components[i]]
  }

  // Use random separators between components
  const separators = ['-', '_', '.', '~']
  const randomSeparators = Array.from({length: components.length - 1}, () => 
    separators[getRandomInt(separators.length)]
  )

  // Join components with random separators
  let result = components[0]
  for (let i = 1; i < components.length; i++) {
    result += randomSeparators[i - 1] + components[i]
  }

  return result
}

export { generateSecurePassword }