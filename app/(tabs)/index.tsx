// app/(tabs)/index.tsx — Onboarding Wizard (5 steps)
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCareerStore } from '../../../src/store/careerStore';
import { colors, spacing, radius, font, shadows } from '../../../src/theme';

const SKILLS = ['JavaScript','Python','React','Node.js','SQL','Machine Learning','Data Analysis',
  'Product Management','UX Design','TypeScript','AWS','Docker','Kubernetes','GraphQL','Java',
  'C++','Swift','Kotlin','Excel','Tableau','Figma','Agile','Leadership','Communication',
  'Project Management','Financial Analysis','Marketing','Content Writing','SEO','Sales'];

const EDUCATION = ["High School","Associate's","Bachelor's","Master's","PhD","Bootcamp / Self-taught"];
const EXPERIENCE = ['0 (Student / Fresher)','1–2 years','3–5 years','6–10 years','10+ years'];
const WORKTYPE   = [{ v:'remote',label:'🌐 Remote'},{ v:'hybrid',label:'🏙 Hybrid'},{ v:'onsite',label:'🏢 On-site'}];

const STEPS = [
  { title:'Basic Information',   sub:'Tell us about yourself to get started' },
  { title:'Current Role',        sub:'Where are you in your career?' },
  { title:'Skills Inventory',    sub:'Tap every skill you currently have' },
  { title:'Values & Priorities', sub:'Use ↑ ↓ to rank what matters most' },
  { title:'Goals & Constraints', sub:'Where do you want to go?' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, setProfile } = useCareerStore();
  const [step, setStep] = useState(0);
  const progress = useRef(new Animated.Value(1 / STEPS.length)).current;

  const animateTo = (s: number) =>
    Animated.timing(progress, { toValue: (s + 1) / STEPS.length, duration: 280, useNativeDriver: false }).start();

  const validate = () => {
    if (step === 0 && !profile.name.trim()) { Alert.alert('Required', 'Please enter your name.'); return false; }
    if (step === 1 && !profile.currentRole.trim()) { Alert.alert('Required', 'Please enter your current role.'); return false; }
    if (step === 2 && profile.skills.length === 0) { Alert.alert('Select Skills', 'Pick at least one skill.'); return false; }
    return true;
  };

  const next = () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) { const s = step + 1; setStep(s); animateTo(s); }
    else router.push('/dashboard');
  };
  const back = () => { if (step > 0) { const s = step - 1; setStep(s); animateTo(s); } };

  const toggleSkill = (sk: string) =>
    setProfile({ skills: profile.skills.includes(sk) ? profile.skills.filter((s: string) => s !== sk) : [...profile.skills, sk] });

  const moveValue = (idx: number, dir: -1|1) => {
    const arr = [...profile.values];
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setProfile({ values: arr });
  };

  const barWidth = progress.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        {/* Progress */}
        <View style={s.progWrap}>
          <View style={s.progTrack}><Animated.View style={[s.progFill,{width:barWidth}]}/></View>
          <View style={s.stepRow}>
            <Text style={s.stepCount}>Step {step+1} of {STEPS.length}</Text>
            <Text style={s.dots}>{STEPS.map((_,i)=>i<=step?'●':'○').join('  ')}</Text>
          </View>
        </View>

        <ScrollView style={{flex:1}} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={s.title}>{STEPS[step].title}</Text>
          <Text style={s.sub}>{STEPS[step].sub}</Text>

          {/* ── Step 0: Basic Info ── */}
          {step===0 && <>
            <Field label="Full Name"><TextInput style={s.input} value={profile.name} onChangeText={v=>setProfile({name:v})} placeholder="e.g. Alex Chen" placeholderTextColor={colors.gray400} autoCapitalize="words"/></Field>
            <Field label="Age"><TextInput style={s.input} value={profile.age} onChangeText={v=>setProfile({age:v})} placeholder="e.g. 28" placeholderTextColor={colors.gray400} keyboardType="numeric"/></Field>
            <Field label="Location"><TextInput style={s.input} value={profile.location} onChangeText={v=>setProfile({location:v})} placeholder="e.g. Bangalore, India" placeholderTextColor={colors.gray400}/></Field>
            <Field label="Education">
              {EDUCATION.map(e=><Chip key={e} label={e} active={profile.education===e} onPress={()=>setProfile({education:e})}/>)}
            </Field>
          </>}

          {/* ── Step 1: Role ── */}
          {step===1 && <>
            <Field label="Current Job Title"><TextInput style={s.input} value={profile.currentRole} onChangeText={v=>setProfile({currentRole:v})} placeholder="e.g. Junior Developer, Student..." placeholderTextColor={colors.gray400}/></Field>
            <Field label="Years of Experience">
              {EXPERIENCE.map(e=><Chip key={e} label={e} active={profile.yearsExp===e} onPress={()=>setProfile({yearsExp:e})}/>)}
            </Field>
          </>}

          {/* ── Step 2: Skills ── */}
          {step===2 && <>
            <Text style={s.count}>{profile.skills.length} selected</Text>
            <View style={s.skillGrid}>
              {SKILLS.map(sk=>{
                const on = profile.skills.includes(sk);
                return <TouchableOpacity key={sk} style={[s.skillTag,on&&s.skillOn]} onPress={()=>toggleSkill(sk)} activeOpacity={0.7}>
                  <Text style={[s.skillText,on&&s.skillTextOn]}>{sk}</Text>
                </TouchableOpacity>;
              })}
            </View>
          </>}

          {/* ── Step 3: Values ── */}
          {step===3 && profile.values.map((v:string,i:number)=>(
            <View key={v} style={s.valueRow}>
              <View style={s.rankBadge}><Text style={s.rankNum}>{i+1}</Text></View>
              <Text style={s.valueLabel}>{v}</Text>
              <TouchableOpacity style={s.arrow} onPress={()=>moveValue(i,-1)}><Text style={s.arrowT}>↑</Text></TouchableOpacity>
              <TouchableOpacity style={s.arrow} onPress={()=>moveValue(i,1)}><Text style={s.arrowT}>↓</Text></TouchableOpacity>
            </View>
          ))}

          {/* ── Step 4: Goals ── */}
          {step===4 && <>
            <Field label="Career Goal (1–5 years)">
              <TextInput style={[s.input,s.textarea]} value={profile.goals} onChangeText={v=>setProfile({goals:v})} placeholder="I want to become a senior engineer and lead an AI team..." placeholderTextColor={colors.gray400} multiline numberOfLines={4} textAlignVertical="top"/>
            </Field>
            <Field label="Minimum Salary (USD/yr)">
              <TextInput style={s.input} value={profile.salaryFloor} onChangeText={v=>setProfile({salaryFloor:v})} placeholder="e.g. 80000" placeholderTextColor={colors.gray400} keyboardType="numeric"/>
            </Field>
            <Field label="Work Preference">
              <View style={{flexDirection:'row',gap:8}}>
                {WORKTYPE.map(w=><Chip key={w.v} label={w.label} active={profile.workType===w.v} onPress={()=>setProfile({workType:w.v as any})} flex/>)}
              </View>
            </Field>
          </>}
        </ScrollView>

        {/* Nav buttons */}
        <View style={s.nav}>
          {step>0 ? <TouchableOpacity style={s.btnBack} onPress={back}><Text style={s.btnBackT}>← Back</Text></TouchableOpacity> : <View style={{flex:1}}/>}
          <TouchableOpacity style={s.btnNext} onPress={next}>
            <Text style={s.btnNextT}>{step===STEPS.length-1?'Get My Career Plan →':'Continue →'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return <View style={{marginBottom:spacing.lg}}><Text style={s.label}>{label}</Text>{children}</View>;
}
function Chip({ label, active, onPress, flex }: { label:string; active:boolean; onPress:()=>void; flex?:boolean }) {
  return (
    <TouchableOpacity style={[s.chip, active&&s.chipOn, flex&&{flex:1}]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[s.chipT, active&&s.chipTOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:colors.gray50 },
  progWrap:   { backgroundColor:colors.white, paddingHorizontal:spacing.lg, paddingTop:spacing.md, paddingBottom:spacing.sm, borderBottomWidth:0.5, borderBottomColor:colors.gray200 },
  progTrack:  { height:4, backgroundColor:colors.gray100, borderRadius:radius.full, overflow:'hidden', marginBottom:spacing.sm },
  progFill:   { height:'100%', backgroundColor:colors.brand600, borderRadius:radius.full },
  stepRow:    { flexDirection:'row', justifyContent:'space-between' },
  stepCount:  { fontSize:font.sizes.xs, color:colors.gray400 },
  dots:       { fontSize:font.sizes.xs, color:colors.brand400, letterSpacing:2 },
  scroll:     { padding:spacing.lg, paddingBottom:spacing['3xl'] },
  title:      { fontSize:font.sizes.xl, fontWeight:font.weights.bold, color:colors.gray900, marginBottom:4 },
  sub:        { fontSize:font.sizes.md, color:colors.gray400, marginBottom:spacing['2xl'] },
  label:      { fontSize:font.sizes.sm, color:colors.gray600, fontWeight:font.weights.medium, marginBottom:spacing.sm },
  input:      { backgroundColor:colors.white, borderWidth:0.5, borderColor:colors.gray200, borderRadius:radius.md, paddingHorizontal:spacing.md, paddingVertical:11, fontSize:font.sizes.md, color:colors.gray900 },
  textarea:   { height:96, paddingTop:11 },
  count:      { fontSize:font.sizes.sm, color:colors.brand600, fontWeight:font.weights.medium, marginBottom:spacing.md },
  skillGrid:  { flexDirection:'row', flexWrap:'wrap', gap:spacing.sm },
  skillTag:   { paddingVertical:6, paddingHorizontal:14, borderRadius:radius.full, borderWidth:0.5, borderColor:colors.gray200, backgroundColor:colors.white },
  skillOn:    { backgroundColor:colors.brand50, borderColor:colors.brand400 },
  skillText:  { fontSize:font.sizes.sm, color:colors.gray600 },
  skillTextOn:{ color:colors.brand800, fontWeight:font.weights.medium },
  valueRow:   { flexDirection:'row', alignItems:'center', backgroundColor:colors.white, borderRadius:radius.md, borderWidth:0.5, borderColor:colors.gray200, padding:spacing.md, marginBottom:spacing.sm, gap:spacing.sm },
  rankBadge:  { width:24, height:24, borderRadius:radius.full, backgroundColor:colors.brand50, alignItems:'center', justifyContent:'center' },
  rankNum:    { fontSize:font.sizes.xs, color:colors.brand600, fontWeight:font.weights.bold },
  valueLabel: { flex:1, fontSize:font.sizes.md, color:colors.gray900 },
  arrow:      { width:28, height:28, backgroundColor:colors.gray100, borderRadius:radius.sm, alignItems:'center', justifyContent:'center' },
  arrowT:     { fontSize:14, color:colors.gray600 },
  chip:       { paddingVertical:9, paddingHorizontal:spacing.md, borderWidth:0.5, borderColor:colors.gray200, borderRadius:radius.md, backgroundColor:colors.white, marginBottom:spacing.sm },
  chipOn:     { backgroundColor:colors.brand50, borderColor:colors.brand400 },
  chipT:      { fontSize:font.sizes.md, color:colors.gray600 },
  chipTOn:    { color:colors.brand800, fontWeight:font.weights.medium },
  nav:        { flexDirection:'row', gap:spacing.sm, padding:spacing.lg, borderTopWidth:0.5, borderTopColor:colors.gray200, backgroundColor:colors.white },
  btnBack:    { flex:1, backgroundColor:colors.gray100, paddingVertical:13, borderRadius:radius.md, alignItems:'center', borderWidth:0.5, borderColor:colors.gray200 },
  btnBackT:   { color:colors.gray800, fontSize:font.sizes.base, fontWeight:font.weights.medium },
  btnNext:    { flex:1, backgroundColor:colors.brand600, paddingVertical:13, borderRadius:radius.md, alignItems:'center' },
  btnNextT:   { color:colors.white, fontSize:font.sizes.base, fontWeight:font.weights.semibold },
});
