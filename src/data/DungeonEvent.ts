// types.ts

export type DungeonType =
  | 'Ruin'
  | 'Tomb / Crypt'
  | 'Temple or Shrine'
  | 'Maze'
  | 'Cave'
  | 'Laboratory'
  | 'Guild / Cult Headquarters'
  | 'Prison'
  | 'Mine'
  | 'Lair'
  | 'Cemetery'
  ;

export type MechanicalTag =
  | 'narrative'
  | 'skill_check'
  | 'resource_gain'
  | 'resource_loss'
  | 'status_positive'
  | 'status_negative'
  | 'choice';

export type Intensity = 'minor' | 'significant' | 'rare';

export type DungeonEvent = {
  name: string;
  trigger: string;
  consequence: string;
  oracle_seed?: string;
  mechanical_tag: MechanicalTag;
  intensity: Intensity;
  dungeon_types: DungeonType[] | 'all';
};



// RANDOM_EVENTS — esempi Ricorda: nessun effetto meccanico diretto. Ogni entry deve invitare l'Oracle o spingere il giocatore a fare qualcosa.

export const RANDOM_EVENTS: DungeonEvent[] = [

    {
    name: "The Cartographer's Mistake",
    trigger: "A section of wall has been carefully marked with chalk — measurements, distances, notations. Someone mapped this place recently. The marks are fresh.",
    consequence: "Use the Oracle: did the cartographer find what they were looking for, and are they still in here?",
    oracle_seed: "Is the person who made these marks still alive and in this dungeon?",
    mechanical_tag: 'narrative',
    intensity: 'minor',
    dungeon_types: ['Ruin', 'Tomb / Crypt', 'Temple or Shrine', 'Maze']
    },

    {
    name: "Wrong Direction",
    trigger: "Every instinct tells you the exit is behind you. But you came from behind you. The corridor you walked looks different from this side.",
    consequence: "Use the Oracle: is this place actively disorienting you, or did you take a wrong turn you don't remember taking?",
    oracle_seed: "Has the dungeon's layout shifted, or is something affecting my perception?",
    mechanical_tag: 'narrative',
    intensity: 'minor',
    dungeon_types: ['Maze', 'Cave', 'Laboratory']
    },

    {
    name: "Someone's Camp",
    trigger: "A bedroll, a cold fire pit, three empty ration wrappers. Someone camped here — not recently enough for the ashes to still be warm, but recently enough that the bedroll hasn't gathered dust.",
    consequence: "Use the Oracle: who camped here and why did they stop?",
    oracle_seed: "Did the person who camped here leave voluntarily, and are they somewhere in this dungeon?",
    mechanical_tag: 'narrative',
    intensity: 'minor',
    dungeon_types: 'all'
    },

    {
    name: "The Last Entry",
    trigger: "A journal lies open on the ground. The last entry is mid-sentence, as if the writer stopped abruptly. The handwriting changes quality as you read — starting careful, becoming frantic.",
    consequence: "Use the Oracle to determine what the last legible words describe. They concern something in the next room.",
    oracle_seed: "What did the journal writer encounter that made them stop writing?",
    mechanical_tag: 'narrative',
    intensity: 'significant',
    dungeon_types: ['Laboratory', 'Guild / Cult Headquarters', 'Prison']
    },

    {
    name: "The Sound That Doesn't Echo",
    trigger: "You drop something — a coin, a stone — and it hits the floor without producing an echo. In a space this size, that's wrong. Sound is being absorbed by something you can't see.",
    consequence: "Use the Oracle: is this a magical effect, a creature, or a property of the material in this room?",
    oracle_seed: "Is the absence of echo a warning sign, and should I move through this room differently?",
    mechanical_tag: 'narrative',
    intensity: 'minor',
    dungeon_types: ['Cave', 'Mine', 'Tomb / Crypt']
    },

    {
    name: "The Recurring Symbol",
    trigger: "A symbol you've seen twice before in this dungeon appears again here — carved, scratched, or drawn in a way that suggests intention rather than decoration. Three is not a coincidence.",
    consequence: "Use the Oracle to determine what the symbol means and whether understanding it gives you an advantage or reveals a danger.",
    oracle_seed: "Is this symbol a warning, a marker, or part of a ritual that is still active?",
    mechanical_tag: 'narrative',
    intensity: 'significant',
    dungeon_types: ['Temple or Shrine', 'Guild / Cult Headquarters', 'Tomb / Crypt', 'Ruin']
    },

    {
    name: "Structural Concern",
    trigger: "A section of ceiling looks wrong — bowed slightly, with hairline fractures radiating from a central point. It has been like this for a while. It may continue to be like this for a while longer. Or not.",
    consequence: "You are now aware of it. Whether it matters depends on what happens next in this room.",
    oracle_seed: "Will something in the next encounter cause this ceiling to become a problem?",
    mechanical_tag: 'narrative',
    intensity: 'minor',
    dungeon_types: ['Cave', 'Mine', 'Ruin', 'Prison']
    },

    {
    name: "The Witness",
    trigger: "A creature — small, non-threatening, clearly not a predator — watches you from a high ledge. It doesn't flee. It has been here long enough not to fear things that pass through.",
    consequence: "Use the Oracle: has this creature seen something useful, and is there a way to learn from it?",
    oracle_seed: "Has this creature witnessed something important recently, and can I communicate with it?",
    mechanical_tag: 'narrative',
    intensity: 'minor',
    dungeon_types: ['Cave', 'Lair', 'Mine', 'Cemetery']
    },

      {
    name: "The Other Footprints",
    trigger: "Your own footprints are visible in the dust behind you. So are someone else's — same direction, same spacing, but slightly smaller. They start at the room entrance and stop three feet behind where you're standing now.",
    consequence: "Use the Oracle to determine whether the second set of prints belongs to something that is still following you or something that was here before you arrived.",
    oracle_seed: "Is whatever made these prints still in this room with me?",
    mechanical_tag: 'narrative',
    intensity: 'significant',
    dungeon_types: ['Tomb / Crypt', 'Ruin', 'Prison', 'Maze', 'Temple or Shrine']
  },
 
  {
    name: "The Unfinished Work",
    trigger: "A half-completed task sits abandoned mid-process — a ritual circle drawn but not closed, a forge with a blade still cooling in it, a message half-carved into stone. Whatever interrupted this, it interrupted it suddenly.",
    consequence: "Use the Oracle to determine what stopped this work and whether completing or destroying it would affect what comes next.",
    oracle_seed: "Was this abandoned out of fear, death, or deliberate choice — and does finishing it help or harm me?",
    mechanical_tag: 'narrative',
    intensity: 'significant',
    dungeon_types: ['Laboratory', 'Guild / Cult Headquarters', 'Temple or Shrine', 'Mine', 'Tomb / Crypt']
  },
 
  {
    name: "Familiar Architecture",
    trigger: "This room is laid out identically to one you passed through earlier — same dimensions, same door positions, same wear patterns on the floor. It cannot be the same room. You came from a different direction.",
    consequence: "Use the Oracle to determine whether this is a structural coincidence, a deliberate design, or something actively wrong with the space you are in.",
    oracle_seed: "Has the dungeon's geometry changed, or is something distorting my perception of where I've been?",
    mechanical_tag: 'narrative',
    intensity: 'minor',
    dungeon_types: ['Maze', 'Laboratory', 'Temple or Shrine', 'Ruin', 'Guild / Cult Headquarters']
  },
 
  {
    name: "The Thing That Was Fed",
    trigger: "A pile of bones, stripped clean and neatly arranged, sits in the corner of the room. Not the remains of a fight — these were placed here. Something was fed here regularly. The most recent deposit is not old.",
    consequence: "Use the Oracle to determine what was fed here, whether it is still being fed, and whether it is still somewhere in this dungeon.",
    oracle_seed: "What creature was being maintained here, and is whoever was feeding it still alive?",
    mechanical_tag: 'narrative',
    intensity: 'significant',
    dungeon_types: ['Lair', 'Prison', 'Guild / Cult Headquarters', 'Cave', 'Laboratory']
  },
 
  {
    name: "Wrong Season",
    trigger: "A flowering plant grows from a crack in the stone — not a weed, a deliberately cultivated species that blooms only in a specific season. The season it blooms in is not now. It is flowering anyway.",
    consequence: "Use the Oracle to determine whether something in this dungeon is altering the environment deliberately, and what that implies about who or what maintains this place.",
    oracle_seed: "Is this growth natural, magical, or a sign that time or seasons work differently in some part of this dungeon?",
    mechanical_tag: 'narrative',
    intensity: 'minor',
    dungeon_types: ['Temple or Shrine', 'Laboratory', 'Cave', 'Ruin', 'Cemetery']
  }
];

