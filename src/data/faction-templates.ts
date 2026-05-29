export const FACTION_DESCRIPTION_TEMPLATES = [
  "{name} has operated in this region for longer than most people can verify. They describe themselves as {article} {type}. Those who have dealt with them closely use a different description, and they use it quietly.",
  
  "Most people who know the name {name} could not tell you much about them. This is not an accident. {article_cap} {type} that does not want to be understood has a significant advantage over one that does.",
  
  "{name} is {article} {type} with {influence} reach and a reputation that varies significantly depending on who you ask. The version they tell about themselves is consistent, polished, and probably incomplete.",
  
  "The official account of {name} describes {article} {type} focused on {goal_short}. The official account was written by {name}.",
  
  "{name} has been called many things. {article_cap} {type} is what they call themselves. Whether the label fits depends on what you think the label means.",
  
  "There are {influence} operations that no one talks about openly. {name} is one of them. Technically {article} {type}, practically something harder to classify."
];

export const FACTION_HOOK_TEMPLATES = [
  "Someone recently asked questions about {name} in the wrong place. They have not been seen since. This may be coincidence.",
  
  "The motto of {name} is '{motto}'. Three former members, independently, have described it as a warning rather than a statement of intent.",
  
  "{name} is looking for something. They have not said what. The search has been ongoing for {duration}, which suggests either that it is well hidden, or that finding it is not actually the point.",
  
  "A position within {name} has been vacant for some time. No one has been appointed. No one will say whether this is temporary, deliberate, or a sign of something else.",
  
  "{name} and one other faction have a history. The nature of that history depends on which side is telling it. Both versions agree on the outcome. Neither agrees on who is responsible for it.",
  
  "Someone inside {name} has been passing information outward. The recipient is not known. Neither is whether {name} is aware of it."
];

export const FACTION_SECRET_TEMPLATES: Record<string, string> = {
  "Led by a Doppelganger": 
    "The person known as {leader} is not who they appear to be. The original has not been seen in some time. No one inside {name} has raised the question of why.",
  
  "Funded by a Demon": 
    "The resources that sustain {name} come from a source that no financial record accounts for. The source has a name. The name is not in any document {name} will acknowledge.",
  
  "Infiltrated by Spies": 
    "At least one person inside {name} reports to someone else. Possibly more than one. The loyalty of the inner circle has not been verified in a long time, and the person who would normally verify it is one of the suspects.",
  
  "Possesses a Forbidden Artifact": 
    "There is something in {name}'s possession that should not exist, or should not be in their hands. They have had it for long enough that it has changed them — the organization, not just the individuals. The change has been gradual and is not yet complete.",
  
  "Planning a Coup": 
    "{name} intends to remove someone from power. The plan is further along than anyone outside suspects. The date has been set. The only variable still unresolved is what happens to the people who are not part of the plan but will be affected by it.",
  
  "Actually a Front for a Cult": 
    "The {type} is real. The operations are real. The purpose behind them is not what any member below a certain level understands it to be. The inner doctrine would not be recognized by most of the people who serve it.",
  
  "The Leader is Dead (Puppet)": 
    "{leader} makes decisions, gives orders, and appears at the required moments. The people giving instructions to {leader} are not visible. The arrangement has been in place long enough that it functions smoothly, which is the most unsettling thing about it.",
  
  "Secretly Allied with a Rival": 
    "The conflict between {name} and their most visible rival is not what it appears. Both sides know this. The performance is maintained because it serves purposes that the alliance itself does not serve. What those purposes are is known to very few people on either side.",
  
  "Responsible for a Past Disaster": 
    "Something happened. {name} was involved in a way that has never been formally established. The evidence is incomplete, some of it deliberately so. The people most affected have not stopped looking for the rest of it.",
  
  "Experimenting on Innocent People": 
    "{name} requires something that cannot be obtained through legitimate means. The solution they have arrived at is not one they discuss openly, even internally. The subjects are selected carefully. The selection criteria say more about {name} than anything else about them does."
};

export const FACTION_GOAL_NARRATIVE: Record<string, string> = {
  "Accumulate Wealth": "the accumulation of resources beyond any operational need",
  "Gain Political Power": "a position of influence they do not currently hold",
  "Protect the Innocent": "the protection of people who cannot protect themselves — as they define both protection and innocence",
  "Uncover Ancient Secrets": "knowledge that was buried deliberately, by people who had reasons",
  "Spread a Religion": "the expansion of a faith that not everyone has been given the opportunity to refuse",
  "Maintain Order": "the preservation of a specific order — not order in the abstract, but this order, as it currently exists",
  "Overthrow the Government": "the removal of the current structure and everyone who benefits from it",
  "Destroy a Rival Faction": "the elimination of one specific enemy, thoroughly enough that the question does not reopen",
  "Achieve Immortality": "something that has not been achieved before, for reasons that may be instructive",
  "Control a Specific Resource": "exclusive control over something that others currently share or contest",
  "Promote a Social Cause": "a change that a significant number of people would resist if asked directly",
  "Survive at All Costs": "survival — the costs have not yet been fully calculated"
};