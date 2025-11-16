import { create } from 'zustand';

// Types for our skill tree data structure
export interface SubSkill {
  id: string;
  name: string;
  x: number;
  y: number;
  notes?: string;
  links?: string[];
  images?: string[]; // base64 or object URLs
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

export interface SkillTree {
  skillId: string;
  subSkills: SubSkill[];
  connections: Connection[];
}

export interface Skill {
  id: string;
  name: string;
  icon?: string;
}

interface SkillsState {
  // Current user (mock)
  username: string;
  
  // Skills list
  skills: Skill[];
  
  // Skill trees data
  skillTrees: Record<string, SkillTree>;
  
  // Actions for skills
  addSkill: (name: string, icon?: string) => void;
  editSkill: (id: string, name: string, icon?: string) => void;
  deleteSkill: (id: string) => void;
  
  // Actions for skill trees
  addSubSkill: (skillId: string, subSkill: SubSkill) => void;
  editSubSkill: (skillId: string, subSkillId: string, updates: Partial<SubSkill>) => void;
  deleteSubSkill: (skillId: string, subSkillId: string) => void;
  moveSubSkill: (skillId: string, subSkillId: string, x: number, y: number) => void;
  
  // Actions for connections
  addConnection: (skillId: string, fromId: string, toId: string) => void;
  deleteConnection: (skillId: string, connectionId: string) => void;
  
  // Helper to get disconnected sub-skills
  getDisconnectedSubSkills: (skillId: string) => string[];
}

export const useSkillsStore = create<SkillsState>((set, get) => ({
  username: 'Demo User',
  skills: [],
  skillTrees: {},
  
  addSkill: (name: string, icon?: string) => {
    const id = `skill_${Date.now()}`;
    set((state) => ({
      skills: [...state.skills, { id, name, icon }],
      skillTrees: {
        ...state.skillTrees,
        [id]: {
          skillId: id,
          subSkills: [],
          connections: [],
        },
      },
    }));
  },
  
  editSkill: (id: string, name: string, icon?: string) => {
    set((state) => ({
      skills: state.skills.map((skill) =>
        skill.id === id ? { ...skill, name, icon } : skill
      ),
    }));
  },
  
  deleteSkill: (id: string) => {
    set((state) => {
      const { [id]: removed, ...remainingTrees } = state.skillTrees;
      return {
        skills: state.skills.filter((skill) => skill.id !== id),
        skillTrees: remainingTrees,
      };
    });
  },
  
  addSubSkill: (skillId: string, subSkill: SubSkill) => {
    set((state) => {
      const tree = state.skillTrees[skillId];
      if (!tree) return state;
      
      return {
        skillTrees: {
          ...state.skillTrees,
          [skillId]: {
            ...tree,
            subSkills: [...tree.subSkills, subSkill],
          },
        },
      };
    });
  },
  
  editSubSkill: (skillId: string, subSkillId: string, updates: Partial<SubSkill>) => {
    set((state) => {
      const tree = state.skillTrees[skillId];
      if (!tree) return state;
      
      return {
        skillTrees: {
          ...state.skillTrees,
          [skillId]: {
            ...tree,
            subSkills: tree.subSkills.map((ss) =>
              ss.id === subSkillId ? { ...ss, ...updates } : ss
            ),
          },
        },
      };
    });
  },
  
  deleteSubSkill: (skillId: string, subSkillId: string) => {
    set((state) => {
      const tree = state.skillTrees[skillId];
      if (!tree) return state;
      
      // Remove the sub-skill and all connections involving it
      return {
        skillTrees: {
          ...state.skillTrees,
          [skillId]: {
            ...tree,
            subSkills: tree.subSkills.filter((ss) => ss.id !== subSkillId),
            connections: tree.connections.filter(
              (conn) => conn.fromId !== subSkillId && conn.toId !== subSkillId
            ),
          },
        },
      };
    });
  },
  
  moveSubSkill: (skillId: string, subSkillId: string, x: number, y: number) => {
    set((state) => {
      const tree = state.skillTrees[skillId];
      if (!tree) return state;
      
      return {
        skillTrees: {
          ...state.skillTrees,
          [skillId]: {
            ...tree,
            subSkills: tree.subSkills.map((ss) =>
              ss.id === subSkillId ? { ...ss, x, y } : ss
            ),
          },
        },
      };
    });
  },
  
  addConnection: (skillId: string, fromId: string, toId: string) => {
    set((state) => {
      const tree = state.skillTrees[skillId];
      if (!tree) return state;
      
      const id = `conn_${Date.now()}`;
      return {
        skillTrees: {
          ...state.skillTrees,
          [skillId]: {
            ...tree,
            connections: [...tree.connections, { id, fromId, toId }],
          },
        },
      };
    });
  },
  
  deleteConnection: (skillId: string, connectionId: string) => {
    set((state) => {
      const tree = state.skillTrees[skillId];
      if (!tree) return state;
      
      return {
        skillTrees: {
          ...state.skillTrees,
          [skillId]: {
            ...tree,
            connections: tree.connections.filter((conn) => conn.id !== connectionId),
          },
        },
      };
    });
  },
  
  getDisconnectedSubSkills: (skillId: string) => {
    const state = get();
    const tree = state.skillTrees[skillId];
    if (!tree) return [];
    
    const connectedIds = new Set<string>();
    tree.connections.forEach((conn) => {
      connectedIds.add(conn.fromId);
      connectedIds.add(conn.toId);
    });
    
    return tree.subSkills
      .filter((ss) => !connectedIds.has(ss.id))
      .map((ss) => ss.id);
  },
}));

