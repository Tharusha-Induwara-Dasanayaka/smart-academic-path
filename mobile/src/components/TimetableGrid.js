import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../constants/theme';
import { normalizeDay, timeToMinutes } from '../utils/clashLogic';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Time slots mapping to grid rows
const SLOTS = [
  { id: 's1', label: '08:00–10:00', startMin: 480, endMin: 600 },
  { id: 's2', label: '10:00–12:00', startMin: 600, endMin: 720 },
  { id: 's3', label: '11:00–13:00', startMin: 660, endMin: 780 },
  { id: 's4', label: '14:00–16:00', startMin: 840, endMin: 960 },
  { id: 's5', label: '09:00–11:00', startMin: 540, endMin: 660 },
  { id: 's6', label: '13:00–15:00', startMin: 780, endMin: 900 },
];

export default function TimetableGrid({
  selectedModules = [],
  groups = [],
  clashes = [],
  onModulePress,
  compact = false,
  style,
}) {
  // Resolve selected groups
  const resolvedItems = selectedModules
    .map((sel) => {
      const g = groups.find(
        (grp) => grp.moduleCode === sel.moduleCode && grp.groupId === sel.groupId
      );
      if (!g) return null;
      const isClashing = clashes.some(
        (c) => c.moduleA === g.moduleCode || c.moduleB === g.moduleCode
      );
      return {
        ...g,
        normDay: normalizeDay(g.day || g.dayOfWeek),
        startMin: timeToMinutes(g.start),
        endMin: timeToMinutes(g.end),
        isClashing,
      };
    })
    .filter(Boolean);

  // Group items by day
  const itemsByDay = {};
  DAYS.forEach((d) => {
    itemsByDay[d] = resolvedItems.filter((item) => item.normDay === d);
  });

  // Decide row placements
  // Row 1: empty padding row or 08-10
  // Row 2: 10:00–12:00 (Mon IT3060, Mon IT3070 G2)
  // Row 3: 11:00–13:00 (Thu IT3080)
  // Row 4: 14:00–16:00 (Tue IT3070 G4)
  // Row 5: 09:00–11:00 (Wed IT3070 G6, Fri IT3090)
  // Row 6: 13:00–15:00 (Fri IT3100)
  const rows = [
    { id: 'r1', targetStart: 480, targetEnd: 600 },
    { id: 'r2', targetStart: 600, targetEnd: 720 },
    { id: 'r3', targetStart: 660, targetEnd: 780 },
    { id: 'r4', targetStart: 840, targetEnd: 960 },
    { id: 'r5', targetStart: 540, targetEnd: 660 },
    { id: 'r6', targetStart: 780, targetEnd: 900 },
  ];

  const getCellContent = (day, row) => {
    const dayItems = itemsByDay[day] || [];
    // Match item that falls into this row slot
    const matching = dayItems.filter((item) => {
      // Overlaps with row slot window
      return item.startMin < row.targetEnd && row.targetStart < item.endMin;
    });

    if (matching.length === 0) return null;

    const hasClash = matching.length > 1 || matching.some((m) => m.isClashing);

    if (hasClash) {
      const titles = matching.map((m) => m.moduleCode).join(' + ');
      return {
        isClash: true,
        text: titles,
        sub: 'CLASH',
        items: matching,
      };
    }

    const single = matching[0];
    return {
      isClash: false,
      text: single.moduleCode,
      sub: single.groupId,
      moduleCode: single.moduleCode,
      item: single,
    };
  };

  const getModuleStyle = (moduleCode) => {
    switch (moduleCode) {
      case 'IT3060':
        return { bg: '#E0F2FE', text: '#0284C7' };
      case 'IT3070':
        return { bg: '#DCFCE7', text: '#16A34A' };
      case 'IT3080':
        return { bg: '#FEF9C3', text: '#D97706' };
      case 'IT3090':
        return { bg: '#EDE9FE', text: '#7C3AED' };
      case 'IT3100':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#EBF4FF', text: '#2563EB' };
    }
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      {/* Day header */}
      <View style={styles.headerRow}>
        {DAYS.map((day) => (
          <Text key={day} style={[styles.dayHeaderText, compact && styles.dayHeaderCompact]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Grid rows */}
      {rows.map((row, rIdx) => {
        const isLastRow = rIdx === rows.length - 1;
        return (
          <View key={row.id} style={[styles.gridRow, isLastRow && styles.gridRowLast]}>
            {DAYS.map((day, dIdx) => {
              const cellData = getCellContent(day, row);
              const isLastCell = dIdx === DAYS.length - 1;

              if (!cellData) {
                return (
                  <View
                    key={day}
                    style={[
                      styles.cell,
                      isLastCell && styles.cellLast,
                      compact && styles.cellCompact,
                    ]}
                  />
                );
              }

              if (cellData.isClash) {
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.cell,
                      styles.clashCell,
                      isLastCell && styles.cellLast,
                      compact && styles.cellCompact,
                    ]}
                    onPress={() => onModulePress && onModulePress(cellData.items[0]?.moduleCode)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.clashText, compact && styles.textCompact]}
                      numberOfLines={1}
                    >
                      {cellData.text}
                    </Text>
                    <Text style={[styles.clashSub, compact && styles.subCompact]}>
                      ! Overlap
                    </Text>
                  </TouchableOpacity>
                );
              }

              const modStyle = getModuleStyle(cellData.moduleCode);
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.cell,
                    styles.moduleCell,
                    { backgroundColor: modStyle.bg },
                    isLastCell && styles.cellLast,
                    compact && styles.cellCompact,
                  ]}
                  onPress={() => onModulePress && onModulePress(cellData.moduleCode)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.moduleText,
                      { color: modStyle.text },
                      compact && styles.textCompact,
                    ]}
                    numberOfLines={1}
                  >
                    {cellData.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  containerCompact: {
    borderRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFB',
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  dayHeaderCompact: {
    fontSize: 11,
    paddingVertical: 2,
  },
  gridRow: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  gridRowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  cellCompact: {
    height: 42,
  },
  cellLast: {
    borderRightWidth: 0,
  },
  moduleCell: {
    borderRadius: 8,
    margin: 2,
    borderWidth: 0,
  },
  moduleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textCompact: {
    fontSize: 10,
  },
  subCompact: {
    fontSize: 8,
  },
  clashCell: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1.5,
    borderRadius: 8,
    margin: 2,
  },
  clashText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  clashSub: {
    color: '#B91C1C',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 1,
  },
});
