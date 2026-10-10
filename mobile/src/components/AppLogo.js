import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  G,
  Ellipse,
} from 'react-native-svg';

/**
 * AppLogo — vector recreation of the Smart Academic Path logo.
 * Graduation cap diamond + clock face + book scrolls underneath.
 * Uses react-native-svg, no image file required.
 *
 * Props:
 *   size      — overall width/height of the bounding box (default 80)
 *   onWhite   — true = purple icon on white bg (Login), false = white icon on purple bg (Splash)
 */
export default function AppLogo({ size = 80, onWhite = false }) {
  const iconColor = onWhite ? '#6C3BFF' : '#FFFFFF';
  const accentColor = onWhite ? '#8B5CF6' : 'rgba(255,255,255,0.75)';
  const s = size;

  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={s} height={s} viewBox="0 0 100 100">

        {/* ── Graduation cap diamond (top) ── */}
        {/* Left wing */}
        <Path
          d="M50 18 L20 38 L50 44 Z"
          fill={iconColor}
          opacity={0.9}
        />
        {/* Right wing */}
        <Path
          d="M50 18 L80 38 L50 44 Z"
          fill={iconColor}
          opacity={0.75}
        />
        {/* Center diamond top face */}
        <Path
          d="M50 18 L65 30 L50 38 L35 30 Z"
          fill={iconColor}
        />

        {/* ── Clock face (center) ── */}
        <Circle cx="50" cy="52" r="16" fill={onWhite ? '#EDE9FE' : 'rgba(255,255,255,0.2)'} />
        <Circle cx="50" cy="52" r="16" fill="none" stroke={iconColor} strokeWidth="2.5" />

        {/* Clock hour hand (pointing ~11 o'clock) */}
        <Line
          x1="50" y1="52"
          x2="44" y2="44"
          stroke={iconColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Clock minute hand (pointing ~2 o'clock) */}
        <Line
          x1="50" y1="52"
          x2="57" y2="46"
          stroke={iconColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Clock center dot */}
        <Circle cx="50" cy="52" r="1.8" fill={iconColor} />

        {/* ── Scroll / book shapes (bottom left & right) ── */}
        {/* Left scroll */}
        <Path
          d="M28 72 Q24 68 26 64 Q28 60 32 62 L42 65 Q44 66 43 69 Q42 72 38 73 Z"
          fill={accentColor}
        />
        <Path
          d="M30 73 Q26 77 28 80 Q30 82 33 80 L43 76 Q45 74 43 72 Q41 70 38 71 Z"
          fill={iconColor}
          opacity={0.7}
        />

        {/* Right scroll */}
        <Path
          d="M72 72 Q76 68 74 64 Q72 60 68 62 L58 65 Q56 66 57 69 Q58 72 62 73 Z"
          fill={accentColor}
        />
        <Path
          d="M70 73 Q74 77 72 80 Q70 82 67 80 L57 76 Q55 74 57 72 Q59 70 62 71 Z"
          fill={iconColor}
          opacity={0.7}
        />

        {/* Upward arrows on cap wings (speed/growth lines) */}
        <Path
          d="M22 33 L22 26 M19 29 L22 26 L25 29"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M78 33 L78 26 M75 29 L78 26 L81 29"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </Svg>
    </View>
  );
}
