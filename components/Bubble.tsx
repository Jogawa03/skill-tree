import { Colors } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BubbleProps {
  id: string;
  name: string;
  x: number;
  y: number;
  isRoot?: boolean;
  isDisconnected?: boolean;
}

export function Bubble({
  id,
  name,
  x,
  y,
  isRoot = false,
  isDisconnected = false,
}: BubbleProps) {
  const size = 100; // All bubbles same size now

  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: x - size / 2,
          top: y - size / 2,
          backgroundColor: isRoot ? Colors.accent : Colors.bubbleColor,
          borderColor: isDisconnected ? Colors.error : (isRoot ? Colors.primary : Colors.secondary),
          borderWidth: isRoot ? 3 : 2,
        },
      ]}
    >
      <Text
        style={styles.bubbleText}
        numberOfLines={2}
      >
        {name}
      </Text>
      
      {isDisconnected && !isRoot && (
        <View style={styles.warningDot} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  warningDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.error,
  },
});
