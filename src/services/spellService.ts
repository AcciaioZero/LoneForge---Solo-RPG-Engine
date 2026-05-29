import spellsJson from '../data/Spells.json';
import { Spell } from '../types';

export const loadSpells = (): Spell[] => {
  return (spellsJson as any[]).map((row: any) => ({
    name: row['Name'] || '',
    source: row['Source'] || '',
    page: String(row['Page'] || ''),
    level: row['Level'] || '',
    castingTime: row['Casting Time'] || '',
    duration: row['Duration'] || '',
    school: row['School'] || '',
    range: row['Range'] || '',
    components: row['Components'] || '',
    classes: row['Classes'] || '',
    optionalClasses: row['Optional/Variant Classes'] || '',
    subclasses: row['Subclasses'] || '',
    text: row['Text'] || '',
    atHigherLevels: row['At Higher Levels'] || '',
  }));
};
