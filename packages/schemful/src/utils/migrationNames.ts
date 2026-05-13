/**
 * Generate random migration names like Drizzle Kit does
 * Examples: "green_shark_tooth", "magical_dragon_wing", "bright_moon_shadow"
 */

const adjectives = [
  "ancient",
  "bold",
  "bright",
  "calm",
  "clever",
  "cosmic",
  "crystal",
  "dark",
  "deep",
  "elegant",
  "epic",
  "fierce",
  "frozen",
  "gentle",
  "golden",
  "grand",
  "green",
  "hidden",
  "icy",
  "iron",
  "magical",
  "mighty",
  "mystic",
  "noble",
  "peaceful",
  "purple",
  "quick",
  "radiant",
  "rapid",
  "red",
  "royal",
  "sacred",
  "shadow",
  "shining",
  "silent",
  "silver",
  "smooth",
  "solid",
  "swift",
  "tall",
  "tranquil",
  "vast",
  "warm",
  "wild",
  "wise",
  "wonderful",
];

const nouns = [
  "bear",
  "bird",
  "cat",
  "deer",
  "dog",
  "dolphin",
  "dragon",
  "eagle",
  "falcon",
  "fish",
  "fox",
  "hawk",
  "horse",
  "lion",
  "owl",
  "rabbit",
  "shark",
  "snake",
  "tiger",
  "turtle",
  "whale",
  "wolf",
  "zebra",
];

const objects = [
  "blade",
  "bridge",
  "castle",
  "cave",
  "crown",
  "flame",
  "forest",
  "gate",
  "gem",
  "hammer",
  "island",
  "key",
  "light",
  "moon",
  "mountain",
  "ocean",
  "path",
  "pearl",
  "river",
  "rock",
  "shield",
  "star",
  "stone",
  "sword",
  "temple",
  "throne",
  "tower",
  "tree",
  "valley",
  "wave",
  "wind",
  "wing",
];

/**
 * Generate a random migration slug like Drizzle Kit
 * Format: "adjective_noun_object" (e.g., "green_shark_tooth")
 */
export function generateMigrationSlug(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];

  return `${adjective}_${noun}_${object}`;
}

/**
 * Generate a timestamped migration name with random slug
 * Format: "20250702T123456_green_shark_tooth"
 */
export function generateMigrationName(customName?: string): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  const slug = customName || generateMigrationSlug();

  return `${timestamp}_${slug}`;
}
