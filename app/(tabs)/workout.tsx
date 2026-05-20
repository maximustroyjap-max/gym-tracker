/**
 * WORKOUT SCREEN
 *
 * Layout:
 * 1. "Start Workout" title
 * 2. "Quick Start" section + "Start an Empty Workout" button
 * 3. "Templates" header with +Template, Folder, and 3-dot buttons
 * 4. "Folders" row — user-created folders (horizontal scroll)
 * 5. Expanded folder contents (when tapped)
 * 6. "My Templates" grid — unfiled user-created templates (lift + tap to folder)
 * 7. "Example Templates" grid — pre-made templates
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_TOTAL_HEIGHT } from '@/components/CurvedTabBar';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { useWorkout } from '@/context/WorkoutContext';
import { EXAMPLE_TEMPLATES } from '@/constants/templates';
import { WorkoutTemplate, TemplateFolder } from '@/types/user';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';
import { TemplateBuilder } from '@/components/TemplateBuilder';
import { CreateFolderModal } from '@/components/CreateFolderModal';
import { TemplateMenu } from '@/components/TemplateMenu';
import { ContextMenu } from '@/components/ContextMenu';
import { TemplatePreviewPopup } from '@/components/TemplatePreviewPopup';

export default function WorkoutScreen() {
  const Colors = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useUser();
  const { startWorkout, startWorkoutFromTemplate } = useWorkout();
  const myTemplates = user.myTemplates;
  const templateFolders = user.templateFolders;

  // ─── Modal / Overlay States ───
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // ─── Context Menu States ───
  const [activeTemplateMenu, setActiveTemplateMenu] = useState<string | null>(null);
  const [activeFolderMenu, setActiveFolderMenu] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ top: 0, left: 0 });

  // ─── Template Preview Popup ───
  const [activeTemplatePreview, setActiveTemplatePreview] = useState<WorkoutTemplate | null>(null);

  // ─── Drag-and-Drop (Lift & Tap) ───
  const [liftedTemplate, setLiftedTemplate] = useState<WorkoutTemplate | null>(null);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const folderRefs = useRef<Map<string, View>>(new Map());
  const templateRefs = useRef<Map<string, View>>(new Map());
  const menuButtonRef = useRef<View>(null);
  const liftScale = useRef(new Animated.Value(1)).current;

  // Animate lift scale
  useEffect(() => {
    if (liftedTemplate) {
      Animated.spring(liftScale, {
        toValue: 1.05,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(liftScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [liftedTemplate]);

  // ─── Derived Data ───
  const unfiledTemplates = myTemplates.filter((t) =>
    !templateFolders.some((f) => f.templateIds.includes(t.id))
  );

  const getTemplatesInFolder = (folderId: string) => {
    const folder = templateFolders.find((f) => f.id === folderId);
    if (!folder) return [];
    return myTemplates.filter((t) => folder.templateIds.includes(t.id));
  };

  // ─── Handlers ───
  const handleSaveTemplate = (template: WorkoutTemplate) => {
    updateUser({ myTemplates: [...myTemplates, template] });
  };

  const handleSaveFolder = (folder: TemplateFolder) => {
    updateUser({ templateFolders: [...templateFolders, folder] });
  };

  const handleMoveToFolder = (templateId: string, folderId: string) => {
    const updatedFolders = templateFolders.map((folder) => {
      const withoutTemplate = {
        ...folder,
        templateIds: folder.templateIds.filter((id) => id !== templateId),
      };
      if (folder.id === folderId) {
        return {
          ...withoutTemplate,
          templateIds: [...withoutTemplate.templateIds, templateId],
        };
      }
      return withoutTemplate;
    });
    updateUser({ templateFolders: updatedFolders });
    setLiftedTemplate(null);
  };

  const handleLiftTemplate = (template: WorkoutTemplate) => {
    setLiftedTemplate(template);
  };

  const handleCancelLift = () => {
    setLiftedTemplate(null);
  };

  const handleFolderPress = (folderId: string) => {
    if (liftedTemplate) {
      handleMoveToFolder(liftedTemplate.id, folderId);
    } else {
      setExpandedFolderId((prev) => (prev === folderId ? null : folderId));
    }
  };

  const handleMenuPress = () => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({ top: y + height + 8, right: 16 });
      setShowTemplateMenu(true);
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    Alert.alert(
      'Delete Template?',
      'This template will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTemplates = myTemplates.filter((t) => t.id !== templateId);
            const updatedFolders = templateFolders.map((folder) => ({
              ...folder,
              templateIds: folder.templateIds.filter((id) => id !== templateId),
            }));
            updateUser({ myTemplates: updatedTemplates, templateFolders: updatedFolders });
            if (expandedFolderId && getTemplatesInFolder(expandedFolderId).length === 0) {
              setExpandedFolderId(null);
            }
          },
        },
      ]
    );
  };

  const handleDeleteFolder = (folderId: string) => {
    Alert.alert(
      'Delete Folder?',
      'Templates inside this folder will become unfiled. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedFolders = templateFolders.filter((f) => f.id !== folderId);
            updateUser({ templateFolders: updatedFolders });
            if (expandedFolderId === folderId) {
              setExpandedFolderId(null);
            }
          },
        },
      ]
    );
  };

  const handleTemplateMenuPress = (templateId: string) => {
    const ref = templateRefs.current.get(templateId);
    ref?.measureInWindow((x, y, width, height) => {
      const menuWidth = 160;
      const screenWidth = Dimensions.get('window').width;
      const left = Math.min(Math.max(8, x + width - menuWidth), screenWidth - menuWidth - 8);
      setContextMenuPosition({ top: y + 8, left });
      setActiveTemplateMenu(templateId);
    });
  };

  const handleFolderMenuPress = (folderId: string) => {
    const ref = folderRefs.current.get(folderId);
    ref?.measureInWindow((x, y, width, height) => {
      const menuWidth = 160;
      const screenWidth = Dimensions.get('window').width;
      const left = Math.min(Math.max(8, x + width - menuWidth), screenWidth - menuWidth - 8);
      setContextMenuPosition({ top: y + 8, left });
      setActiveFolderMenu(folderId);
    });
  };

  // ─── Ref Setters ───
  const setFolderRef = (id: string) => (ref: View | null) => {
    if (ref) folderRefs.current.set(id, ref);
    else folderRefs.current.delete(id);
  };

  const setTemplateRef = (id: string) => (ref: View | null) => {
    if (ref) templateRefs.current.set(id, ref);
    else templateRefs.current.delete(id);
  };

  const anyOverlayOpen =
    showTemplateBuilder || showCreateFolder || showTemplateMenu ||
    activeTemplateMenu !== null || activeFolderMenu !== null ||
    activeTemplatePreview !== null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!liftedTemplate && !anyOverlayOpen}
        pointerEvents={anyOverlayOpen ? 'none' : 'auto'}>
        {/* Page Title */}
        <Text style={[styles.pageTitle, { color: Colors.text }]}>Start Workout</Text>

        {/* Quick Start Section */}
        <Text style={[styles.sectionLabel, { color: Colors.text }]}>Quick Start</Text>
        <TouchableOpacity
          style={[styles.emptyWorkoutButton, { backgroundColor: Colors.secondary }]}
          onPress={() => {
            if (liftedTemplate) return;
            startWorkout();
          }}
          activeOpacity={activeOpacity.button}>
          <Text style={[styles.emptyWorkoutText, { color: Colors.background }]}>
            Start an Empty Workout
          </Text>
        </TouchableOpacity>

        {/* Templates Header */}
        <View style={styles.templatesHeader}>
          <Text style={[styles.templatesTitle, { color: Colors.text }]}>Templates</Text>
          <View style={styles.templatesHeaderActions}>
            {/* + Template button */}
            <TouchableOpacity
              style={[
                styles.addTemplateButton,
                { backgroundColor: Colors.secondary + '1A', borderColor: Colors.secondary + '33' },
              ]}
              onPress={() => {
                if (liftedTemplate) return;
                setShowTemplateBuilder(true);
              }}
              activeOpacity={activeOpacity.button}>
              <Text style={[styles.addTemplateText, { color: Colors.secondary }]}>+ Template</Text>
            </TouchableOpacity>
            {/* Folder icon */}
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: Colors.border + '80' }]}
              onPress={() => {
                if (liftedTemplate) return;
                setShowCreateFolder(true);
              }}
              activeOpacity={activeOpacity.button}>
              <IconSymbol name="folder" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            {/* More menu */}
            <View ref={menuButtonRef}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: Colors.border + '80' }]}
                onPress={() => {
                  if (liftedTemplate) return;
                  handleMenuPress();
                }}
                activeOpacity={activeOpacity.button}>
                <IconSymbol name="more-vert" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Folders Section */}
        {templateFolders.length > 0 && (
          <>
            <Text style={[styles.subSectionLabel, { color: Colors.textSecondary }]}>FOLDERS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foldersRow}
              scrollEnabled={!liftedTemplate}>
              {templateFolders.map((folder) => (
                <View
                  key={folder.id}
                  ref={setFolderRef(folder.id)}
                  style={[
                    styles.folderCard,
                    {
                      backgroundColor: Colors.card,
                      borderColor: liftedTemplate ? Colors.primary : Colors.border,
                    },
                    liftedTemplate && {
                      shadowColor: Colors.primary,
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      elevation: 6,
                    },
                  ]}>
                  {/* Main card tap area */}
                  <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={() => handleFolderPress(folder.id)}
                    activeOpacity={activeOpacity.card}
                  />

                  {/* Folder content */}
                  <View pointerEvents="none" style={styles.folderCardContent}>
                    <IconSymbol name="folder" size={24} color={Colors.primary} />
                    <Text style={[styles.folderName, { color: Colors.text }]} numberOfLines={1}>
                      {folder.name}
                    </Text>
                    <Text style={[styles.folderCount, { color: Colors.textSecondary }]}>
                      {folder.templateIds.length} template{folder.templateIds.length !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  {/* Menu button */}
                  {!liftedTemplate && (
                    <TouchableOpacity
                      style={[styles.folderMenuButton, { backgroundColor: Colors.border + '80' }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleFolderMenuPress(folder.id);
                      }}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                      activeOpacity={activeOpacity.button}>
                      <IconSymbol name="more-vert" size={14} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Expanded Folder Contents */}
        {expandedFolderId && !liftedTemplate && (
          <>
            <View style={styles.subSectionHeader}>
              <Text style={[styles.subSectionTitle, { color: Colors.text }]}>
                {templateFolders.find((f) => f.id === expandedFolderId)?.name}
              </Text>
            </View>
            <View style={styles.cardGrid}>
              {getTemplatesInFolder(expandedFolderId).map((template) => (
                <View key={template.id} style={{ width: '47.5%' }}>
                  <TemplateCard
                    template={template}
                    onPress={() => setActiveTemplatePreview(template)}
                    onMenuPress={() => handleTemplateMenuPress(template.id)}
                    Colors={Colors}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        {/* My Templates Section */}
        <View style={styles.subSectionHeader}>
          <Text style={[styles.subSectionTitle, { color: Colors.text }]}>
            My Templates ({unfiledTemplates.length})
          </Text>
          {!liftedTemplate && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: Colors.border + '80' }]}
              activeOpacity={activeOpacity.button}>
              <IconSymbol name="more-vert" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {liftedTemplate && (
          <View style={styles.liftHint}>
            <Text style={[styles.liftHintText, { color: Colors.primary }]}>
              Tap a folder to move &quot;{liftedTemplate.name}&quot;
            </Text>
            <TouchableOpacity
              onPress={handleCancelLift}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={activeOpacity.button}>
              <Text style={[styles.liftHintCancel, { color: Colors.danger }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.cardGrid}>
          {unfiledTemplates.map((template) => (
            <Animated.View
              key={template.id}
              ref={setTemplateRef(template.id)}
              style={[
                { width: '47.5%' },
                liftedTemplate?.id === template.id && {
                  transform: [{ scale: liftScale }],
                  zIndex: 10,
                  elevation: 10,
                },
              ]}>
              <TemplateCard
                template={template}
                onPress={() => {
                  if (liftedTemplate) return;
                  setActiveTemplatePreview(template);
                }}
                onLongPress={() => handleLiftTemplate(template)}
                onMenuPress={() => handleTemplateMenuPress(template.id)}
                isLifted={liftedTemplate?.id === template.id}
                Colors={Colors}
              />
            </Animated.View>
          ))}
        </View>

        {/* Example Templates Section */}
        <View style={styles.subSectionHeader}>
          <Text style={[styles.subSectionTitle, { color: Colors.text }]}>
            Example Templates ({EXAMPLE_TEMPLATES.length})
          </Text>
        </View>

        <View style={styles.cardGrid}>
          {EXAMPLE_TEMPLATES.map((template) => (
            <View key={template.id} style={{ width: '47.5%' }}>
              <TemplateCard
                template={template}
                onPress={() => setActiveTemplatePreview(template)}
                onMenuPress={() => {}}
                isExample
                Colors={Colors}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ─── Overlays ─── Rendered AFTER ScrollView so they appear ON TOP ─── */}
      {showTemplateBuilder && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
          <TemplateBuilder onClose={() => setShowTemplateBuilder(false)} onSave={handleSaveTemplate} />
        </View>
      )}

      {showCreateFolder && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
          <CreateFolderModal onClose={() => setShowCreateFolder(false)} onSave={handleSaveFolder} />
        </View>
      )}

      {showTemplateMenu && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
          <TemplateMenu
            position={menuPosition}
            onClose={() => setShowTemplateMenu(false)}
            onShowArchive={() => {
              setShowTemplateMenu(false);
              // Placeholder for future archive functionality
            }}
          />
        </View>
      )}

      {/* Template context menu */}
      <ContextMenu
        visible={activeTemplateMenu !== null}
        position={contextMenuPosition}
        items={[
          {
            label: 'Delete',
            danger: true,
            onPress: () => {
              if (activeTemplateMenu) {
                handleDeleteTemplate(activeTemplateMenu);
              }
            },
          },
        ]}
        onClose={() => setActiveTemplateMenu(null)}
      />

      {/* Folder context menu */}
      <ContextMenu
        visible={activeFolderMenu !== null}
        position={contextMenuPosition}
        items={[
          {
            label: 'Delete Folder',
            danger: true,
            onPress: () => {
              if (activeFolderMenu) {
                handleDeleteFolder(activeFolderMenu);
              }
            },
          },
        ]}
        onClose={() => setActiveFolderMenu(null)}
      />

      {/* Template Preview Popup */}
      {activeTemplatePreview && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
          <TemplatePreviewPopup
            template={activeTemplatePreview}
            isEditable={!EXAMPLE_TEMPLATES.some((t) => t.id === activeTemplatePreview.id)}
            onClose={() => setActiveTemplatePreview(null)}
            onStartWorkout={(exerciseNames) => {
              startWorkoutFromTemplate(exerciseNames);
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function TemplateCard({
  template,
  onPress,
  onLongPress,
  onMenuPress,
  isExample,
  isLifted,
  Colors,
}: {
  template: WorkoutTemplate;
  onPress: () => void;
  onLongPress?: () => void;
  onMenuPress: () => void;
  isExample?: boolean;
  isLifted?: boolean;
  Colors: ReturnType<typeof useTheme>;
}) {
  const exerciseText = template.exercises.join(', ');
  const maxChars = 65;
  const displayText =
    exerciseText.length > maxChars
      ? exerciseText.slice(0, maxChars).trim() + '...'
      : exerciseText;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: Colors.card,
          borderColor: isLifted ? Colors.primary : Colors.border,
          shadowColor: isLifted ? Colors.primary : Colors.shadow,
        },
        isLifted && {
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 6,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={activeOpacity.card}>
      {/* Card Header: Name + Menu */}
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: Colors.text }]} numberOfLines={2}>
          {template.name}
        </Text>
        {!isLifted && (
          <TouchableOpacity
            style={[styles.cardMenuButton, { backgroundColor: Colors.border + '80' }]}
            onPress={onMenuPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={activeOpacity.button}>
            <IconSymbol name="more-vert" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Exercise List */}
      <Text style={[styles.cardExercises, { color: Colors.textSecondary }]} numberOfLines={4}>
        {displayText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  pageTitle: {
    fontSize: typography['3xl'],
    fontWeight: 'bold',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.lg,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  emptyWorkoutButton: {
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    minHeight: 56,
    justifyContent: 'center',
  },
  emptyWorkoutText: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  templatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  templatesTitle: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
  },
  templatesHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addTemplateButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  addTemplateText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  iconButton: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subSectionLabel: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  subSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  subSectionTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  foldersRow: {
    paddingRight: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  folderCard: {
    width: 120,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 110,
  },
  folderName: {
    fontSize: typography.sm,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  folderCount: {
    fontSize: typography.xs,
    marginTop: spacing.xs,
  },
  folderCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderMenuButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 22,
  },
  cardMenuButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  cardExercises: {
    fontSize: typography.sm,
    lineHeight: 18,
  },
  liftHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  liftHintText: {
    fontSize: typography.sm,
    fontWeight: '600',
    flex: 1,
  },
  liftHintCancel: {
    fontSize: typography.sm,
    fontWeight: '600',
    marginLeft: spacing.md,
  },
});
