import { Bubble } from '@/components/Bubble';
import { ModalEditSubSkill } from '@/components/ModalEditSubSkill';
import { Colors } from '@/constants/colors';
import { SubSkill, useSkillsStore } from '@/store/useSkillsStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SkillTreeScreen() {
  const router = useRouter();
  const { skillId } = useLocalSearchParams<{ skillId: string }>();
  
  const skills = useSkillsStore((state) => state.skills);
  const skillTrees = useSkillsStore((state) => state.skillTrees);
  const addSubSkill = useSkillsStore((state) => state.addSubSkill);
  const editSubSkill = useSkillsStore((state) => state.editSubSkill);
  const deleteSubSkill = useSkillsStore((state) => state.deleteSubSkill);
  const moveSubSkill = useSkillsStore((state) => state.moveSubSkill);
  const addConnection = useSkillsStore((state) => state.addConnection);
  const deleteConnection = useSkillsStore((state) => state.deleteConnection);
  const getDisconnectedSubSkills = useSkillsStore((state) => state.getDisconnectedSubSkills);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSubSkill, setSelectedSubSkill] = useState<SubSkill | null>(null);
  const [deleteConnectionModalVisible, setDeleteConnectionModalVisible] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  
  // Move mode toggle
  const [moveMode, setMoveMode] = useState(false);
  
  // Pan state (no zoom)
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // For dragging bubbles
  const [draggingBubble, setDraggingBubble] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // For creating connections
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectionLineEnd, setConnectionLineEnd] = useState<{ x: number; y: number } | null>(null);

  const skill = skills.find((s) => s.id === skillId);
  const skillTree = skillId ? skillTrees[skillId] : null;
  const disconnectedIds = skillId ? getDisconnectedSubSkills(skillId) : [];

  useEffect(() => {
    if (!skill) {
      router.back();
    }
  }, [skill]);

  if (!skill || !skillTree) {
    return null;
  }

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number) => {
    return {
      x: screenX - panX,
      y: screenY - panY,
    };
  };

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = (canvasX: number, canvasY: number) => {
    return {
      x: canvasX + panX,
      y: canvasY + panY,
    };
  };

  // Handle add sub-skill button
  const handleAddButtonClick = () => {
    const canvasPos = screenToCanvas(screenWidth / 2, screenHeight / 2);
    const newSubSkill: SubSkill = {
      id: `subskill_${Date.now()}`,
      name: 'New Sub-Skill',
      x: canvasPos.x,
      y: canvasPos.y,
    };
    addSubSkill(skillId!, newSubSkill);
  };

  // Handle canvas mouse down
  const handleCanvasMouseDown = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (e.button === 0 && !moveMode) {
      // Left click - start panning
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  // Handle canvas mouse move
  const handleCanvasMouseMove = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasPos = screenToCanvas(screenX, screenY);

    // Handle panning
    if (isPanning) {
      setPanX(e.clientX - panStart.x);
      setPanY(e.clientY - panStart.y);
      return;
    }

    // Handle bubble dragging
    if (draggingBubble && moveMode) {
      moveSubSkill(skillId!, draggingBubble, canvasPos.x - dragOffset.x, canvasPos.y - dragOffset.y);
    }

    // Handle connection line dragging
    if (connectingFrom) {
      setConnectionLineEnd(canvasPos);
    }
  };

  // Handle canvas mouse up
  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    
    if (draggingBubble) {
      setDraggingBubble(null);
    }
    
    // If we're dragging a connection and release on empty space, cancel
    if (connectingFrom && connectionLineEnd) {
      setConnectingFrom(null);
      setConnectionLineEnd(null);
    }
  };

  // Handle bubble mouse down
  const handleBubbleMouseDown = (e: any, subSkillId: string, x: number, y: number) => {
    e.stopPropagation();
    
    const rect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasPos = screenToCanvas(screenX, screenY);

    if (e.button === 0 && moveMode) {
      // Left button in move mode - start dragging bubble
      setDraggingBubble(subSkillId);
      setDragOffset({
        x: canvasPos.x - x,
        y: canvasPos.y - y,
      });
    } else if (e.button === 0 && !moveMode) {
      // Left click in view mode - show details
      const subSkill = skillTree.subSkills.find((ss) => ss.id === subSkillId);
      if (subSkill) {
        setSelectedSubSkill(subSkill);
        setViewModalVisible(true);
      }
    } else if (e.button === 2) {
      // Right button - start connection
      setConnectingFrom(subSkillId);
      setConnectionLineEnd({ x, y });
    }
  };

  // Handle bubble mouse up
  const handleBubbleMouseUp = (e: any, subSkillId: string) => {
    e.stopPropagation();
    
    // Complete connection if we're connecting
    if (connectingFrom && connectingFrom !== subSkillId && connectionLineEnd) {
      addConnection(skillId!, connectingFrom, subSkillId);
      setConnectingFrom(null);
      setConnectionLineEnd(null);
    }

    if (draggingBubble === subSkillId) {
      setDraggingBubble(null);
    }
  };

  // Handle bubble mouse enter while connecting
  const handleBubbleMouseEnter = (subSkillId: string, x: number, y: number) => {
    if (connectingFrom && connectingFrom !== subSkillId) {
      // Snap line end to this bubble
      setConnectionLineEnd({ x, y });
    }
  };

  // Handle context menu
  const handleContextMenu = (e: any) => {
    e.preventDefault();
  };

  // Handle connection line click
  const handleConnectionClick = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setDeleteConnectionModalVisible(true);
  };

  const handleConfirmDeleteConnection = () => {
    if (selectedConnectionId) {
      deleteConnection(skillId!, selectedConnectionId);
      setSelectedConnectionId(null);
    }
    setDeleteConnectionModalVisible(false);
  };

  // Handle entering edit mode
  const handleEnterEditMode = () => {
    setViewModalVisible(false);
    setEditModalVisible(true);
  };

  // Handle edit sub-skill
  const handleEditSubSkill = (updates: Partial<SubSkill>) => {
    if (selectedSubSkill) {
      editSubSkill(skillId!, selectedSubSkill.id, updates);
      setEditModalVisible(false);
      setSelectedSubSkill(null);
    }
  };

  // Handle delete sub-skill
  const handleDeleteSubSkill = () => {
    if (selectedSubSkill) {
      deleteSubSkill(skillId!, selectedSubSkill.id);
      setEditModalVisible(false);
      setSelectedSubSkill(null);
    }
  };

  // Get bubble position
  const getBubblePosition = (subSkillId: string) => {
    if (subSkillId === 'root') {
      return { x: 400, y: 200 };
    }
    const subSkill = skillTree.subSkills.find((ss) => ss.id === subSkillId);
    return subSkill ? { x: subSkill.x, y: subSkill.y } : { x: 0, y: 0 };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{skill.name}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.modeButton, moveMode && styles.modeButtonActive]}
            onPress={() => setMoveMode(!moveMode)}
          >
            <Text style={[styles.modeButtonText, moveMode && styles.modeButtonTextActive]}>
              {moveMode ? '✓ Move' : 'Move'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {moveMode
            ? 'Left-drag canvas to pan • Left-drag bubble to move • Right-drag from bubble to connect'
            : 'Left-drag to pan • Left-click bubble to view • Right-drag from bubble to connect'}
        </Text>
      </View>

      {/* Canvas Container */}
      <View 
        style={styles.canvasContainer}
        // @ts-ignore
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onContextMenu={handleContextMenu}
      >
        {/* SVG Layer for Lines - Behind bubbles */}
        <Svg 
          width="100%"
          height="100%"
          style={styles.svgLayer}
          pointerEvents="none"
        >
          {/* Draw existing connections */}
          {skillTree.connections.map((conn) => {
            const from = getBubblePosition(conn.fromId);
            const to = getBubblePosition(conn.toId);
            const screenFrom = canvasToScreen(from.x, from.y);
            const screenTo = canvasToScreen(to.x, to.y);
            
            return (
              <Line
                key={conn.id}
                x1={screenFrom.x}
                y1={screenFrom.y}
                x2={screenTo.x}
                y2={screenTo.y}
                stroke={Colors.primary}
                strokeWidth={4}
              />
            );
          })}

          {/* Draw temporary connection line while dragging */}
          {connectingFrom && connectionLineEnd && (
            <Line
              x1={canvasToScreen(getBubblePosition(connectingFrom).x, getBubblePosition(connectingFrom).y).x}
              y1={canvasToScreen(getBubblePosition(connectingFrom).x, getBubblePosition(connectingFrom).y).y}
              x2={canvasToScreen(connectionLineEnd.x, connectionLineEnd.y).x}
              y2={canvasToScreen(connectionLineEnd.x, connectionLineEnd.y).y}
              stroke={Colors.accent}
              strokeWidth={4}
              strokeDasharray="10,5"
            />
          )}
        </Svg>

        {/* Transformed Canvas for Bubbles - On top of lines */}
        <View
          style={[
            styles.canvas,
            {
              transform: [
                { translateX: panX },
                { translateY: panY },
              ],
            },
          ]}
          pointerEvents="box-none"
        >
          {/* Root Bubble */}
          <View
            style={styles.bubbleWrapper}
            pointerEvents="auto"
            // @ts-ignore
            onMouseDown={(e: any) => handleBubbleMouseDown(e, 'root', 400, 200)}
            onMouseUp={(e: any) => handleBubbleMouseUp(e, 'root')}
            onMouseEnter={() => handleBubbleMouseEnter('root', 400, 200)}
          >
            <Bubble
              id="root"
              name={skill.name}
              x={400}
              y={200}
              isRoot={true}
            />
          </View>

          {/* Sub-Skill Bubbles */}
          {skillTree.subSkills.map((subSkill) => (
            <View
              key={subSkill.id}
              style={styles.bubbleWrapper}
              pointerEvents="auto"
              // @ts-ignore
              onMouseDown={(e: any) => handleBubbleMouseDown(e, subSkill.id, subSkill.x, subSkill.y)}
              onMouseUp={(e: any) => handleBubbleMouseUp(e, subSkill.id)}
              onMouseEnter={() => handleBubbleMouseEnter(subSkill.id, subSkill.x, subSkill.y)}
            >
              <Bubble
                id={subSkill.id}
                name={subSkill.name}
                x={subSkill.x}
                y={subSkill.y}
                isDisconnected={disconnectedIds.includes(subSkill.id)}
              />
            </View>
          ))}
        </View>

        {/* UI Overlay */}
        <View style={styles.uiOverlay}>
          <TouchableOpacity style={styles.addBubbleButton} onPress={handleAddButtonClick}>
            <Text style={styles.addBubbleText}>+ Add Sub-Skill</Text>
          </TouchableOpacity>

          {disconnectedIds.length > 0 && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                ⚠️ {disconnectedIds.length} sub-skill{disconnectedIds.length > 1 ? 's' : ''} not connected
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* View Modal */}
      <Modal
        visible={viewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setViewModalVisible(false);
          setSelectedSubSkill(null);
        }}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              setViewModalVisible(false);
              setSelectedSubSkill(null);
            }}
          />
          <View style={styles.viewContainer}>
            {selectedSubSkill && (
              <>
                <Text style={styles.viewTitle}>{selectedSubSkill.name}</Text>
                
                {selectedSubSkill.notes && (
                  <>
                    <Text style={styles.viewLabel}>Notes</Text>
                    <Text style={styles.viewText}>{selectedSubSkill.notes}</Text>
                  </>
                )}
                
                {selectedSubSkill.links && selectedSubSkill.links.length > 0 && (
                  <>
                    <Text style={styles.viewLabel}>Links</Text>
                    {selectedSubSkill.links.map((link, index) => (
                      <Text key={index} style={styles.viewLink}>{link}</Text>
                    ))}
                  </>
                )}
                
                {selectedSubSkill.images && selectedSubSkill.images.length > 0 && (
                  <>
                    <Text style={styles.viewLabel}>Images</Text>
                    <Text style={styles.viewText}>{selectedSubSkill.images.length} image(s) attached</Text>
                  </>
                )}

                <View style={styles.viewButtons}>
                  <TouchableOpacity
                    style={[styles.viewButton, styles.closeButton]}
                    onPress={() => {
                      setViewModalVisible(false);
                      setSelectedSubSkill(null);
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.viewButton, styles.editButton]}
                    onPress={handleEnterEditMode}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <ModalEditSubSkill
        visible={editModalVisible}
        subSkill={selectedSubSkill}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedSubSkill(null);
        }}
        onSave={handleEditSubSkill}
        onDelete={handleDeleteSubSkill}
      />

      {/* Delete Connection Modal */}
      <Modal
        visible={deleteConnectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConnectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setDeleteConnectionModalVisible(false)}
          />
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmTitle}>Delete Connection</Text>
            <Text style={styles.confirmMessage}>
              Do you want to delete this connection?
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setDeleteConnectionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={handleConfirmDeleteConnection}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: Colors.accent,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  modeButtonTextActive: {
    color: Colors.text,
  },
  instructions: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  instructionText: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
  canvasContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.background,
  },
  canvas: {
    position: 'absolute',
    width: 4000,
    height: 4000,
    left: 0,
    top: 0,
    zIndex: 10,
  },
  bubbleWrapper: {
    position: 'absolute',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  uiOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
    zIndex: 200,
  },
  addBubbleButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    pointerEvents: 'auto',
  },
  addBubbleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  warningBanner: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: Colors.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    pointerEvents: 'auto',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    minWidth: 400,
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  viewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  viewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  viewText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  viewLink: {
    fontSize: 14,
    color: Colors.accent,
    marginBottom: 4,
    textDecorationLine: 'underline',
  },
  viewButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: Colors.secondary,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  editButton: {
    backgroundColor: Colors.accent,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmContainer: {
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
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
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
  deleteButton: {
    backgroundColor: Colors.error,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