// SKILL_CHALLENGES — esempi La chiave qui è variare la posta: non sempre danno, non sempre blocco del percorso. A volte è una risorsa, a volte è informazione, a volte è tempo.

export const SKILL_CHALLENGES: DungeonEvent[] = [
    {
    name: "Failing Rope",
    trigger: "A rope bridge crosses a gap. It holds your weight — barely. Halfway across, a support rope snaps.",
    consequence: "Athletics DC 14. Success: cross safely. Failure: fall to the ledge below — take 1d6 damage and must find another route back up, costing one extra room of exploration.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Cave', 'Mine', 'Ruin', 'Maze']
    },

    {
    name: "Collapsing Archive",
    trigger: "A bookshelf or document rack is actively collapsing — papers, scrolls, and records sliding toward a fire source or a pool of corrosive liquid.",
    consequence: "Investigation DC 13. Success: you recover one useful document — use the Oracle to determine its content. Failure: the records are lost, but you avoid the collapse. Critical failure (miss by 5+): take 1d4 acid or fire damage.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Laboratory', 'Guild / Cult Headquarters', 'Temple or Shrine']
    },

    {
    name: "The Wounded Prisoner",
    trigger: "Someone is locked in a cell or bound in a corner. They're conscious but injured. They've been here long enough to be suspicious of anyone who approaches.",
    consequence: "Persuasion DC 12 or Medicine DC 11. Success: they share one piece of information about the dungeon's layout or inhabitants — use Oracle to determine what. Failure: they refuse to speak and may alert someone with noise if you press further.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Prison', 'Guild / Cult Headquarters', 'Lair']
    },

    {
    name: "Toxic Bloom",
    trigger: "A cluster of luminescent fungi or alchemical residue fills the narrow passage ahead. The air shimmers faintly where it meets the growth.",
    consequence: "Constitution DC 13 or Nature DC 12 (to find a safe path). Success: pass through unaffected. Failure: poisoned condition until next short rest and disadvantage on Constitution saves for this dungeon.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Cave', 'Laboratory', 'Mine', 'Lair']
    },

    {
    name: "The Unstable Idol",
    trigger: "An idol or reliquary stands on a pressure-sensitive plinth. Something has shifted — it's leaning, and the mechanism beneath it is audibly straining.",
    consequence: "Sleight of Hand DC 15 or Arcana DC 14. Success: you stabilize it and may examine it — roll for a minor boon. Failure: it topples. Roll on TRAP_TABLE for what activates.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Temple or Shrine', 'Tomb / Crypt', 'Ruin']
    },

    {
    name: "The Flooded Passage",
    trigger: "The corridor ahead is knee-deep in black water. It moves slightly — there's current from somewhere. The far end is thirty feet away.",
    consequence: "Athletics DC 12 or Survival DC 13. Success: wade through, arrive damp but unharmed. Failure: pulled off balance — lose one use of a movement-based ability (Dash, Disengage, or similar) for the next encounter. Critical failure: pulled under, take 1d8 cold damage.",
    mechanical_tag: 'skill_check',
    intensity: 'minor',
    dungeon_types: ['Cave', 'Mine', 'Prison', 'Ruin']
    },

    {
    name: "The Fleeing Cultist",
    trigger: "A robed figure sprints past you — not attacking, running. They drop something as they go. You have a moment to grab them, grab the object, or let them go.",
    consequence: "Choice. Grab them: Athletics DC 13 — success gives you a captive with information, failure means they escape and may alert others. Grab the object: free action — use Oracle to determine what it is. Let them go: safe, but they may complicate a later room.",
    mechanical_tag: 'choice',
    intensity: 'significant',
    dungeon_types: ['Guild / Cult Headquarters', 'Temple or Shrine', 'Laboratory']
    },

    {
    name: "Overloaded Mechanism",
    trigger: "A gear-and-lever system on the wall is jammed in an intermediate position. It controls something — a door, a portcullis, a light source. In its current state it does nothing. Fixed or broken, it would do something.",
    consequence: "Tinker's Tools or Investigation DC 14. Success: you control what it operates — use Oracle to determine what that is and whether it helps. Failure: it breaks permanently. Critical failure: triggers whatever it was holding in check.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Laboratory', 'Mine', 'Prison', 'Guild / Cult Headquarters']
    },

      {
    name: "The Sealed Testimony",
    trigger: "A locked strongbox sits on a desk or altar. It is clearly not empty — something shifts inside when tilted. The lock is good work. So is the warding mark scratched into the lid, which may or may not still be active.",
    consequence: "Two paths. Thieves' Tools DC 14 to pick the lock cleanly — success opens it without incident, use Oracle for contents. Alternatively, Arcana DC 13 to safely discharge the ward first, then open freely. Ignoring the ward and forcing it: automatic trap trigger, roll on TRAP_TABLE, then the box opens anyway.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Guild / Cult Headquarters', 'Laboratory', 'Temple or Shrine', 'Tomb / Crypt', 'Prison']
  },
 
  {
    name: "The Shifting Ceiling",
    trigger: "A section of ceiling is descending — slowly but unmistakably. The mechanism that triggered it is somewhere in the room. The exit on the far side is twenty feet away and currently clear.",
    consequence: "Two paths. Investigation DC 13 to find and jam the mechanism — success stops the ceiling permanently, freeing up the room for thorough search. Or simply run: Athletics DC 11 to cross before clearance drops below movement height. Failure on the run: take 1d6 bludgeoning damage and arrive prone on the far side. Failure by 5+: also lose one inventory item crushed in the gap.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Tomb / Crypt', 'Ruin', 'Mine', 'Maze', 'Prison']
  },
 
  {
    name: "The Informant",
    trigger: "A prisoner, a cultist who lost their faith, a creature with grievances — someone in this room wants out badly enough to talk. They have information. They also have conditions, and they are not entirely stable.",
    consequence: "Insight DC 12 first to read their reliability — success tells you whether what they offer is likely true. Then Persuasion DC 13 or Intimidation DC 15 to negotiate terms. Success: they reveal one layout detail or threat in the next two rooms — use Oracle for specifics. Failure on negotiation: they clam up and may cause noise or complications if left.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Prison', 'Guild / Cult Headquarters', 'Lair', 'Laboratory', 'Temple or Shrine']
  },
 
  {
    name: "The Unstable Shaft",
    trigger: "The only path forward descends through a vertical shaft — iron rungs bolted into the stone. Several of the rungs are visibly corroded. The shaft is thirty feet deep. The air below smells of water.",
    consequence: "Athletics DC 12 to descend carefully. Success: reach the bottom unharmed. Failure: one rung gives — DC 14 Dexterity save to catch yourself, taking 1d6 damage on success, 3d6 and prone at the bottom on failure. Alternatively, use rope and Athletics DC 10 — slower but safer. No rope and no check: automatic failure.",
    mechanical_tag: 'skill_check',
    intensity: 'minor',
    dungeon_types: ['Mine', 'Cave', 'Prison', 'Ruin', 'Laboratory']
  },
 
  {
    name: "The Living Fresco",
    trigger: "A wall painting is moving — figures walking in a slow loop, a battle that never ends, a ceremony that repeats every few minutes. Studying it long enough reveals a detail that does not loop with the rest: something hidden in the pattern.",
    consequence: "Perception DC 11 to notice the anomaly. Then Arcana DC 14 or History DC 13 to interpret what the static element means. Success: gain a specific piece of information about the dungeon's purpose or a threat ahead — use Oracle. Failure on interpretation: you understand it is significant but not what it means. Spending ten minutes studying it removes the need for the second check but costs exploration time.",
    mechanical_tag: 'skill_check',
    intensity: 'significant',
    dungeon_types: ['Temple or Shrine', 'Tomb / Crypt', 'Ruin', 'Guild / Cult Headquarters']
  }
];

