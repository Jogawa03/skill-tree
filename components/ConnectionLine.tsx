import { Colors } from '@/constants/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

interface ConnectionLineProps {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  onPress?: (id: string) => void;
}

export function ConnectionLine({ id, x1, y1, x2, y2, onPress }: ConnectionLineProps) {
  const handleContextMenu = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPress) {
      onPress(id);
    }
  };

  // Calculate midpoint for hit area
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={Colors.secondary}
          strokeWidth="3"
        />
      </Svg>
      
      {/* Interactive hit area at midpoint */}
      {onPress && (
        <View
          style={[
            styles.hitArea,
            {
              left: midX - 15,
              top: midY - 15,
            },
          ]}
          onContextMenu={handleContextMenu}
        >
          <View style={styles.deleteIndicator} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  hitArea: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  deleteIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    opacity: 0.7,
  },
});

