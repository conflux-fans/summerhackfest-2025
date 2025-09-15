/*
 * Copyright 2025 ChainBrawler Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Character utilities for ChainBrawler

export interface CharacterClass {
  id: number;
  name: string;
  description: string;
}

export const CHARACTER_CLASSES: CharacterClass[] = [
  {
    id: 0,
    name: "Warrior",
    description: "A fierce melee combatant with high attack power and decent defense",
  },
  {
    id: 1,
    name: "Guardian",
    description: "A defensive specialist with exceptional armor and protective abilities",
  },
  {
    id: 2,
    name: "Rogue",
    description: "A swift and cunning fighter who relies on luck and critical strikes",
  },
  { id: 3, name: "Mage", description: "A mystical spellcaster with balanced magical abilities" },
];

export function getCharacterClass(classId: number): CharacterClass | undefined {
  return CHARACTER_CLASSES.find((c) => c.id === classId);
}

export function getCharacterClassName(classId: number): string {
  const characterClass = getCharacterClass(classId);
  return characterClass?.name || `Class ${classId}`;
}