// BOON — esempi Ogni boon ha una fonte narrativa — non cade dal cielo, viene da qualcosa nel dungeon. E ogni boon ha intensità calibrata.

export const BOON: DungeonEvent[] = [

    {
    name: "Ancestral Resonance",
    trigger: "A carving on the wall depicts a figure in a posture of combat. For a moment — just a moment — the figure's stance feels familiar, like a memory that isn't yours.",
    consequence: "Gain advantage on your first attack roll in the next combat encounter.",
    mechanical_tag: 'status_positive',
    intensity: 'minor',
    dungeon_types: ['Tomb / Crypt', 'Temple or Shrine', 'Ruin']
    },

    {
    name: "The Provisions Cache",
    trigger: "Behind a loose stone or inside a forgotten chest: rations, a healing kit, and two torches. Someone hid these here deliberately and never came back for them.",
    consequence: "Recover 1d6+2 HP and gain one use of a Healer's Kit.",
    mechanical_tag: 'resource_gain',
    intensity: 'minor',
    dungeon_types: 'all'
    },

    {
    name: "Shrine Intact",
    trigger: "A small shrine — to a god, a spirit, a concept — stands untouched in this room. It has been maintained. Someone was here recently enough to keep it clean.",
    consequence: "Spend one minute in prayer or contemplation. Regain one expended spell slot of level 1 or 2, or regain one use of a class feature that recharges on a short rest.",
    mechanical_tag: 'resource_gain',
    intensity: 'significant',
    dungeon_types: ['Temple or Shrine', 'Tomb / Crypt', 'Cemetery', 'Ruin']
    },

    {
    name: "The Poison Antidote",
    trigger: "A vial sits in a careful wooden holder — labeled in a hand that knew what they were doing. The contents are clear and smell faintly of herbs.",
    consequence: "Gain one use of a universal antidote. Cures poisoned condition when consumed and grants advantage on Constitution saves for the next hour.",
    mechanical_tag: 'resource_gain',
    intensity: 'significant',
    dungeon_types: ['Laboratory', 'Cave', 'Lair']
    },

    {
    name: "Ley Convergence",
    trigger: "The air in this room hums at a frequency you feel in your teeth. The floor has faint geometric patterns worn into it — not carved, worn, by years of energy passing through.",
    consequence: "For the rest of this dungeon, once per room you may reroll one die and keep either result.",
    mechanical_tag: 'status_positive',
    intensity: 'rare',
    dungeon_types: ['Temple or Shrine', 'Ruin', 'Cave', 'Laboratory']
    },

    {
    name: "The Defender's Mark",
    trigger: "A glyph activates briefly as you pass — not aggressive. It reads you, finds something acceptable, and leaves a faint luminescence on your skin that fades within the hour.",
    consequence: "Gain temporary HP equal to your level + Constitution modifier. These persist until the next room transition.",
    mechanical_tag: 'status_positive',
    intensity: 'significant',
    dungeon_types: ['Temple or Shrine', 'Guild / Cult Headquarters', 'Tomb / Crypt']
    },

    {
    name: "Predator's Mark Removed",
    trigger: "Something in this room — a ritual circle, a running water source, a specific herb growing through the stone — neutralizes whatever has been tracking you.",
    consequence: "Any active BANE effect with the tag 'status_negative' ends immediately.",
    mechanical_tag: 'status_positive',
    intensity: 'rare',
    dungeon_types: 'all'
    },

    {
    name: "The Right Tool",
    trigger: "Among debris or on a workbench: exactly the tool you needed and didn't have. It's in good condition. It was left here recently enough that it hasn't rusted.",
    consequence: "Gain proficiency with one tool of your choice for the rest of this dungeon, or gain advantage on the next skill check you make with an existing proficiency.",
    mechanical_tag: 'resource_gain',
    intensity: 'minor',
    dungeon_types: ['Mine', 'Laboratory', 'Prison', 'Guild / Cult Headquarters']
    },

      {
    name: "The Sleeper's Gift",
    trigger: "An alcove in the wall holds a body that has been dead for decades — but arranged with care, hands folded, a small object placed between them. The object is meant to be taken. You understand this without knowing why.",
    consequence: "Take the object. It is a single-use charm: once before the end of this dungeon, you may choose to automatically succeed on one saving throw. The charm then crumbles.",
    mechanical_tag: 'resource_gain',
    intensity: 'significant',
    dungeon_types: ['Tomb / Crypt', 'Cemetery', 'Temple or Shrine', 'Ruin']
  },
 
  {
    name: "Vein of the Mountain",
    trigger: "A mineral deposit in the wall catches the light differently from the surrounding stone — not gem-quality, but the kind of material that conducts and focuses. A miner would know it immediately. A mage would feel it.",
    consequence: "Spend five minutes working a fragment free. Gain a piece of raw focus material: your next spell that requires Concentration does not require Concentration for its first minute of duration.",
    mechanical_tag: 'resource_gain',
    intensity: 'minor',
    dungeon_types: ['Mine', 'Cave', 'Laboratory']
  },
 
  {
    name: "The Empty Scabbard's Promise",
    trigger: "A weapon rack holds nothing — everything has been taken or destroyed — except for a single remaining item in perfect condition, overlooked or deliberately left. It fits your hand as if made for it.",
    consequence: "The weapon counts as a +1 magic weapon for the remainder of this dungeon. It loses this property when you leave.",
    mechanical_tag: 'status_positive',
    intensity: 'significant',
    dungeon_types: ['Prison', 'Guild / Cult Headquarters', 'Ruin', 'Lair', 'Mine']
  },
 
  {
    name: "Known Ground",
    trigger: "Something in this room — a layout, a smell, a particular type of stonework — triggers a specific memory or piece of training. You have prepared for exactly this kind of place, even if you didn't know it.",
    consequence: "For the next two rooms, you have advantage on Perception checks and cannot be Surprised.",
    mechanical_tag: 'status_positive',
    intensity: 'minor',
    dungeon_types: 'all'
  },
 
  {
    name: "The Intact Phylactery",
    trigger: "A small sealed container — ceramic, metal, glass — sits undisturbed in a niche. It hums at a frequency you feel rather than hear. Whatever is stored inside was placed here to be available when needed.",
    consequence: "The phylactery contains a single charge of stored magical energy. Use it as a free action to either: regain one expended spell slot of any level up to 3rd, or heal 2d8+4 HP. The container crumbles after use.",
    mechanical_tag: 'resource_gain',
    intensity: 'rare',
    dungeon_types: ['Temple or Shrine', 'Laboratory', 'Tomb / Crypt', 'Guild / Cult Headquarters']
  }

];


