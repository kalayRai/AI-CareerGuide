

// app/(tabs)/_layout.tsx — Tab bar configuration (replaces the default)
import { Tabs } from 'expo-router';
import { colors, font } from '../../../src/theme';
import { Text, View, StyleSheet } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.gray200, elevation: 0 } as any,
        headerTitleStyle: { fontSize: font.sizes.base, fontWeight: font.weights.semibold, color: colors.gray900 },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.white, borderTopWidth: 0.5, borderTopColor: colors.gray200, height: 70, paddingBottom: 8 },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index"    options={{ title:'CareerCompass AI', tabBarIcon:({ focused })=><TabIcon emoji="✦" label="Start"   focused={focused}/> }} />
      <Tabs.Screen name="dashboard" options={{ title:'Dashboard',         tabBarIcon:({ focused })=><TabIcon emoji="⚡" label="Results" focused={focused}/> }} />
      <Tabs.Screen name="roadmap"  options={{ title:'Roadmap',            tabBarIcon:({ focused })=><TabIcon emoji="🗺" label="Roadmap" focused={focused}/> }} />
      <Tabs.Screen name="coach"    options={{ title:'AI Coach',           tabBarIcon:({ focused })=><TabIcon emoji="💬" label="Coach"   focused={focused}/> }} />
      <Tabs.Screen name="simulator"options={{ title:'Simulator',          tabBarIcon:({ focused })=><TabIcon emoji="🔮" label="Sim"     focused={focused}/> }} />
      <Tabs.Screen name="jobs"     options={{ title:'Jobs',               tabBarIcon:({ focused })=><TabIcon emoji="💼" label="Jobs"    focused={focused}/> }} />
      <Tabs.Screen name="explore"  options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap:    { alignItems:'center', gap:2, paddingHorizontal:4 },
  emoji:       { fontSize:20 },
  label:       { fontSize:10, color:colors.gray400 },
  labelActive: { color:colors.brand600, fontWeight:'600' },
});
