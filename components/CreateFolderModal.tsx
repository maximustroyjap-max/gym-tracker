/**
 * CREATE FOLDER MODAL
 * Centered popup card for creating a new template folder.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';
import { TemplateFolder } from '@/types/user';

interface CreateFolderModalProps {
  onClose: () => void;
  onSave: (folder: TemplateFolder) => void;
}

export function CreateFolderModal({ onClose, onSave }: CreateFolderModalProps) {
  const Colors = useTheme();
  const [name, setName] = useState('');

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;

    const newFolder: TemplateFolder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      templateIds: [],
    };

    onSave(newFolder);
    onClose();
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
      {/* Backdrop */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { backgroundColor: Colors.background + 'AA' }]}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Card */}
      <View style={styles.centeredContainer}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <Text style={[styles.title, { color: Colors.text }]}>New Folder</Text>

          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: Colors.background, color: Colors.text, borderColor: Colors.border },
            ]}
            placeholder="Folder name"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: Colors.background, borderColor: Colors.border }]}
              onPress={onClose}
              activeOpacity={activeOpacity.button}>
              <Text style={[styles.cancelButtonText, { color: Colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                !canSave && [styles.saveButtonDisabled, { backgroundColor: Colors.background, borderColor: Colors.border }],
                canSave && { backgroundColor: Colors.primary },
              ]}
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={activeOpacity.button}>
              <Text
                style={[
                  styles.saveButtonText,
                  !canSave && [styles.saveButtonTextDisabled, { color: Colors.textSecondary }],
                  canSave && { color: Colors.background },
                ]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  textInput: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.base,
    borderWidth: 1,
    marginBottom: spacing.lg,
    minHeight: touch.minHeight,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonDisabled: {
    borderWidth: 1,
  },
  saveButtonText: {
    fontSize: typography.base,
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
  },
});