// BANE — esempi Stessa logica del boon: fonte narrativa, tre intensità, sempre con una ragione nel mondo. Niente "Cursed X: -1 to Y" senza contesto.

export const BANE: DungeonEvent[] = [

    {
    name: "Bad Air",
    trigger: "The air here is stale in a way that goes beyond age. Something is decaying nearby, or the oxygen has been consumed by something you haven't identified yet.",
    consequence: "Disadvantage on Constitution saves until you exit this dungeon or complete a short rest in fresh air.",
    mechanical_tag: 'status_negative',
    intensity: 'minor',
    dungeon_types: ['Cave', 'Mine', 'Tomb / Crypt', 'Prison']
    },

    {
    name: "Marked",
    trigger: "You touched something you shouldn't have — a sealed urn, a ritual object, a ward you didn't recognize as such. The sensation passes quickly. The effect doesn't.",
    consequence: "The next time you roll a natural 20, treat it as a natural 10 instead. This bane expires after one encounter.",
    mechanical_tag: 'status_negative',
    intensity: 'significant',
    dungeon_types: ['Temple or Shrine', 'Tomb / Crypt', 'Laboratory', 'Guild / Cult Headquarters']
    },

    {
    name: "The Wrong Step",
    trigger: "A floor tile, a trip wire, a pressure plate — you caught it just in time to know you activated it. Not in time to not activate it.",
    consequence: "An alarm has been raised somewhere in this dungeon. The next encounter roll is made with +2 to the result.",
    mechanical_tag: 'status_negative',
    intensity: 'significant',
    dungeon_types: ['Guild / Cult Headquarters', 'Laboratory', 'Prison', 'Temple or Shrine']
    },

    {
    name: "Spore Exposure",
    trigger: "A disturbed growth — fungal, alchemical, or something in between — releases a fine cloud as you pass through. You breathe some of it before you can cover your face.",
    consequence: "Poisoned condition for the next two rooms. Disadvantage on attack rolls and ability checks. Constitution DC 12 at the start of each room to end early.",
    mechanical_tag: 'status_negative',
    intensity: 'significant',
    dungeon_types: ['Cave', 'Laboratory', 'Mine', 'Lair']
    },

    {
    name: "The Noise You Made",
    trigger: "Something broke, something fell, something echoed louder than you expected. Somewhere in this dungeon, something heard it.",
    consequence: "The next room's monster roll is made with advantage by the GM — if a monster is present, it has already readied an action when you enter.",
    mechanical_tag: 'status_negative',
    intensity: 'minor',
    dungeon_types: 'all'
    },

    {
    name: "Cursed Ground",
    trigger: "The necrotic energy in this place has been seeping into everything for decades. You feel it moving against you — not attacking, just present, persistent, draining.",
    consequence: "Your maximum HP is reduced by your level until you complete a long rest outside this dungeon.",
    mechanical_tag: 'status_negative',
    intensity: 'significant',
    dungeon_types: ['Cemetery', 'Tomb / Crypt', 'Ruin', 'Temple or Shrine']
    },

    {
    name: "Equipment Damage",
    trigger: "Acid, corrosive gas, or a poorly contained alchemical reaction — something got to your gear. The damage is repairable, but not here, not now.",
    consequence: "One piece of equipment of your choice (weapon or armor) has its effectiveness reduced: -1 to attack rolls or -1 AC until repaired at a settlement.",
    mechanical_tag: 'resource_loss',
    intensity: 'minor',
    dungeon_types: ['Laboratory', 'Mine', 'Lair', 'Cave']
    },

    {
    name: "The Watcher's Interest",
    trigger: "Something in this dungeon has noticed you specifically — not as a threat, not as prey, but as a subject. You have the distinct feeling of being studied.",
    consequence: "For the remainder of this dungeon, once per room the GM may reroll one of your dice results and use the lower of the two. Use the Oracle to determine what is watching.",
    mechanical_tag: 'status_negative',
    intensity: 'rare',
    dungeon_types: 'all'
    },

      {
    name: "Territorial Residue",
    trigger: "You have passed through a creature's marked territory without realizing it. The scent markers are invisible to you. The creature's awareness of you is not.",
    consequence: "The next room's encounter roll is made with a +2 modifier. If a creature is present, it begins the encounter already hostile and aware of your position — no Stealth or Surprise is possible.",
    mechanical_tag: 'status_negative',
    intensity: 'minor',
    dungeon_types: ['Cave', 'Lair', 'Mine', 'Cemetery', 'Ruin']
  },
 
  {
    name: "The Obligation",
    trigger: "You accepted something — shelter from a ward, a tool that worked when you needed it, passage through a sealed door that opened without your input. The dungeon has noted this. Debts here are structural.",
    consequence: "The next BOON result you roll is negated — the dungeon collects what it is owed before it gives again. This bane expires after the debt is cancelled.",
    mechanical_tag: 'status_negative',
    intensity: 'significant',
    dungeon_types: ['Temple or Shrine', 'Tomb / Crypt', 'Ruin', 'Maze']
  },
 
  {
    name: "Gravity Inconsistency",
    trigger: "Something is wrong with how weight works in this part of the dungeon. Not dramatically — you do not float, nothing flies. But your footing is subtly unreliable in a way that worsens precisely when you need stability.",
    consequence: "Disadvantage on Athletics and Acrobatics checks until you exit this dungeon or pass through a room where a BOON is rolled. Any enemy that grapples you does so with advantage.",
    mechanical_tag: 'status_negative',
    intensity: 'significant',
    dungeon_types: ['Laboratory', 'Maze', 'Ruin', 'Temple or Shrine', 'Guild / Cult Headquarters']
  },
 
  {
    name: "Suppressed Instincts",
    trigger: "A psychic dampener, a ward against aggression, a residual enchantment meant to keep something docile — whatever its original purpose, it is now affecting you. Your threat response is slower than it should be.",
    consequence: "You cannot benefit from advantage on Initiative rolls for the rest of this dungeon. Additionally, you cannot take reactions during the first round of the next combat encounter.",
    mechanical_tag: 'status_negative',
    intensity: 'significant',
    dungeon_types: ['Prison', 'Laboratory', 'Temple or Shrine', 'Guild / Cult Headquarters']
  },
 
  {
    name: "Consumed Reserves",
    trigger: "The environment here is more demanding than it appears — thin air, psychic pressure, background radiation from a magical source. Your body is working harder than you realized, and it has already spent resources you were counting on.",
    consequence: "Immediately expend one use of your most-used limited resource: a spell slot, a class feature charge, a use of an action surge, or similar. Use Oracle if ambiguous. This cannot be recovered until a long rest outside this dungeon.",
    mechanical_tag: 'resource_loss',
    intensity: 'significant',
    dungeon_types: ['Cave', 'Mine', 'Tomb / Crypt', 'Laboratory', 'Ruin']
  }

];





