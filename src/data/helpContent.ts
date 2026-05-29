/**
 * LoneForge Solo RPG Engine — Help Content
 * Centralised help text for all sections and sub-sections.
 * Each entry has: title, summary, and a list of key features / tips.
 */

export interface HelpEntry {
  title: string;
  summary: string;
  features: { label: string; description: string }[];
  tip?: string;
}

export const HELP_CONTENT: Record<string, HelpEntry> = {

  // ─── MAIN TABS ──────────────────────────────────────────────────────────────

  adventure: {
    title: "Adventure",
    summary: "The heart of LoneForge. Use this tab to drive the narrative forward — switch contexts, consult the oracle, explore settlements, travel the wilderness, plunge into dungeons and fight every kind of foe.",
    features: [
      { label: "Context Switcher", description: "Declare your current situation (Narrative, Settlement, Wilderness, Dungeon, Combat), you can switch between them at any time. The relevant tool panel expands automatically." },
      { label: "Campaign Journal", description: "Every roll, event, and narrative beat is logged on the right side. It auto-scrolls to the latest entry. Use 'Clear' to reset it when a new session begins." },
      { label: "Quest Banner", description: "Tap the ‘Quest’ button in the header to review your active adventure hook. Remember: a quest is only a narrative prompt, not a rigid script — you decide if, how, and whether to follow it. If the hook doesn’t inspire you, use the Narrative sub‑section in the Adventure tab to generate new quests or fresh story sparks."  },
      { label: "Experience and Leveling", description: "XP is tracked in the header. When you earn XP, click the bar to add it. Once the bar fills, visit the Character tab to perform your level‑up and unlock new features." },
      { label: "Hit Points", description: "Your current HP is tracked in the header. Click the health bar to adjust it after damage, healing, or to add temporary HP. If your HP drops to zero, the game pauses and asks whether you want to start a new adventure at level 1 or continue with your current character. If you choose to continue, you may justify it narratively or open the Dice tab to roll your three death saves" },
    ],
    tip: "Start every session by reading the Quest modal and choosing the Context that matches where you left off.",
  },

  character: {
    title: "Character Sheet",
    summary: "A full digital character sheet compatible with D&D 5.5 Edition. Edit stats, manage equipment, track spells, and handle companions here.",
    features: [
      { label: "Ability Scores", description: "Click any score box to roll a quick ability check. Use +/− to manually adjust the score." },
      { label: "Saving Throws & Skills", description: "Click the coloured dot to toggle proficiency. Click the row label to roll the check directly. Skills and saving throw proficiencies are assigned automatically based on your class, but you’re free to add or remove proficiency from any skill at any time by clicking its coloured dot." },
      { label: "Initiative, Armor Class & Speed", description: "These values have default calculations, but many items, abilities, conditions, and narrative effects can modify them at any time. Use the +/− buttons to adjust Initiative, AC, or Speed whenever the story or your equipment changes."},
      { label: "Equipment & Treasure", description: "Equip/unequip weapons and armour with the shield icon. Move items between Equipment and Treasure using the arrow icons. In the Treasure section, you can manually add custom items using the + button, or click the magnifying glass to pick an item directly from the full Items list." },
      { label: "Feats & Abilities", description: "Add any new feats or abilities gained during your adventure. You can pick them from the predefined list or create unique custom entries using the + button."},
      { label: "Spellbook", description: "Spell slots are tracked with clickable pips — red = used. Click a spell name to read its full description. You can edit your spellcasting ability by clicking it. Use ‘Add Spell’ to open the Spell Compendium and choose new spells for your spellbook. Each spell also has a small circle you can toggle to mark it as prepared or unprepared." },
      { label: "Companions", description: "Add animals, mounts, or allied creatures. Each companion has its own HP tracker, stats, and ability list. You can edit and add additional traits and abilities using the edit button on the top right." },
      { label: "Level Up", description: "When your XP bar turns green and pulses, click it to level up. New class features are added automatically." },
    ],
    tip: "Keep Currency updated after every shopping trip — the sheet tracks CP, SP, EP, GP, and PP separately. It is easier to use just one or two denominations (e.g. GP and PP) and convert as needed to avoid confusion." ,
  },

  dice: {
    title: "Dice Roller",
    summary: "A flexible dice pool builder. Select any combination of dice, add a modifier, and roll — results appear in the Recent Results log on the right.",
    features: [
      { label: "Dice Pool", description: "Click a die face (d4 through d100) to add it to the pool. Use the +/− buttons to set the quantity." },
      { label: "Modifier", description: "Set a flat bonus or penalty to add to the total roll. Useful for contested rolls outside the Character Sheet." },
      { label: "Roll Dice", description: "Fires the entire pool at once. Each die result is shown individually in the log." },
      { label: "Recent Results", description: "Shows only roll-type logs, filtered from the Campaign Journal — clean and focused." },
    ],
    tip: "Use the Dice tab for any improvised roll that doesn't fit a skill check, such as random table entries or creative challenges.",
  },

  bestiary: {
    title: "Bestiary",
    summary: "A searchable database of all creatures. Browse, filter, and inspect stat blocks — then add enemies directly to the Combat Arena.",
    features: [
      { label: "Search & Filter", description: "Search by name, filter by creature type, environment, and CR range. Sort alphabetically or by CR." },
      { label: "Stat Block", description: "Click any creature to open its full stat block: HP, AC, attacks, abilities, traits, reactions, and lore." },
      { label: "Add to Arena", description: "From the Combat Tools panel, search the bestiary inline to add creatures to an active encounter." },
      { label: "CR Reference", description: "Use the CR Min/Max sliders to find creatures appropriate for your character level." },
    ],
    tip: "A general guideline: a single creature of CR equal to your level makes a Medium encounter. Multiple creatures multiply the effective CR.",
  },

  spells: {
    title: "Spell Compendium",
    summary: "Browse all 2024 PHB spells. Filter by level, class, and school — then add any spell directly to your character's spellbook.",
    features: [
      { label: "Search", description: "Type any part of a spell name to filter the list instantly." },
      { label: "Filters", description: "Narrow results by spell level, casting class, or school of magic." },
      { label: "Spell Detail", description: "Expand any entry to see casting time, range, components, duration, full description, and At Higher Levels text." },
      { label: "Add to Spellbook", description: "Click the ✦ icon on any spell to add it to your character. A ✕ removes it." },
    ],
    tip: "After adding spells, go to the Character Sheet → Spellbook to mark them as prepared and track slot usage.",
  },

  items: {
    title: "Items",
    summary: "Two tools in one: a full Item Compendium to browse all equipment, and a Loot Generator to reward your character after encounters.",
    features: [
      { label: "Item Compendium", description: "Search, filter by category and rarity, and inspect any item from the 2024 PHB. Use 'Uncover History' on uncommon+ items to generate a side‑quest. These quests are only narrative prompts — it's up to you to decide what to keep, adapt, or ignore to fit your story and make your adventure more engaging." },
      { label: "Loot Generator", description: "Choose a source (Normal Enemy, Exploration, Treasure Room, Boss) to generate contextual loot. During exploration, loot is already placed automatically inside the dungeon, but if the narrative calls for an enemy to drop rewards or you discover a treasure room, you can use the Loot Generator. It scales with your character’s level to keep rewards appropriate, and if you want something specific you can always browse the Item Compendium and add it directly to your inventory." },
      { label: "Item Identifier", description: "During your adventures you may come across mysterious, unidentified objects. You could use spells like Identify, consult an expert in town, or find other creative ways to reveal their nature. The Item Identifier helps you identify unknown items: choose a category and rarity, and it will generate a matching magic item to represent what you’ve found. Some combinations do not have a matching magic item available, so you may need to use your creativity to determine the item's properties." },
      { label: "Claim Loot", description: "After generating, click 'Claim All Loot' to add everything to your inventory/treasure and currency automatically." },
      {label: "Cursed Item Generator", description: "Use the Artifact Evoker to generate cursed items by selecting both an item category and a thematic focus. The system actively combines these elements to create unique cursed artifacts. However, some category + theme combinations may not yet exist — in those cases, the tool will generate a random cursed item instead. If you want a specific item type (e.g. a sword), consider removing the thematic focus to avoid fallback results."},
      {label: "Cursed Item Details", description: "Each cursed item includes a description, primary and secondary mechanics (both rerollable), a curse type — Active, Latent, Conditional, or Progressive — and a unique backstory, all influenced by the chosen thematic focus. You can reroll any component to refine the item. An Oracle section also provides reflective prompts to help you explore the item’s narrative role. As always, these elements are suggestions: feel free to modify, expand, or reinterpret them to craft a story that fits your world."},
    ],
    tip: "Boss loot lets you specify the creature type (e.g. Dragon, Undead) to bias the magic item results thematically, but I still need to implement that feature.",
  },

  feats: {
    title: "Feats",
    summary: "Browse every feat category — Origin Feats, General Feats, Fighting Styles, and Epic Boons — and add them directly to your character sheet.",
    features: [
      { label: "Feat Browser", description: "Explore all feat categories in one place: Origin Feats, General Feats, Fighting Style Feats, and Epic Boons. You can filter by category or search for a specific name, making it easy to find exactly what you need." },
      { label: "Full Details & Requirements", description: "Open any feat to view its full rules text, mechanical effects, and prerequisites. This helps you understand how each feat fits your build before adding it to your character." },
      { label: "Add to Character Sheet", description: "Once you’ve chosen a feat, you can add it directly to your character sheet. Feats that require additional choices — such as Magic Initiate — can be selected first and then completed inside the character sheet by choosing the appropriate cantrips, spells, or other options." },
      { label: "Flexible Narrative Integration", description: "Feats can be used mechanically or narratively. Feel free to ignore, adapt, or reinterpret certain details to better fit your character’s story and the tone of your campaign." },
    ],
    tip: "If a feat requires a choice (e.g Ability Score Improvement), add it to your character sheet first, then use the charecter sheet options to add the chosen ability score increase, new spells, or other selections." ,
  },


  npc: {
    title: "NPC Generator",
    summary: "Generate fully detailed NPCs for any location, or create powerful Factions to populate your world with organisations and intrigue.",
    features: [
      { label: "NPC Generator", description: "Each NPC has a name, race, role, alignment, disposition, traits, goal, and dark secret. Randomise all fields at once or tweak individual ones." },
      { label: "Assign to Location", description: "Each NPC has a name, race, role, alignment, disposition, traits, goal, and dark secret. Randomise all fields at once or tweak individual ones. As always, it's up to you to ignore certain details or focus on the ones that inspire you, shaping them to fit your narrative in the most engaging way." },
      { label: "NPC History", description: "Saved NPCs appear below the generator. Click any card to view full details. Remove with the trash icon." },
      { label: "Faction Generator", description: "Creates an entire organisation: type, alignment, influence, leader, goal, motto, headquarters, narrative hook, and a hidden secret. Each entry can be randomised individually, giving you full control over what to keep or change. The secret starts concealed and can be revealed only when the narrative calls for it, allowing your factions to feel alive, with motives and agendas that evolve within your world." },
      { label: "Reveal Secret", description: "The faction secret is hidden by default — click 'Reveal Secret' when the party/pg uncovers it in play." },
    ],
    tip: "Use the Faction Generator to create rival guilds, secret societies, or power brokers that drive your quest forward.",
  },

  villain: {
    title: "Villains",
    summary: "A three‑tiered villain system designed to support dungeon crawls, regional story arcs, and full campaign finales. Villains are divided into Dungeon Bosses, Local Villains, and BBEGs — each with increasing narrative depth, influence, and long‑term impact on your world.",

    features: [
      { label: "Dungeon Bosses", description: "These are powerful foes waiting at the end of a crawl. You can filter them by dungeon type, and each dungeon typically includes three bosses for low, mid, and high CR. Every boss entry includes an image, speech style, personal motivations, secrets, weaknesses, and a final phase to escalate the fight. Suggested abilities and a reference stat block from the bestiary help you shape the encounter mechanically, while recommended loot — three thematic rewards, usually two crafting components and one treasure — reinforces the boss’s identity. Loot items are unique and do not appear in the standard Item Compendium, emphasizing their rarity and narrative weight."},
      { label: "Local Villains", description: "Regional threats with plans, influence, and a footprint across the campaign area. In addition to the elements found in Dungeon Bosses, Local Villains include Voices (how they speak), Power Structure (their sphere of influence), and a detailed Plan outlining their intentions. Evidence & Traces provide clues your character may encounter throughout the adventure, gradually pointing toward the villain’s identity. A Villainous Arc offers possible narrative conclusions — from redemption to downfall — giving you multiple ways to resolve their story."},
      { label: "BBEGs", description: "World‑level threats and campaign‑defining antagonists. BBEGs use the same structure as Local Villains but operate on a much larger scale. Their motivations, plans, and consequences extend far beyond a single region, often shaping the fate of nations or the world itself. Their Evidence & Traces may span entire arcs, and their Villainous Arc includes long‑term outcomes that can redefine your campaign’s ending. These villains are designed to be the culmination of your story — the final confrontation that ties together everything that came before."},
      { label: "Customization & Narrative Freedom", description: "All villain templates are prompts, not prescriptions. You decide which elements to keep, adapt, or ignore. Motivations can shift, secrets can evolve, and weaknesses can be rewritten to better fit your story. The suggested stat blocks, abilities, and loot are starting points — feel free to modify them to match your campaign’s tone, difficulty, or themes. Villains are most compelling when they reflect the narrative you’re building, not when they follow a rigid template."}
    ],
    tip: "Use villain clues and motivations early in the campaign to build anticipation. Even a single hint — a symbol, a rumor, a strange event — can make the eventual reveal far more impactful. Let villains grow with the story, and don’t be afraid to reshape them as your narrative evolves."
  },


  legacy: {
    title: "Legacy & Powers",
    summary: "Track your character's unique supernatural progression — unlockable powers, meters (like Hunger), and special trials. This system is still in early development, but it’s designed to add a layer of narrative character and it’s perfect for campaigns where your character undergoes a significant transformation or ascends to a legendary status. What's the price of wielding such power? How does it affect your humanity, your relationships, and the world around you? The Legacy system invites you to explore these questions through gameplay mechanics that evolve with your story.",
    features: [
      { label: "Power Tiers", description: "Powers are organised in tiers. Unlock them by meeting in-game conditions described in each card." },
      { label: "Meters", description: "Track resource meters (e.g. Hunger) that affect which powers are active and what thresholds trigger special effects." },
      { label: "Trials", description: "Some powers require completing a narrative trial. Mark them complete when resolved in your story." },
      { label: "Manifestations", description: "High-tier powers may trigger random manifestation rolls — use the dice button on those cards." },
    ],
    tip: "The Legacy system is optional and designed for longer campaigns where your character evolves beyond standard class progression. This system is still in early development and may receive significant changes as I continue to refine it based on player feedback and narrative needs." ,
  },

  downtime: {
    title: "Downtime Activities",
    summary: "Spend time between adventures on long-term projects: crafting items, training skills, buying rare magic items, running a business, and more.",
    features: [
      { label: "Start a Project", description: "Select an activity, choose a variant (difficulty/scale), name your project, and click 'Start Project'." },
      { label: "Daily Check", description: "Each day you work, roll an ability check. You’re free to choose which ability to use each day, depending on how you approach the task — for example, forging a complex weapon might start with INT to design the blueprint, then STR to shape the metal, and finally DEX for the finishing touches. You may also apply proficiency or expertise if your character has it. Every activity has its own DC: succeeding adds progress, failing by a small margin simply means no progress is made, while a major failure can set you back." },
      { label: "Events", description: "Each day may bring a Complication (bad) or an Opportunity (good) that affects your final quality score. Many Complications can be resolved narratively, letting you weave them into the story and make the crafting process more engaging. You also have access to Project Context & Modifiers — optional bonuses or penalties you can apply based on the materials, conditions, or narrative circumstances of your project. If none of the preset modifiers fit, you’re free to create your own to better reflect the story you’re telling or to better integrate the opportunities that arise." },
      { label: "Resolution Score", description: "When progress is complete, a score is calculated from base + modifiers − complications. Higher scores = better outcomes. If you crafted an item, you can add it to your inventory by creating a new entry in the treasure tab in your character sheet." },
      { label: "Custom Modifiers", description: "Each activity includes preset modifiers you can apply to reflect materials, conditions, or narrative circumstances. However, you’re also free to create entirely custom modifiers — positive or negative — to capture unique story moments, unusual approaches, or unexpected twists. This ensures your final project score reflects not just mechanics, but the creativity and narrative depth of your downtime scenes."},
      { label: "World Events", description: "Use the Settlement panel to generate urban events while downtime ticks — the world doesn't pause. Sometimes working on a project all day can feel repetitive, and it’s important to remember that the world around your character is alive. Urban Events and District Disturbances can add unexpected twists, giving you narrative hooks to integrate into your downtime. These moments can interrupt, complicate, or enrich your work, making the crafting process feel more dynamic and connected to the living world around you." },
    ],
    tip: "Resolve complications as soon as they appear — each unresolved one reduces your final quality score. Don't just click on Resolve Complication and move on, take a moment to think about how it can add drama or depth to your downtime narrative and how it can be resolved narratively." ,
  },

  lore: {
    title: "Lore Engine",
    summary: "The Lore Engine is a procedural world-building oracle. In solo play you often stumble upon strange symbols, forgotten gods, ancient ruins, mysterious artifacts, or unusual monsters — and when you roll an ability check to recall lore, you’re both player and GM. Sometimes inspiration doesn’t strike on its own. The Lore Engine helps by offering narrative prompts across multiple categories, giving you the sparks you need to expand mysteries, reveal hidden histories, and enrich your world with meaningful context. It’s designed to be flexible and modular — you can pick a specific category to explore, or let it surprise you with something unexpected. Each module has its own set of features to help you dive deeper into the lore and make it your own." ,
    features: [
      { label: "Modules", description: "Choose from 7 categories: Myths & Folklore, Gods & Planes, Lost Civilizations, Relics & Artifacts, Cultures & Factions, Monster Origins, Prophecies & Omens." },
      { label: "Sub-types", description: "Some modules offer focus options (e.g. Deity vs Plane, Prophecy vs Vision). Pick the one that fits your needs or let the engine randomise." },
      { label: "Editable Slots", description: "Every highlighted word in the generated text is an editable slot you can click to randomise individually or replace with your own text. If the generated lore doesn’t fit your story, you can regenerate the entire entry or adjust only the parts you want. This flexibility lets you tailor the lore to your ongoing narrative, keeping it consistent with the events and themes already established in your world." },
      { label: "Follow the Thread", description: "When a connection is detected, a button appears to chain into a related module. Each piece of generated lore has a chance to link to another — for example, an artifact might reveal ties to a forgotten deity. You can choose to integrate the connection into your story, ignore it entirely, or keep it aside as inspiration for future developments. This makes it easy to build layered lore that grows organically as your world evolves." },
      { label: "Archive Lore", description: "Click 'Archive Lore' to save the generated text directly to your Notes tab. In this way, you can build a comprehensive archive of the lore you’ve generated and integrate it into your ongoing narrative." },
    ],
    tip: "Use the Lore Engine when the Oracle returns a cryptic answer or when you need inspiration during your campaign — roll on a related module to flesh out the mystery.",
  },

  notes: {
    title: "Adventurer's Notes",
    summary: "A free-text notepad that auto-saves. Record session summaries, NPC names, discovered secrets, and anything else worth remembering. This should be your go-to place for keeping track of the story as it unfolds. You can use it to jot down important details, character motivations, or even just your thoughts and feelings about the adventure. The Notes tab is designed to be flexible and easy to use, so you can focus on the story without worrying about losing important information." ,
    features: [
      { label: "Auto-save", description: "Everything you type is saved automatically into your browser’s localStorage under the loneforge_save key, together with your entire gameState (character, inventory, log, notes, etc.). Notes persist as long as you keep using the same browser and device. Reloading the page or closing and reopening the browser won’t delete anything, but switching browser or device will create a separate save. Clearing browsing data or using incognito mode will erase the notes when the session ends." },
      { label: "Lore Archive", description: "The Lore Engine's 'Archive Lore' button appends generated lore here automatically." },
      { label: "Quest History", description: "Uncovering an item's history or generating an Open Quest also appends details here." },
      { label: "Export & Import Save", description: "If you plan to switch browser or device — or if you need to clear your browsing data — use the Export Save button to download your entire gameState (notes included) as a local file. Later, you can restore everything with Import Save. This ensures your progress is never lost, even when localStorage would normally be wiped." },
    ],
    tip: "Use markdown-style headers (e.g. ### Session 3) to keep your notes organised over long campaigns.",
  },

  // ─── ADVENTURE SUB-PANELS ───────────────────────────────────────────────────

  narrative_oracle: {
    title: "Narrative & Oracle",
    summary: "Generate adventure hooks, ask yes/no questions to the Oracle, attempt freeform actions with skill checks, and roll random situation verbs for plot inspiration.",
    features: [
      { label: "Adventure Engine", description: "A structured quest is generated automatically right after character creation, but you can change it at any time by choosing a tone you prefer (Mystery, Urgency, Moral, Conspiracy, Survival, Discovery). This creates a full narrative setup: an initial situation with spatial and temporal context, several possible involvements explaining how your character becomes part of the story, and antagonist logic outlining potential opposing forces. You can reroll involvements or antagonist options individually, combine multiple elements, or ignore anything that doesn’t fit — these are narrative prompts, not fixed rules. Cracks introduce subtle hints that things aren’t what they seem, helping you unlock new directions when the plot stalls. Cost of Inaction provides narrative consequences if the hero delays or fails to act. Hidden Twist is a deeper revelation meant to be ignored at first and used only if the quest grows into a longer arc or full campaign." },
      { label: "Open Quest", description: "Sometimes a tightly structured quest can feel restrictive, and you may prefer a looser beginning that leaves more room for improvisation. In those cases, you can use the Open Quest generator: it creates a freeform narrative incipit with no structural constraints, giving you a starting point that you can shape however you like. From there, you can let the Oracle, skill checks, and the Situations Table guide the direction of the story, allowing the plot to evolve naturally through your choices and the unfolding fiction." },
      { label: "Reroll Quest Parts", description: "In the Quest modal, hover over any block to reveal a reroll button — update just that element without regenerating the whole hook." },
      { label: "Ask the Oracle", description: "The Oracle is what drives the story forward: by asking yes/no questions about anything — the world, NPC intentions, hidden dangers, or the outcome of uncertain situations — you shape the narrative one decision at a time. Choose a likelihood modifier to reflect how plausible the answer should be in the fiction: for example, if you’re locked in a cell and ask ‘Is the door closed’, selecting A Certainty increases the chance of a ‘Yes’ result. The roll returns one of six narrative outcomes, from ‘No, and…’ to ‘Yes, and…’, giving you not just an answer but a direction for what happens next." },
      { label: "Attempt Action", description: "Use Attempt Action to describe what your character tries to do, select the appropriate skill and roll directly within the narrative. Choose a difficulty from DC 5 (very easy) to DC 30 (nearly impossible), and optionally select a skill to apply. You can roll skills from the character sheet as well, but Attempt Action integrates the check into the unfolding fiction and gives you immediate feedback on whether the action succeeds or fails. It’s ideal for resolving improvised actions, risky maneuvers, or any moment where you want the story to react dynamically to your character’s choices." },
      { label: "Situations Table", description: "When the Oracle isn’t enough and you need fresh ideas to push the story forward, the Situations Table provides hundreds of action verbs to spark new directions. Roll 1–5 verbs and interpret them creatively within the current scene. For example, if you’re speaking with an NPC and draw ESCORT, DEMAND, STEAL, you might decide that the NPC begs you to escort him out of the city because a mysterious group has been trying to steal a cherished family relic. The table doesn’t dictate what must happen — it offers narrative seeds you can grow into the next twist of your adventure." },
    ],
    tip: "Combine the Oracle with the Lore Engine: ask 'Is the cult connected to the ancient ruin?' then if the answer is 'Yes' roll on the Lost Civilization module to generate details about the ruin that you can integrate into the cult's motives and activities." ,
  },

  settlement_services: {
    title: "Settlement Services",
    summary: "Explore procedurally generated towns and cities. Each district has named locations with NPCs, shops, interactions, and potential disturbances.",
    features: [
      { label: "Generate New Town", description: "Use the size selector (Encampment → Metropolis) to create a new settlement, or let the system pick a random size for you. The number of districts and the amount of buildings scale with the settlement’s size — small camps have only a few key locations, while large cities feature multiple districts packed with shops, NPCs, and services. You can always add or remove districts manually to better fit your narrative needs, adjusting the town’s structure as your story evolves." },
      { label: "Settlement Theme",  description: "Click ‘Settlement Theme’ to reveal a set of world‑building details that bring the town to life: biome, aesthetic, government and its alignment, population, economy, tensions, religion, sensory details, and a defining landmark or centerpiece. You can reroll any individual property or regenerate the entire theme at once. Ambiguous or unusual combinations — like a stilt village in the desert — are intentional prompts meant to spark creativity, letting you imagine magical explanations or unique local stories. As always, treat these elements as inspiration: keep what enriches your narrative, ignore what doesn’t, and shape the settlement into the version that best serves your adventure."},
      { label: "Districts & Locations", description: "Each district type (Trade, Arcane, Military...) has thematically appropriate buildings with unique names. You can remove existing districts or add new ones" },
      { label: "Rename Anything", description: "Hover over any settlement, district, or location name to reveal a pencil icon — click it to rename." },
      { label: "Reroll Buildings", description: "Use the ↺ button on any district to regenerate its locations while keeping the district type." },
      { label: "Enter a Location", description: "Click any location card to enter it. You'll see its NPCs, available interactions, and shop inventory. Each location always includes at least one NPC appropriate to the place, and there’s a chance a second NPC with a different role may appear — someone who happens to be there for their own reasons and can help spark new narrative threads. You can remove unwanted NPCs or use ‘Create NPC’ to add characters you’ve generated in the NPC section. Every location is filled with thematic interactions — subquests, gossip, rumors, mysteries, and more — designed to enrich the scene and provide story hooks that naturally push the adventure forward. Use 'Back to town' to leave the location" },
      { label: "Disturbance", description: "The ⚠ button generates a thematic incident for that district — a spark for unexpected roleplay. The Outcome is creted to give a narrative hook for you to follow." },
      { label: "Urban Event", description: "The 'Urban Event' button at the bottom of the district list rolls on the full d100 event table for the whole settlement. These events are different from the District Disturbance and are of a more general nature." },
    ],
    tip: "Long Rest costs 10 GP at any inn. Healing costs 15 GP at temples. Check the location's interaction list for available services. These costs are just for reference, you can adjust the cost to the situation.",
  },

  wilderness_travel: {
    title: "Wilderness & Travel",
    summary: "Plan and execute multi-day journeys across different terrains. Each day brings potential events, encounters, and discoveries.",
    features: [
      { label: "Plan Journey", description: "Set a destination name, choose the terrain biome, and estimate the duration of the journey in days — or randomize the travel length if you’re unsure how long the trip should take. The selected biome also determines the type of random events you may encounter along the way, since each environment has its own thematic dangers, discoveries, and complications. Planning a journey isn’t just about distance: the biome shapes the atmosphere of the trip and the narrative twists that might emerge during travel." },
      { label: "Travel Day", description: "Click ‘Travel Day’ to advance the journey one in‑game day. Each day carries a chance for a random event — read the narrative log and respond as you see fit. If you want to trigger an encounter intentionally, you can also click ‘Random Event’ to force one." },
      { label: "Random Event", description: "Manually trigger a wilderness event for the current terrain — useful if the day roll was uneventful but you want drama.  Some events call for skill checks, while others simply invite you to roleplay the situation. When appropriate, the interface suggests using the Oracle, the Situations Table, or the Lore Engine to help you interpret what happens. You’re free to ignore an event or reroll a new one if it doesn’t fit your story." },
      { label: "Camping", description: "At the end of each travel day, your party makes camp (Click 'Camping' to rest): you can choose a peaceful rest or roll for a nighttime incident, resolved in the same way as daytime encounters." },
      { label: "Arrive", description: "When the day counter reaches the total, click 'Arrive' to transition to Dungeon selection at the destination." },
      { label: "Rations", description: "The rations counter tracks food supply. Running out should trigger narrative consequences of your choosing. This feature is not implemented yet." },
    ],
    tip: "If an encounter has a Skill Check block, click 'Roll to Withstand' to resolve it mechanically. Otherwise use 'Resolve Narratively'.",
  },

  dungeon_exploration: {
    title: "Dungeon Exploration",
    summary: "Explore room-by-room dungeons with procedurally generated content. Each room rolls six colour-coded dice for monsters, clues, environment, NPCs, treasure, and events.",
    features: [
      { label: "Find Dungeon", description: "Choose a dungeon type (Cave, Tomb, Laboratory...) and a room count (3–20). The theme affects room names, features, and atmosphere." },
      { label: "Room Overview", description: "When you enter a room, the system immediately reveals its room type, a defining feature, and an initial descriptive prompt. These elements are meant to be combined, rearranged, or ignored depending on what best serves your story. The tool provides structure, but it’s up to you to decide how these details interact and how the scene unfolds narratively."},
      { label: "Next Room", description: "Click 'Next Room' to advance. A narrative entry is generated, followed by any triggered elements." },
      { label: "Colour Dice", description: "Six dice drive the room content — Purple (Monsters), Blue (Clues), Green (Environment), Red (NPC), Gold (Treasure), Multicolour (Events). A 7+ triggers that element. The multicolour die contains a variety of event types such as skill challenges, traps, boon, bane and narrative events." },
      { label: "Reroll a Die", description: "Click any die button to reroll just that element — useful if a result doesn't fit the narrative." },
      { label: "Encounter Difficulty", description: "Purple die 8+ does not select the enemy, but sets a difficulty rating. Use the Encounter Suggester in Combat Tools to find appropriate enemies that match the narrative. You can also use the Bestiary to find suitable creatures." },
      { label: "Loot", description: "Gold die 7+ generates room loot. Click 'Claim All' to add it to your inventory automatically. The loot scales with your character's level." },
      { label: "Clues & NPCs", description: "Blue and Red results add narrative depth. Click NPC cards to inspect the full character sheet and use the clues to drive the narrative (use the Oracle and Situations Table to explore the implications)." },
    ],
    tip: "Dungeons are complete when you reach the final room count. The progress bar at the top tracks your depth. When you finish, you can choose to return to the settlement to rest and prepare for the next adventure or you can face a thematic boss listed in the Villain section." ,
  },

  combat_tools: {
    title: "Combat Tools",
    summary: "Manage turn-based combat with initiative tracking, attack and damage rolls, ability usage, and an encounter suggester to build balanced fights.",
    features: [
      { label: "Encounter Suggester", description: "Start by selecting the encounter difficulty and, optionally, a monster type and environment. The tool generates multiple encounter options scaled to your character’s level. Choose the one that fits your narrative and click 'Add to Arena' to begin combat. These suggestions are prompts — you decide which encounter feels right for the story you’re telling."},
      { label: "Initiative & Turn Order", description: "When combat begins, all combatants roll initiative automatically. The turn order is sorted from highest to lowest, and the active combatant is highlighted in red. This keeps the flow of combat clear and ensures you always know who acts next."},
      { label: "Abilities & Combat Actions", description: "Both player and enemies display their available abilities. Enemy names are clickable to open their stat block. Once you choose an action, use the Hit Settings and Damage Settings to roll the appropriate dice with modifiers. The system handles attack rolls, damage rolls, and ability usage while leaving full narrative control to you."},
      { label: "HP & Saving Throws", description: "Enemy HP can be adjusted using the +/− buttons or by typing damage directly (e.g. '-7'). The tool updates their health automatically. For abilities requiring saving throws, both player and enemies have quick‑access save bars to roll instantly. This keeps combat fast and fluid without breaking immersion."},
      { label: "Combat Oracle", description: "If you're unsure how enemies should act, the Combat Oracle provides contextual yes/no questions to guide their behavior. Prompts adapt dynamically based on HP thresholds, environment, and the flow of battle. Use them to introduce unpredictability, environmental shifts, or tactical decisions that enrich the encounter."},
      { label: "Experience & Aftermath", description: "When the fight ends, you can assign yourself XP — either the base amount for the defeated enemies or a higher value to reflect narrative factors such as difficulty, clever tactics, or environmental challenges. The tool supports the mechanics, but the final reward is always shaped by your story."},
      { label: "Manage Encounter", description: "During combat, click 'Manage Encounter' to add reinforcements or remove defeated enemies." },
    ],
    tip: "Use the Encounter Suggester to find monsters that fit the narrative and scale with your character's level. If you want a specific creature, use the Bestiary to find it and add it to the arena manually." ,
  },

};
