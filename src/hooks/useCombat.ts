import React, { useCallback, useEffect } from 'react';
import { GameState, Enemy, Ability, LogEntry } from '../types';
import { rollDice, getModifier, calculateAc, parseDamage, getProficiencyBonus } from '../services/gameEngine';
import ITEMS_DATA from '../data/items.json';

interface UseCombatProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  addLog: (type: LogEntry['type'], text: string) => void;
}

export const useCombat = ({ gameState, setGameState, addLog }: UseCombatProps) => {
  const handleAttack = useCallback((targetId?: string) => {
    const activeCombatant = gameState.initiativeOrder[gameState.activeCombatantIndex];
    if (!activeCombatant) return;

    let attackerName = '';
    let attackBonus = 0;
    let damage = '1d6';

    if (activeCombatant.type === 'player') {
      attackerName = gameState.character.name;
      const equippedWeapon = gameState.character.inventory.find(i => i.isEquipped && i.type === 'Weapon');
      const weaponData = ((ITEMS_DATA as any) as any[]).find(i => i.Name === equippedWeapon?.name);
      
      attackBonus = getProficiencyBonus(gameState.character.level) + getModifier(gameState.character.stats.Strength);
      damage = weaponData?.Damage || '1d4';
    } else {
      const enemy = activeCombatant.ref as Enemy;
      attackerName = enemy.name;
      attackBonus = enemy.attackBonus;
      damage = enemy.damage || '1d6';
    }

    const roll = rollDice(20);
    const total = roll + attackBonus;
    const dmg = parseDamage(damage);

    addLog('combat', `${attackerName} attacks: Roll ${roll} + ${attackBonus} = ${total}.`);
    
    setGameState(prev => ({ ...prev, hasUsedAction: true }));
    
    return { roll, total, damage: dmg };
  }, [gameState, addLog, setGameState]);

  const handleUseAbility = useCallback((ability: Ability, targetId?: string) => {
    if (ability.type === 'action' && gameState.hasUsedAction) return;
    if (ability.type === 'bonus_action' && gameState.hasUsedBonusAction) return;

    if (ability.usesPerLongRest && (ability.currentUses || 0) <= 0) {
      addLog('narrative', `${ability.name} has no uses left!`);
      return;
    }

    const activeCombatant = gameState.initiativeOrder[gameState.activeCombatantIndex];
    if (!activeCombatant) return;

    addLog('narrative', `Used ability: ${ability.name}. ${ability.description}`);

    // Handle Attack Roll
    if (ability.attackBonus !== undefined) {
      const roll = rollDice(20);
      const total = roll + ability.attackBonus;
      const dmg = ability.damage ? parseDamage(ability.damage) : 0;
      addLog('combat', `${activeCombatant.name} uses ${ability.name}: Roll ${roll} + ${ability.attackBonus} = ${total}. Potential damage: ${dmg}.`);
    } else if (ability.damage) {
      const dmg = parseDamage(ability.damage);
      addLog('combat', `${ability.name} deals ${dmg} potential damage.`);
    }

    // Handle Healing
    if (ability.healing) {
      const heal = parseDamage(ability.healing);
      addLog('combat', `${ability.name} provides ${heal} potential healing.`);
    }
    
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        abilities: prev.character.abilities?.map(a => 
          a.id === ability.id ? { ...a, currentUses: (a.currentUses || 0) - 1 } : a
        )
      },
      hasUsedAction: ability.type === 'action' ? true : prev.hasUsedAction,
      hasUsedBonusAction: ability.type === 'bonus_action' ? true : prev.hasUsedBonusAction
    }));
  }, [gameState, addLog, setGameState]);

  const handleUpdateCombatantHp = useCallback((id: string, amount: number) => {
    setGameState(prev => {
      const isPlayer = id === 'player';
      
      if (isPlayer) {
        const newHp = Math.max(0, Math.min(prev.character.maxHp, prev.character.hp + amount));
        return {
          ...prev,
          character: { ...prev.character, hp: newHp },
          initiativeOrder: prev.initiativeOrder.map(i => 
            i.id === 'player' ? { ...i, currentHp: newHp } : i
          )
        };
      } else {
        return {
          ...prev,
          currentRoom: prev.currentRoom ? {
            ...prev.currentRoom,
            enemies: prev.currentRoom.enemies?.map(e => 
              e.id === id ? { ...e, hp: Math.max(0, Math.min(e.maxHp, e.hp + amount)) } : e
            )
          } : null,
          initiativeOrder: prev.initiativeOrder.map(i => 
            i.id === id ? { ...i, currentHp: Math.max(0, Math.min(i.maxHp || 0, (i.currentHp || 0) + amount)) } : i
          )
        };
      }
    });
  }, [setGameState]);

  const startCombat = useCallback((enemies: Enemy[]) => {
    const initiative = [
      { 
        id: 'player',
        type: 'player', 
        name: gameState.character.name, 
        initiative: rollDice(20) + getModifier(gameState.character.stats.Dexterity),
        currentHp: gameState.character.hp,
        maxHp: gameState.character.maxHp,
        ac: calculateAc(gameState.character),
        ref: null
      },
      ...enemies.map(e => ({ 
        id: e.id,
        type: 'enemy', 
        name: e.name, 
        initiative: rollDice(20) + getModifier(e.stats?.Dexterity || 10), 
        ref: e,
        currentHp: e.hp,
        maxHp: e.maxHp,
        ac: e.ac
      }))
    ].sort((a, b) => b.initiative - a.initiative);

    setGameState(prev => ({
      ...prev,
      context: 'Combat',
      isCombatActive: true,
      combatTurn: 1,
      initiativeOrder: initiative,
      activeCombatantIndex: 0,
      hasUsedAction: false,
      hasUsedBonusAction: false,
      currentRoom: prev.currentRoom ? { ...prev.currentRoom, enemies } : {
        id: 'combat-' + Math.random().toString(36).substr(2, 9),
        type: 'Combat',
        feature: 'Battlefield',
        enemies: enemies,
        rolls: { gold: 0, blue: 0, red: 0, green: 0, multicolour: 0, white: 0 }
      }
    }));
    addLog('combat', "Combat started! Initiative: " + initiative.map(i => `${i.name} (${i.initiative})`).join(', '));
  }, [gameState.character, addLog, setGameState]);

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      const nextIndex = (prev.activeCombatantIndex + 1) % prev.initiativeOrder.length;
      return {
        ...prev,
        activeCombatantIndex: nextIndex,
        hasUsedAction: false,
        hasUsedBonusAction: false,
        combatTurn: nextIndex === 0 ? prev.combatTurn + 1 : prev.combatTurn
      };
    });
  }, [setGameState]);

  const handleAddEnemyToCombat = useCallback((enemy: Enemy) => {
    const newEnemy = { ...enemy, id: Math.random().toString(36).substr(2, 9) };
    setGameState(prev => ({
      ...prev,
      currentRoom: prev.currentRoom ? {
        ...prev.currentRoom,
        enemies: [...(prev.currentRoom.enemies || []), newEnemy]
      } : {
        id: 'custom',
        type: 'Custom',
        description: 'Custom Combat',
        enemies: [newEnemy]
      }
    }));
    
    if (gameState.context === 'Combat') {
      const init = rollDice(20) + getModifier(enemy.stats?.Dexterity || 10);
      setGameState(prev => ({
        ...prev,
        initiativeOrder: [...prev.initiativeOrder, { 
          id: newEnemy.id,
          type: 'enemy', 
          name: enemy.name, 
          initiative: init, 
          ref: newEnemy,
          currentHp: newEnemy.hp,
          maxHp: newEnemy.maxHp,
          ac: newEnemy.ac
        }].sort((a, b) => b.initiative - a.initiative)
      }));
    }
  }, [gameState.context, setGameState]);

  const handleRemoveEnemyFromCombat = useCallback((id: string) => {
    setGameState(prev => ({
      ...prev,
      currentRoom: prev.currentRoom ? {
        ...prev.currentRoom,
        enemies: prev.currentRoom.enemies?.filter(e => e.id !== id)
      } : null,
      initiativeOrder: prev.initiativeOrder.filter(i => i.id !== id)
    }));
  }, [setGameState]);

  const handleClearEnemiesFromCombat = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentRoom: prev.currentRoom ? { ...prev.currentRoom, enemies: [] } : null,
      initiativeOrder: prev.initiativeOrder.filter(i => i.type === 'player'),
      context: 'Narrative',
      isCombatActive: false
    }));
  }, [setGameState]);

  return {
    handleAttack,
    handleUseAbility,
    handleUpdateCombatantHp,
    startCombat,
    nextTurn,
    handleAddEnemyToCombat,
    handleRemoveEnemyFromCombat,
    handleClearEnemiesFromCombat
  };
};
