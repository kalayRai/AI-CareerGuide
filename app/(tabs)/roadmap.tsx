// app/(tabs)/roadmap.tsx — Learning roadmap timeline
import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useCareerStore } from '../../../src/store/careerStore';
import { colors, spacing, radius, font, shadows } from '../../../src/theme';

type Phase = {
  title: string;
  durationWeeks: number;
  milestone?: string;
  skills?: string[];
  resources?: string[];
};

const PHASE_COLORS = [colors.brand400,'#1D9E75','#D85A30','#378ADD'];

export default function RoadmapScreen() {
  const { roadmap, pipelineComplete } = useCareerStore();
  const phases = (roadmap?.phases ?? []) as Phase[];
  const ninetyDayPlan = (roadmap?.ninetyDayPlan ?? []) as string[];

  if (!pipelineComplete)
    return <Empty icon="🗺️" title="Roadmap Pending" sub="Complete onboarding and wait for the AI pipeline to finish."/>;
  if (!roadmap)
    return <Empty icon="⚠️" title="No Roadmap" sub="The roadmap agent didn't return data. Try re-running from Dashboard."/>;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.screenTitle}>Learning Roadmap</Text>
        <Text style={s.target}>{roadmap.targetCareer}</Text>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            [String(roadmap.totalMonths),'months','Duration'],
            [String(roadmap.weeklyHours),'hrs/wk','Weekly'],
            [String(phases.length),'phases','Phases'],
          ].map(([v,u,l])=>(
            <View key={l} style={s.stat}>
              <Text style={s.statV}>{v}<Text style={s.statU}> {u}</Text></Text>
              <Text style={s.statL}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Phase timeline */}
        <Text style={s.sTitle}>Learning Phases</Text>
        <View style={s.timeline}>
          {phases.map((ph,i)=>{
            const col = PHASE_COLORS[i%PHASE_COLORS.length];
            return (
              <View key={i} style={s.phaseRow}>
                {i < phases.length - 1 && <View style={[s.connector,{backgroundColor:col+'40'}]}/>}
                <View style={[s.phaseDot,{backgroundColor:col}]}><Text style={s.phaseDotT}>{i+1}</Text></View>
                <View style={s.phaseCard}>
                  <Text style={s.phaseTitle}>Phase {i+1}: {ph.title}</Text>
                  <Text style={s.phaseDur}>{ph.durationWeeks} weeks</Text>
                  {ph.milestone && <View style={s.msPill}><Text style={s.msPillT}>🎯 {ph.milestone}</Text></View>}
                  <View style={s.tags}>
                    {(ph.skills??[]).map(sk=><View key={sk} style={s.tag}><Text style={s.tagT}>{sk}</Text></View>)}
                  </View>
                  {(ph.resources??[]).map((r,ri)=>(
                    <View key={ri} style={s.resRow}>
                      <View style={[s.resDot,{backgroundColor:col}]}/>
                      <Text style={s.resT}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* 90-day plan */}
        {ninetyDayPlan.length>0 && <>
          <Text style={s.sTitle}>90-Day Quick Start</Text>
          <View style={s.qsCard}>
            {ninetyDayPlan.map((t,i)=>(
              <View key={i} style={[s.taskRow, i<ninetyDayPlan.length-1&&s.taskBorder]}>
                <View style={s.taskNum}><Text style={s.taskNumT}>{i+1}</Text></View>
                <Text style={s.taskT}>{t}</Text>
              </View>
            ))}
          </View>
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Empty({ icon,title,sub }:{icon:string;title:string;sub:string}) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.emptyWrap}>
        <Text style={s.emptyIcon}>{icon}</Text>
        <Text style={s.emptyTitle}>{title}</Text>
        <Text style={s.emptySub}>{sub}</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:  {flex:1,backgroundColor:colors.gray50},
  scroll:{flex:1}, content:{padding:spacing.lg,paddingBottom:spacing['4xl']},
  screenTitle:{fontSize:font.sizes.xl,fontWeight:font.weights.bold,color:colors.gray900,marginBottom:4},
  target:{fontSize:font.sizes.base,color:colors.brand600,fontWeight:font.weights.medium,marginBottom:spacing.lg},
  statsRow:{flexDirection:'row',gap:spacing.sm,marginBottom:spacing.xl},
  stat:  {flex:1,backgroundColor:colors.white,borderRadius:radius.md,borderWidth:0.5,borderColor:colors.gray200,padding:spacing.md,alignItems:'center'},
  statV: {fontSize:font.sizes.xl,fontWeight:font.weights.bold,color:colors.brand600},
  statU: {fontSize:font.sizes.xs,fontWeight:font.weights.regular,color:colors.gray400},
  statL: {fontSize:font.sizes.xs,color:colors.gray400,marginTop:2,textAlign:'center'},
  sTitle:{fontSize:font.sizes.lg,fontWeight:font.weights.semibold,color:colors.gray900,marginBottom:spacing.md,marginTop:spacing.lg},
  timeline:{position:'relative'},
  phaseRow:{flexDirection:'row',marginBottom:spacing.lg,position:'relative'},
  connector:{position:'absolute',left:15,top:32,width:2,bottom:-spacing.lg,zIndex:0},
  phaseDot: {width:32,height:32,borderRadius:radius.full,alignItems:'center',justifyContent:'center',marginRight:spacing.md,zIndex:1,flexShrink:0,marginTop:2},
  phaseDotT:{color:colors.white,fontSize:font.sizes.sm,fontWeight:font.weights.bold},
  phaseCard:{flex:1,backgroundColor:colors.white,borderRadius:radius.lg,borderWidth:0.5,borderColor:colors.gray200,padding:spacing.md,...shadows.sm},
  phaseTitle:{fontSize:font.sizes.base,fontWeight:font.weights.semibold,color:colors.gray900,marginBottom:3},
  phaseDur:  {fontSize:font.sizes.xs,color:colors.gray400,marginBottom:spacing.sm},
  msPill:    {backgroundColor:colors.success50,borderRadius:radius.full,alignSelf:'flex-start',paddingVertical:3,paddingHorizontal:10,marginBottom:spacing.sm},
  msPillT:   {fontSize:font.sizes.xs,color:colors.success600,fontWeight:font.weights.medium},
  tags:      {flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:spacing.sm},
  tag:       {backgroundColor:colors.brand50,borderRadius:radius.full,paddingVertical:3,paddingHorizontal:10},
  tagT:      {fontSize:font.sizes.xs,color:colors.brand800},
  resRow:    {flexDirection:'row',alignItems:'flex-start',gap:8,marginBottom:5},
  resDot:    {width:6,height:6,borderRadius:radius.full,marginTop:5,flexShrink:0},
  resT:      {fontSize:font.sizes.sm,color:colors.gray600,flex:1,lineHeight:18},
  qsCard:    {backgroundColor:'#EAF3DE',borderRadius:radius.lg,borderWidth:0.5,borderColor:'#C0DD97',overflow:'hidden'},
  taskRow:   {flexDirection:'row',alignItems:'flex-start',gap:spacing.md,padding:spacing.md},
  taskBorder:{borderBottomWidth:0.5,borderBottomColor:'#C0DD97'},
  taskNum:   {width:22,height:22,borderRadius:radius.full,backgroundColor:colors.success600,alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1},
  taskNumT:  {color:colors.white,fontSize:font.sizes.xs,fontWeight:font.weights.bold},
  taskT:     {fontSize:font.sizes.sm,color:'#27500A',flex:1,lineHeight:20},
  emptyWrap: {flex:1,alignItems:'center',justifyContent:'center',padding:spacing['3xl']},
  emptyIcon: {fontSize:40,marginBottom:spacing.md},
  emptyTitle:{fontSize:font.sizes.lg,fontWeight:font.weights.semibold,color:colors.gray900,marginBottom:spacing.sm},
  emptySub:  {fontSize:font.sizes.md,color:colors.gray400,textAlign:'center',lineHeight:22},
});