export interface Trap {
  name: string;
  clue: string;               // L'indizio ambientale per il Master
  trigger_mechanism: string;  // Cosa fa scattare la trappola
  perceptionDC: number;
  disarmDC: number;
  disarmSkill: string;        // Abilità richiesta (Sleight of Hand, Athletics, ecc.)
  disarmTool?: string;        // Strumento opzionale (Thieves' Tools)
  saveDC: number;             // Rinominato da 'dc' per chiarezza
  saveType: 'Dex' | 'Con' | 'Wis' | 'Int' | 'Str' | ' Cha'; // Tipo di tiro salvezza
  damageFormula: string;
  minDamage: string;
  consequences: string;       // Effetti narrativi secondari (rinominato da 'notes')
}




export const TRAPS: Trap[] = [
  {
    name: "Poison Darts",
    clue: "Small holes in the wall and oily residue around a slit; a thin tripwire runs along the floor.",
    trigger_mechanism: "Stepping on a hidden floor tile or tensioning a tripwire connected to the wall.",
    perceptionDC: 13,
    disarmDC: 14,
    disarmSkill: "Sleight of Hand or Investigation",
    disarmTool: "Thieves' Tools",
    saveDC: 12,
    saveType: "Dex",
    damageFormula: "(PC level - 3) d6",
    minDamage: "min 1d6",
    consequences: "Darts deal damage and poisoned condition may apply on a failed secondary CON save; the wall mechanism is noisy when triggered."
  },
  {
    name: "Collapsing Roof",
    clue: "Dust motes constantly fall from above and hairline cracks spider across the stone ceiling.",
    trigger_mechanism: "Stepping on a heavily weighted pressure plate in the center of the corridor.",
    perceptionDC: 13,
    disarmDC: 14,
    disarmSkill: "Athletics (to wedge spikes into cracks) or Investigation (to find and brace the architectural weak point)",
    disarmTool: "Iron spikes / Crowbar",
    saveDC: 12,
    saveType: "Dex",
    damageFormula: "(PC level - 2) d6",
    minDamage: "min 1d6",
    consequences: "Creates an area of difficult terrain and completely blocks the passage; clearing it loudly takes 10 minutes."
  },
  {
    name: "Simple Pit",
    clue: "A slight depression in the floor and wear marks on the edge of a slab.",
    trigger_mechanism: "A floor slab gives way under weight.",
    perceptionDC: 12,
    disarmDC: 13,
    disarmSkill: "Investigation (to understand the counterweight) or Sleight of Hand to jam the hinge",
    disarmTool: "Thieves' Tools",
    saveDC: 11,
    saveType: "Dex",
    damageFormula: "(PC level - 1) d6",
    minDamage: "min 1d6",
    consequences: "The fall separates the party; retrieving those who fell requires time and rope or climbing checks."
  },
  {
    name: "Hidden Pit",
    clue: "A mat or straw that feels slightly softer to the touch; a musty smell rising from below.",
    trigger_mechanism: "A camouflaged cover shifts when someone walks over it.",
    perceptionDC: 13,
    disarmDC: 14,
    disarmSkill: "Sleight of Hand (to jam the hinges with tools) or Survival (to safely wedge and secure the false floor)",
    disarmTool: "Thieves' Tools",
    saveDC: 11,
    saveType: "Dex",
    damageFormula: "(PC level - 1) d6",
    minDamage: "min 1d6",
    consequences: "Fallen characters end up in a dark pit; items dropped may be hard to recover without descending."
  },
  {
    name: "Locking Pit",
    clue: "Recessed metal rings along the floor edge and a hidden latch beneath a slab.",
    trigger_mechanism: "Stepping on a tile that activates hooks which lock the pit's rim.",
    perceptionDC: 14,
    disarmDC: 15,
    disarmSkill: "Sleight of Hand (to bypass the locking gears) or Investigation (to locate and jam the latch mechanism)",
    disarmTool: "Thieves' Tools",
    saveDC: 12,
    saveType: "Dex",
    damageFormula: "(PC level) d6",
    minDamage: "—",
    consequences: "The pit locks with hooks; anyone trapped must be freed from outside or pick the lock from below."
  },
  {
    name: "Spiked Pit",
    clue: "Rust stains and the faint glint of spikes visible at the bottom of a fissure.",
    trigger_mechanism: "A slab giving way or a cut rope that drops the cover.",
    perceptionDC: 14,
    disarmDC: 15,
    disarmSkill: "Sleight of Hand (to knot and secure the triggering rope) or Athletics (to wedge the slab firmly into the fissure walls)",
    disarmTool: "Thieves' Tools",
    saveDC: 12,
    saveType: "Dex",
    damageFormula: "(PC level) d6",
    minDamage: "—",
    consequences: "Spikes deal extra piercing damage and can cause bleeding; removing them requires tools and time."
  },
  {
    name: "Rolling Boulder",
    clue: "Abrasion marks on the floor and a circular niche in the wall above the corridor.",
    trigger_mechanism: "Stepping on a plate or cutting a rope that releases a heavy sphere.",
    perceptionDC: 14,
    disarmDC: 15,
    disarmSkill: "Survival (to securely tie off and brace the release rope) or Athletics (to wedge heavy spikes beneath the boulder inside its niche)",
    disarmTool: "Rope / Heavy Spikes / Crowbar",
    saveDC: 12,
    saveType: "Dex",
    damageFormula: "(PC level) d6",
    minDamage: "—",
    consequences: "The boulder can roll through multiple rooms, damaging multiple targets and blocking the passage with debris."
  },
  {
    name: "Scything Blade",
    clue: "Thin slits along the walls and a metallic scrape when you pass a hand near the edge.",
    trigger_mechanism: "A bar snaps when a door opens or a pressure plate is pressed.",
    perceptionDC: 15,
    disarmDC: 16,
    disarmSkill: "Sleight of Hand (to safely release the tension bar) or Athletics (to wedge an iron crowbar into the wall slit and jam the blade's pivot)",
    disarmTool: "Thieves' Tools / Crowbar",
    saveDC: 13,
    saveType: "Dex",
    damageFormula: "(PC level + 1) d6",
    minDamage: "—",
    consequences: "Blades leave deep cuts; carried items may be damaged or severed."
  },
  {
    name: "Elemental Glyph",
    clue: "Runes carved into the floor that faintly glow with elemental colors.",
    trigger_mechanism: "Stepping on the rune or touching it directly.",
    perceptionDC: 16,
    disarmDC: 17,
    disarmSkill: "Arcana (to disrupt the magical flow using a focus) or Sleight of Hand (to precisely deface or alter the rune's layout from a safe distance)",
    disarmTool: "Arcane focus / Chalk or Ink",
    saveDC: 14,
    saveType: "Dex",
    damageFormula: "(PC level + 1) d6",
    minDamage: "—",
    consequences: "The area remains unstable: persistent elemental effects (burning, freezing, slippery ice, etc.)."
  },
  {
    name: "Magic Bolt Trap",
    clue: "Small magical etchings and spark residue on a doorframe.",
    trigger_mechanism: "Breaking a magical filament or opening an arcane seal.",
    perceptionDC: 16,
    disarmDC: 17,
    disarmSkill: "Arcana (to safely bleed off the energy of the seal) or Investigation (to find and disrupt the focal point of the etchings)",
    disarmTool: "Arcane focus",
    saveDC: 14,
    saveType: "Dex",
    damageFormula: "(PC level + 1) d6",
    minDamage: "—",
    consequences: "The bolt can ricochet and hit flammable objects or trigger nearby runes."
  },
  {
    name: "Poison Gas / Acid Spray",
    clue: "Acrid smell or corrosive stains on walls and ceiling; hidden valves.",
    trigger_mechanism: "Opening a sealed door or stepping on a plate that releases gas or spray.",
    perceptionDC: 17,
    disarmDC: 18,
    disarmSkill: "Sleight of Hand (to delicately jam the valve mechanism) or Athletics (to use a crowbar and physically crush the release nozzle shut)",
    disarmTool: "Thieves' Tools / Crowbar",
    saveDC: 15,
    saveType: "Con",
    damageFormula: "(PC level + 1) d6",
    minDamage: "—",
    consequences: "Gas or acid lingers for several rounds, causing ongoing damage and breathing or equipment penalties."
  },
  {
    name: "Flooding Chamber",
    clue: "Drain channels and high water stains on the walls; a door with worn seals.",
    trigger_mechanism: "Opening a door that releases water from a cistern or breaking an internal dam.",
    perceptionDC: 17,
    disarmDC: 18,
    disarmSkill: "Sleight of Hand (to lock the valve's gears in place) or Athletics (to wedge a crowbar and physically brace the water gate shut)",
    disarmTool: "Crowbar / Thieves' Tools",
    saveDC: 15,
    saveType: "Str",
    damageFormula: "(PC level + 2) d6",
    minDamage: "—",
    consequences: "The room fills quickly; risk of drowning, displaced items, and submerged passages."
  },
  {
    name: "Closing Walls",
    clue: "Sliding marks on the walls and grooves in the floor for metal guides.",
    trigger_mechanism: "Stepping on a plate or activating a hidden switch.",
    perceptionDC: 18,
    disarmDC: 19,
    disarmSkill: "Sleight of Hand (to bypass the hidden switch gears) or Athletics (to hammer heavy iron spikes into the floor grooves to jam the wall guides)",
    disarmTool: "Thieves' Tools / Iron spikes & Hammer",
    saveDC: 16,
    saveType: "Str",
    damageFormula: "(PC level + 2) d6",
    minDamage: "—",
    consequences: "Walls compress the area, crushing and trapping; reopening requires strength or time."
  },
  {
    name: "Floor Spears",
    clue: "Small gaps in the floor with metal tips barely visible when the floor shifts.",
    trigger_mechanism: "Pressure on specific tiles that cause spears to rise from the floor.",
    perceptionDC: 19,
    disarmDC: 20,
    disarmSkill: "Sleight of Hand (to manipulate and lock the under-tile pressure pins) or Athletics (to hammer iron spikes into the gaps and jam the spear tips underground)",
    disarmTool: "Thieves' Tools / Iron spikes & Hammer",
    saveDC: 17,
    saveType: "Dex",
    damageFormula: "(PC level + 2) d6",
    minDamage: "—",
    consequences: "Spears can pierce armor and create permanent obstacles in the floor; removal requires tools."
  },
  {
    name: "Falling Spiked Grate",
    clue: "Suspension rings and rusted chains above a hatch; abrasion marks on the edges.",
    trigger_mechanism: "Cutting a support rope or stepping on a plate that releases the grate.",
    perceptionDC: 19,
    disarmDC: 20,
    disarmSkill: "Sleight of Hand (to jam the mechanical release latch) or Survival (to securely tie off and anchor the support rope to a nearby wall fixtur",
    disarmTool: "Rope / Thieves' Tools",
    saveDC: 17,
    saveType: "Dex",
    damageFormula: "(PC level × 1.5) d6",
    minDamage: "—",
    consequences: "The grate can trap multiple targets beneath it; lifting it requires time and strength."
  },
  {
    name: "Trapdoor Drop (snakes/acid below)",
    clue: "Smell of rot or corrosive residue rising from a crack; hidden hinges.",
    trigger_mechanism: "Stepping on a slab that opens a trapdoor revealing the hazard below.",
    perceptionDC: 20,
    disarmDC: 21,
    disarmSkill: "Sleight of Hand (to jam the hidden hinges using tools) or Athletics (to hammer heavy iron spikes into the seams and secure the floor slab)",
    disarmTool: "Thieves' Tools / Iron spikes & Hammer / Crowbar",
    saveDC: 18,
    saveType: "Dex",
    damageFormula: "(PC level × 2) d6",
    minDamage: "—",
    consequences: "Fallen characters land in a hostile environment (snakes, acid); recovery is risky and may contaminate gear."
  },
  {
    name: "Arcane Pulse Rune",
    clue: "A pulsing rune with a faint glow and an ozone tang in the air.",
    trigger_mechanism: "Passing near the rune or attempting to remove it without magical precautions.",
    perceptionDC: 17,
    disarmDC: 18,
    disarmSkill: "Arcana (to bleed off and safely ground the rune's energy using a focus)",
    disarmTool: "Arcane focus",
    saveDC: 15,
    saveType: "Wis",
    damageFormula: "(PC level + 1) d6",
    minDamage: "—",
    consequences: "The pulse can disrupt active spells and cause temporary confusion or magical distortion in the area."
  },
  {
    name: "Explosive Sigil",
    clue: "Powder residue and a dark scorch ring around an inscribed sigil on the floor.",
    trigger_mechanism: "Contact with the sigil or heavy vibration nearby.",
    perceptionDC: 18,
    disarmDC: 19,
    disarmSkill: "Arcana (to safely unbind and disperse the unstable volatile magic) or Sleight of Hand (to silently coat the sigil with alchemical components to dissolve the inscription without causing vibrations)",
    disarmTool: "Arcane focus / Alchemical components",
    saveDC: 16,
    saveType: "Dex",
    damageFormula: "(PC level + 2) d6",
    minDamage: "—",
    consequences: "Explosion damages the environment and can ignite fires or trigger secondary collapses."
  },
  {
    name: "Swinging Log Trap",
    clue: "Abrasion marks on a beam and frayed ropes hidden among ceiling timbers.",
    trigger_mechanism: "Opening a door or stepping on a plate that releases the swinging log.",
    perceptionDC: 14,
    disarmDC: 15,
    disarmSkill: "Sleight of Hand (to jam the pressure plate mechanism) or Survival (to securely tie off and anchor the swinging log to the ceiling beams with an extra rope)",
    disarmTool: "Thieves' Tools / Extra Rope",
    saveDC: 13,
    saveType: "Dex",
    damageFormula: "(PC level) d6",
    minDamage: "—",
    consequences: "The log can knock targets prone or stun them and damage nearby structures."
  },
  {
    name: "Needle Floor",
    clue: "Tiny gaps between boards and oil stains indicating an underlying mechanism.",
    trigger_mechanism: "Stepping on specific tiles that cause needles to spring from the floor.",
    perceptionDC: 14,
    disarmDC: 15,
    disarmSkill: "Sleight of Hand (to lock the under-board spring pins) or Athletics (to hammer flat metal wedges into the gaps to block the needle exit paths)",
    disarmTool: "hieves' Tools / Flat wedges & Hammer",
    saveDC: 12,
    saveType: "Dex",
    damageFormula: "(PC level - 1) d6",
    minDamage: "min 1d6",
    consequences: "Needles can poison or inflict thin wounds; removing them requires care to avoid triggering adjacent plates."
  }
];



