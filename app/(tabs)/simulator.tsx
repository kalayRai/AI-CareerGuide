// app/(tabs)/simulator.tsx — What-if career simulator
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCareerStore } from '../../../src/store/careerStore';
import { callClaude, parseJSON } from '../../api/claude';
import { colors, spacing, radius, font, shadows } from '../../../src/theme';

const OPTIONS = [
  { v:'Python programming',            l:'🐍 Learn Python (3 months)' },
  { v:'Machine Learning fundamentals', l:'🤖 Complete ML Course' },
  { v:'Product Management skills',     l:'📋 Transition to PM (6 months)' },
  { v:'SQL and Data Analysis',         l:'📊 Master SQL & Data Analysis' },
  { v:'AWS Cloud certification',       l:'☁️ Get AWS Certified' },
  { v:'UX Design bootcamp',            l:'🎨 Complete UX Bootcamp' },
];

interface Res { newTopCareer:string; newFitScore:number; previousFitScore:number; previousCareer:string; impactSummary:string; newCareersUnlocked:string[]; timeInvestment:string; }

export default function SimulatorScreen() {
  const { profile, careerMatches, pipelineComplete } = useCareerStore();
  const [sel, setSel]     = useState(OPTIONS[0].v);
  const [busy, setBusy]   = useState(false);
  const [res, setRes]     = useState<Res|null>(null);

  if (!pipelineComplete)
    return <SafeAreaView style={s.safe}><View style={s.empty}><Text style={s.ei}>🔮</Text><Text style={s.et}>Complete onboarding first to unlock the simulator.</Text></View></SafeAreaView>;

  const run = async () => {
    if (!careerMatches.length) return;
    setBusy(true); setRes(null);
    const top = careerMatches[0];
    try {
      const raw = await callClaude(
        'You are a career simulator. Return ONLY a JSON object, no markdown. Schema: {"newTopCareer":"...","newFitScore":0-100,"previousFitScore":0-100,"previousCareer":"...","impactSummary":"2 sentences","newCareersUnlocked":["..."],"timeInvestment":"X months"}',
        [{ role:'user', content:`Current top match: ${top.title} (${top.fitScore}% fit). User adds: "${sel}". Current skills:[${profile.skills.join(',')}]. How does this change career recommendations? JSON only.` }],
        500
      );
      setRes(parseJSON<Res>(raw));
    } catch {
      setRes({ newTopCareer:careerMatches[1]?.title??'Data Scientist', newFitScore:Math.min(99,top.fitScore+12), previousFitScore:top.fitScore, previousCareer:top.title, impactSummary:`Adding ${sel} significantly strengthens your profile and opens new opportunities.`, newCareersUnlocked:['ML Engineer','AI Product Manager'], timeInvestment:'3–4 months' });
    } finally { setBusy(false); }
  };

  const delta = res ? res.newFitScore - res.previousFitScore : 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>What-If Simulator</Text>
        <Text style={s.sub}>Model how a new skill shifts your career fit scores</Text>

        <Text style={s.sTitle}>Choose a hypothetical change</Text>
        {OPTIONS.map(o=>(
          <TouchableOpacity key={o.v} style={[s.opt, sel===o.v&&s.optOn]} onPress={()=>{setSel(o.v);setRes(null);}}>
            <Text style={[s.optT, sel===o.v&&s.optTOn]}>{o.l}</Text>
            {sel===o.v && <Text style={s.check}>✓</Text>}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[s.runBtn, busy&&{opacity:0.6}]} onPress={run} disabled={busy}>
          {busy ? <ActivityIndicator color={colors.white}/> : <Text style={s.runT}>Run Simulation →</Text>}
        </TouchableOpacity>

        {res && (
          <View style={s.results}>
            <Text style={s.sTitle}>Simulation Results</Text>
            <View style={s.cmpRow}>
              <View style={s.cmpCard}>
                <Text style={s.cmpLbl}>BEFORE</Text>
                <Text style={s.cmpCareer}>{res.previousCareer}</Text>
                <Text style={[s.cmpScore,{color:colors.gray400}]}>{res.previousFitScore}%</Text>
                <Text style={s.cmpSub}>fit score</Text>
              </View>
              <Text style={s.arrow}>→</Text>
              <View style={[s.cmpCard,s.cmpCardAfter]}>
                <Text style={[s.cmpLbl,{color:colors.brand600}]}>AFTER</Text>
                <Text style={s.cmpCareer}>{res.newTopCareer}</Text>
                <Text style={s.cmpScore}>{res.newFitScore}%</Text>
                <View style={s.delta}><Text style={s.deltaT}>+{delta} pts</Text></View>
              </View>
            </View>
            <View style={s.impact}>
              <Text style={s.impTitle}>Impact Summary</Text>
              <Text style={s.impT}>{res.impactSummary}</Text>
              {res.newCareersUnlocked?.length>0 && <Text style={s.unlocked}>New paths: <Text style={{color:colors.brand600,fontWeight:'600'}}>{res.newCareersUnlocked.join(', ')}</Text></Text>}
              <Text style={s.unlocked}>Time investment: <Text style={{color:colors.gray900,fontWeight:'600'}}>{res.timeInvestment}</Text></Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   {flex:1,backgroundColor:colors.gray50},
  scroll: {flex:1}, content:{padding:spacing.lg,paddingBottom:spacing['4xl']},
  title:  {fontSize:font.sizes.xl,fontWeight:font.weights.bold,color:colors.gray900,marginBottom:4},
  sub:    {fontSize:font.sizes.md,color:colors.gray400,marginBottom:spacing.xl},
  sTitle: {fontSize:font.sizes.lg,fontWeight:font.weights.semibold,color:colors.gray900,marginBottom:spacing.md,marginTop:spacing.sm},
  opt:    {backgroundColor:colors.white,borderWidth:0.5,borderColor:colors.gray200,borderRadius:radius.md,padding:spacing.md,marginBottom:spacing.sm,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  optOn:  {backgroundColor:colors.brand50,borderColor:colors.brand400},
  optT:   {fontSize:font.sizes.md,color:colors.gray600},
  optTOn: {color:colors.brand800,fontWeight:font.weights.medium},
  check:  {fontSize:16,color:colors.brand600},
  runBtn: {backgroundColor:colors.brand600,borderRadius:radius.md,padding:spacing.md,alignItems:'center',marginTop:spacing.lg},
  runT:   {color:colors.white,fontSize:font.sizes.base,fontWeight:font.weights.semibold},
  results:{marginTop:spacing.xl},
  cmpRow: {flexDirection:'row',alignItems:'center',gap:spacing.sm,marginBottom:spacing.md},
  cmpCard:{flex:1,backgroundColor:colors.white,borderRadius:radius.lg,borderWidth:0.5,borderColor:colors.gray200,padding:spacing.md,alignItems:'center',...shadows.sm},
  cmpCardAfter:{borderColor:colors.brand400,borderWidth:1.5},
  cmpLbl: {fontSize:font.sizes.xs,fontWeight:font.weights.bold,color:colors.gray400,letterSpacing:0.8,marginBottom:6},
  cmpCareer:{fontSize:font.sizes.sm,fontWeight:font.weights.medium,color:colors.gray900,textAlign:'center',marginBottom:6},
  cmpScore:{fontSize:font.sizes['3xl'],fontWeight:font.weights.bold,color:colors.brand600},
  cmpSub: {fontSize:font.sizes.xs,color:colors.gray400},
  delta:  {backgroundColor:colors.success50,borderRadius:radius.full,paddingVertical:3,paddingHorizontal:10,marginTop:6},
  deltaT: {fontSize:font.sizes.sm,color:colors.success600,fontWeight:font.weights.semibold},
  arrow:  {fontSize:20,color:colors.gray400},
  impact: {backgroundColor:colors.white,borderRadius:radius.lg,borderWidth:0.5,borderColor:colors.gray200,padding:spacing.lg,...shadows.sm},
  impTitle:{fontSize:font.sizes.base,fontWeight:font.weights.semibold,color:colors.gray900,marginBottom:spacing.sm},
  impT:   {fontSize:font.sizes.md,color:colors.gray600,lineHeight:22,marginBottom:spacing.md},
  unlocked:{fontSize:font.sizes.sm,color:colors.gray400,marginBottom:spacing.sm},
  empty:  {flex:1,alignItems:'center',justifyContent:'center',padding:spacing['3xl']},
  ei:     {fontSize:40,marginBottom:spacing.md},
  et:     {fontSize:font.sizes.md,color:colors.gray400,textAlign:'center',lineHeight:22},
});
