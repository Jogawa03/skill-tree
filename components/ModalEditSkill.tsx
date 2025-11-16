import { Colors } from '@/constants/colors';
import { Skill } from '@/store/useSkillsStore';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ModalEditSkillProps {
  visible: boolean;
  skill: Skill | null;
  onClose: () => void;
  onSave: (id: string, name: string) => void;
}

export function ModalEditSkill({ visible, skill, onClose, onSave }: ModalEditSkillProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (skill) {
      setName(skill.name);
    }
  }, [skill]);

  const handleSave = () => {
    if (name.trim() && skill) {
      onSave(skill.id, name.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    if (skill) {
      setName(skill.name);
    }
    onClose();
  };

  if (!skill) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleCancel} />
          
          <View style={styles.container}>
          <Text style={styles.title}>Edit Skill</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Skill Name *"
            placeholderTextColor={Colors.secondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, !name.trim() && styles.disabledButton]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    minWidth: 400,
    maxWidth: 500,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.secondary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.accent,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

