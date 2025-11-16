import { FloatingAddButton } from '@/components/FloatingAddButton';
import { ModalAddSkill } from '@/components/ModalAddSkill';
import { ModalEditSkill } from '@/components/ModalEditSkill';
import { SkillCard } from '@/components/SkillCard';
import { TopBar } from '@/components/TopBar';
import { Colors } from '@/constants/colors';
import { Skill, useSkillsStore } from '@/store/useSkillsStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const skills = useSkillsStore((state) => state.skills);
  const addSkill = useSkillsStore((state) => state.addSkill);
  const editSkill = useSkillsStore((state) => state.editSkill);
  const deleteSkill = useSkillsStore((state) => state.deleteSkill);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleAddSkill = (name: string) => {
    addSkill(name);
  };

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (id: string, name: string) => {
    editSkill(id, name);
    setEditModalVisible(false);
    setSelectedSkill(null);
  };

  const handleDeleteSkill = (id: string) => {
    deleteSkill(id);
  };

  const handleSkillPress = (skillId: string) => {
    router.push(`/skill-tree?skillId=${skillId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopBar />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {skills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No skills yet.</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first skill!</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onPress={() => handleSkillPress(skill.id)}
                onEdit={() => handleEditSkill(skill)}
                onDelete={() => handleDeleteSkill(skill.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <FloatingAddButton onPress={() => setAddModalVisible(true)} />

      <ModalAddSkill
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddSkill}
      />

      <ModalEditSkill
        visible={editModalVisible}
        skill={selectedSkill}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedSkill(null);
        }}
        onSave={handleSaveEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
  },
});

