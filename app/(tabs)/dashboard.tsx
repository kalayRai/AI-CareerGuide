// app/(tabs)/dashboard.tsx — Agent pipeline + Career Match cards
import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { useCareerStore } from '../../../src/store/careerStore';
import { agentProfileAnalyzer, agentCareerMatcher, agentRoadmapBuilder, agentJobMatcher } from '../../api/pipeline';
import { colors, spacing, radius, font, shadows } from '../../../src/theme';
import { CareerMatch, AgentStatus } from '../../../src/types';

const STATUS_COLOR: Record<AgentStatus,string> = {
  waiting: colors.gray200, running: colors.brand400, done: colors.success600, error: colors.danger600,
};
const FALLBACK_EP = {
  careerDNA:{ strengths:['Analytical','Motivated'], weaknesses:['Needs specialization'], motivators:['Learning','Impact'] },
  workStyle:'Collaborative', inferredTraits:['Detail-oriented'], candidateArchetypes:['The Builder'],
};

export default function DashboardScreen() {
  const {
    profile, enrichedProfile, careerMatches, pipelineRunning, pipelineComplete,
    agentStates, setEnrichedProfile, setCareerMatches, setRoadmap, setJobs,
    setPipelineRunning, setPipelineComplete, setAgentStatus,
  } = useCareerStore();

  useEffect(() => {
    if (!pipelineComplete && !pipelineRunning && profile.name) runPipeline();
  }, []);

  const sleep = (ms:number) => new Promise(r=>setTimeout(r,ms));

  const runPipeline = async () => {
    setPipelineRunning(true);

    setAgentStatus('ProfileAnalyzerAgent','running');
    let ep = FALLBACK_EP as any;
    try { ep = await agentProfileAnalyzer(profile); setEnrichedProfile(ep); }
    catch { setEnrichedProfile(FALLBACK_EP as any); }
    setAgentStatus('ProfileAnalyzerAgent','done');
    await sleep(150);

    setAgentStatus('CareerMatcherAgent','running');
    let matches: CareerMatch[] = [];
    try { matches = await agentCareerMatcher(profile, ep); setCareerMatches(matches); }
    catch {}
    setAgentStatus('CareerMatcherAgent','done');
    await sleep(150);

    setAgentStatus('MarketIntelAgent','running');
    await sleep(700);
    setAgentStatus('MarketIntelAgent','done');
    await sleep(100);

    setAgentStatus('SkillGapAgent','running');
    await sleep(500);
    setAgentStatus('SkillGapAgent','done');
    await sleep(100);

    setAgentStatus('RoadmapBuilderAgent','running');
    if (matches.length) { try { setRoadmap(await agentRoadmapBuilder(profile, matches[0])); } catch {} }
    setAgentStatus('RoadmapBuilderAgent','done');
    await sleep(150);

    setAgentStatus('JobMatcherAgent','running');
    if (matches.length) { try { setJobs(await agentJobMatcher(profile, matches)); } catch {} }
    setAgentStatus('JobMatcherAgent','done');

    setPipelineRunning(false);
    setPipelineComplete(true);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={s.greeting}>
          <Text style={s.hi}>{profile.name ? `Hi, ${profile.name}! 👋` : 'Welcome!'}</Text>
          <Text style={s.hiSub}>{pipelineComplete ? 'Your AI career recommendations are ready' : 'AI agents are analyzing your profile…'}</Text>
        </View>

        {/* Agent pipeline card */}
        {!pipelineComplete && (
          <View style={s.card}>
            <Text style={s.cardTitle}>AI Agents Working</Text>
            {agentStates.map((a: { name: string; status: string; label: string }) => (
              <View key={a.name} style={s.agentRow}>
                <View style={[s.dot,{backgroundColor: STATUS_COLOR[a.status as AgentStatus]}]}>
                  {a.status==='running' && <ActivityIndicator size="small" color={colors.white}/>}
                  {a.status==='done'    && <Text style={s.dotT}>✓</Text>}
                  {a.status==='waiting' && <Text style={s.dotT}>·</Text>}
                </View>
                <View style={{flex:1}}>
                  <Text style={s.agentName}>{a.name}</Text>
                  <Text style={s.agentSub}>
                    {a.status==='waiting'?'Queued':a.status==='running'?a.label:a.status==='done'?'Complete':'Error'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Career DNA */}
        {pipelineComplete && enrichedProfile && (
          <View style={s.dnaCard}>
            <Text style={s.dnaLbl}>Your Career DNA</Text>
            <Text style={s.dnaT}>
              {[...(enrichedProfile.careerDNA.strengths??[]).slice(0,2), ...(enrichedProfile.careerDNA.motivators??[]).slice(0,2)].join('  ·  ')}
            </Text>
          </View>
        )}

        {/* Career match cards */}
        {careerMatches.length>0 && <>
          <Text style={s.sectionTitle}>Career Matches</Text>
          {careerMatches.slice(0,4).map((m: CareerMatch, i: number) => <CareerCard key={m.careerId} m={m} top={i===0}/>)}
        </>}

        {pipelineComplete && careerMatches.length===0 && (
          <View style={s.empty}><Text style={s.emptyIcon}>🔍</Text><Text style={s.emptyT}>No matches. Check your profile skills.</Text></View>
        )}

        {!profile.name && !pipelineRunning && (
          <View style={s.empty}><Text style={s.emptyIcon}>✦</Text><Text style={s.emptyT}>Complete the Onboarding tab first to get your recommendations.</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CareerCard({ m, top }: { m: CareerMatch; top: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(()=>{ Animated.timing(anim,{toValue:1,duration:900,delay:200,useNativeDriver:false}).start(); },[]);
  const bars = [['Overall Fit',m.fitScore],['Skill Match',m.skillFit],['Interest',m.interestFit]] as const;
  return (
    <View style={[s.careerCard, top&&s.careerTop]}>
      {top&&<View style={s.badge}><Text style={s.badgeT}>🏆 Top Match</Text></View>}
      <Text style={s.cTitle}>{m.title}</Text>
      <Text style={s.cCat}>{m.category}</Text>
      {bars.map(([l,v])=>(
        <View key={l} style={s.barWrap}>
          <View style={s.barMeta}><Text style={s.barL}>{l}</Text><Text style={s.barV}>{v}%</Text></View>
          <View style={s.track}><Animated.View style={[s.fill,{width:anim.interpolate({inputRange:[0,1],outputRange:['0%',`${v}%`]})}]}/></View>
        </View>
      ))}
      <Text style={s.salary}>Salary: <Text style={{color:colors.gray900,fontWeight:'600'}}>${m.salaryMin}k–${m.salaryMax}k</Text></Text>
      {m.reasoning?<Text style={s.reason} numberOfLines={2}>{m.reasoning}</Text>:null}
    </View>
  );
}

const s = StyleSheet.create({
  safe:   {flex:1,backgroundColor:colors.gray50},
  scroll: {flex:1},
  content:{padding:spacing.lg,paddingBottom:spacing['4xl']},
  greeting:{marginBottom:spacing['2xl']},
  hi:     {fontSize:font.sizes['2xl'],fontWeight:font.weights.bold,color:colors.gray900,marginBottom:4},
  hiSub:  {fontSize:font.sizes.md,color:colors.gray400},
  card:   {backgroundColor:colors.white,borderRadius:radius.lg,borderWidth:0.5,borderColor:colors.gray200,padding:spacing.lg,marginBottom:spacing.lg,...shadows.sm},
  cardTitle:{fontSize:font.sizes.lg,fontWeight:font.weights.semibold,color:colors.gray900,marginBottom:spacing.md},
  agentRow:{flexDirection:'row',alignItems:'center',gap:spacing.md,paddingVertical:8,borderBottomWidth:0.5,borderBottomColor:colors.gray100},
  dot:    {width:28,height:28,borderRadius:radius.full,alignItems:'center',justifyContent:'center'},
  dotT:   {color:colors.white,fontSize:13,fontWeight:'700'},
  agentName:{fontSize:font.sizes.sm,fontWeight:font.weights.medium,color:colors.gray900},
  agentSub: {fontSize:font.sizes.xs,color:colors.gray400,marginTop:1},
  dnaCard:{backgroundColor:colors.brand50,borderRadius:radius.lg,padding:spacing.lg,marginBottom:spacing.lg,borderWidth:0.5,borderColor:colors.brand200},
  dnaLbl: {fontSize:font.sizes.xs,fontWeight:font.weights.bold,color:colors.brand800,marginBottom:6,textTransform:'uppercase',letterSpacing:0.8},
  dnaT:   {fontSize:font.sizes.sm,color:colors.brand600,lineHeight:20},
  sectionTitle:{fontSize:font.sizes.lg,fontWeight:font.weights.semibold,color:colors.gray900,marginBottom:spacing.md},
  careerCard:{backgroundColor:colors.white,borderRadius:radius.lg,borderWidth:0.5,borderColor:colors.gray200,padding:spacing.lg,marginBottom:spacing.md,...shadows.sm},
  careerTop: {borderColor:colors.brand400,borderWidth:1.5},
  badge:  {backgroundColor:colors.brand50,alignSelf:'flex-start',paddingVertical:3,paddingHorizontal:10,borderRadius:radius.full,marginBottom:spacing.sm},
  badgeT: {fontSize:font.sizes.xs,color:colors.brand800,fontWeight:font.weights.semibold},
  cTitle: {fontSize:font.sizes.lg,fontWeight:font.weights.semibold,color:colors.gray900,marginBottom:3},
  cCat:   {fontSize:font.sizes.sm,color:colors.gray400,marginBottom:spacing.md},
  barWrap:{marginBottom:spacing.sm},
  barMeta:{flexDirection:'row',justifyContent:'space-between',marginBottom:4},
  barL:   {fontSize:font.sizes.xs,color:colors.gray400},
  barV:   {fontSize:font.sizes.xs,color:colors.brand600,fontWeight:font.weights.medium},
  track:  {height:4,backgroundColor:colors.gray100,borderRadius:radius.full,overflow:'hidden'},
  fill:   {height:'100%',backgroundColor:colors.brand400,borderRadius:radius.full},
  salary: {fontSize:font.sizes.sm,color:colors.gray400,marginTop:spacing.sm},
  reason: {fontSize:font.sizes.sm,color:colors.gray400,marginTop:6,lineHeight:18},
  empty:  {alignItems:'center',paddingVertical:spacing['4xl']},
  emptyIcon:{fontSize:36,marginBottom:spacing.md},
  emptyT: {fontSize:font.sizes.md,color:colors.gray400,textAlign:'center',lineHeight:22},
});
