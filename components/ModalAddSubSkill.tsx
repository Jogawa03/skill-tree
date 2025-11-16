import { Colors } from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ModalAddSubSkillProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    notes?: string;
    links?: string[];
    images?: string[];
  }) => void;
}

export function ModalAddSubSkill({ visible, onClose, onSave }: ModalAddSubSkillProps) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setLinks([...links, linkInput.trim()]);
      setLinkInput('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        notes: notes.trim() || undefined,
        links: links.length > 0 ? links : undefined,
        images: images.length > 0 ? images : undefined,
      });
      resetForm();
      onClose();
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setNotes('');
    setLinkInput('');
    setLinks([]);
    setImages([]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleCancel} />
          
          <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Add Sub-Skill</Text>
            
            {/* Name Input */}
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Sub-skill name"
              placeholderTextColor={Colors.secondary}
              value={name}
              onChangeText={setName}
            />
            
            {/* Notes Input */}
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add notes..."
              placeholderTextColor={Colors.secondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
            
            {/* Links Section */}
            <Text style={styles.label}>Links</Text>
            <View style={styles.linkInputContainer}>
              <TextInput
                style={[styles.input, styles.linkInput]}
                placeholder="https://..."
                placeholderTextColor={Colors.secondary}
                value={linkInput}
                onChangeText={setLinkInput}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddLink}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {links.map((link, index) => (
              <View key={index} style={styles.linkItem}>
                <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
                <TouchableOpacity onPress={() => handleRemoveLink(index)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Images Section */}
            <Text style={styles.label}>Images</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage}>
              <Text style={styles.imagePickerText}>+ Add Image</Text>
            </TouchableOpacity>
            
            <View style={styles.imageList}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageItem}>
                  <Text style={styles.imageText} numberOfLines={1}>Image {index + 1}</Text>
                  <TouchableOpacity onPress={() => handleRemoveImage(index)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton, !name.trim() && styles.disabledButton]}
                onPress={handleSave}
                disabled={!name.trim()}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    minWidth: 500,
    maxWidth: 600,
    maxHeight: '80%',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
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
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  linkInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  linkInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  removeText: {
    fontSize: 18,
    color: Colors.error,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  imagePickerButton: {
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  imageList: {
    marginTop: 8,
  },
  imageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  imageText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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

