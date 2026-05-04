// app/(tabs)/jobs.tsx — AI-matched job board
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useCareerStore } from '../../../src/store/careerStore';
import { colors, spacing, radius, font, shadows } from '../../../src/theme';
import { JobMatch } from '../../../src/types';

type F = 'All'|'Ready now'|'Stretch'|'Future goal';
const FILTERS: F[] = ['All','Ready now','Stretch','Future goal'];
const RL: Record<string,{bg:string;fg:string}> = {
  'Ready now':  {bg:colors.success50,  fg:colors.success600},
  'Stretch':    {bg:colors.warning50,  fg:colors.warning600},
  'Future goal':{bg:colors.brand50,    fg:colors.brand600},
};

export default function JobsScreen() {
  const { jobs, pipelineComplete } = useCareerStore();
  const [filter, setFilter] = useState<F>('All');
  const data = filter==='All' ? jobs : jobs.filter((j: JobMatch) => j.readinessLevel===filter);

  if (!pipelineComplete)
    return <SafeAreaView style={s.safe}><View style={s.empty}><Text style={s.ei}>💼</Text><Text style={s.et}>Complete onboarding to see AI-matched job listings.</Text></View></SafeAreaView>;

  return (
    <SafeAreaView style={s.safe}>
      {/* Filter bar */}
      <View style={s.filterBar}>
        {FILTERS.map(f=>(
          <TouchableOpacity key={f} style={[s.pill, filter===f&&s.pillOn]} onPress={()=>setFilter(f)}>
            <Text style={[s.pillT, filter===f&&s.pillTOn]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(_,i)=>String(i)}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item})=><JobCard job={item}/>}
        ListEmptyComponent={<View style={s.empty}><Text style={s.et}>No jobs match this filter.</Text></View>}
      />
    </SafeAreaView>
  );
}

function JobCard({ job }:{ job:JobMatch }) {
  const r = RL[job.readinessLevel] ?? RL['Stretch'];
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <View style={s.logo}><Text style={s.logoT}>{job.company.slice(0,2).toUpperCase()}</Text></View>
        <View style={{flex:1}}>
          <Text style={s.jTitle}>{job.title}</Text>
          <Text style={s.jCompany}>{job.company}</Text>
        </View>
        <View style={{alignItems:'flex-end'}}>
          <Text style={s.score}>{job.matchScore}</Text>
          <Text style={s.scoreSub}>%</Text>
        </View>
      </View>
      <View style={s.meta}>
        <Text style={s.metaT}>📍 {job.location}</Text>
        <Text style={s.metaT}>💰 {job.salaryRange}</Text>
      </View>
      <View style={s.tags}>
        <View style={[s.rlTag,{backgroundColor:r.bg}]}><Text style={[s.rlTagT,{color:r.fg}]}>{job.readinessLevel}</Text></View>
        {(job.skills??[]).slice(0,3).map(sk=><View key={sk} style={s.sk}><Text style={s.skT}>{sk}</Text></View>)}
      </View>
      {(job.matchReasons??[]).length>0 && <Text style={s.reasons} numberOfLines={2}>{job.matchReasons.join('  ·  ')}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  safe:      {flex:1,backgroundColor:colors.gray50},
  filterBar: {flexDirection:'row',gap:spacing.sm,paddingHorizontal:spacing.lg,paddingVertical:spacing.md,backgroundColor:colors.white,borderBottomWidth:0.5,borderBottomColor:colors.gray200},
  pill:      {paddingVertical:5,paddingHorizontal:14,borderRadius:radius.full,backgroundColor:colors.gray100,borderWidth:0.5,borderColor:colors.gray200},
  pillOn:    {backgroundColor:colors.brand50,borderColor:colors.brand400},
  pillT:     {fontSize:font.sizes.sm,color:colors.gray600},
  pillTOn:   {color:colors.brand800,fontWeight:font.weights.medium},
  list:      {padding:spacing.lg,gap:spacing.md,paddingBottom:spacing['4xl']},
  card:      {backgroundColor:colors.white,borderRadius:radius.lg,borderWidth:0.5,borderColor:colors.gray200,padding:spacing.lg,...shadows.sm},
  cardHead:  {flexDirection:'row',alignItems:'flex-start',marginBottom:spacing.md},
  logo:      {width:40,height:40,borderRadius:radius.md,backgroundColor:colors.brand50,alignItems:'center',justifyContent:'center',marginRight:spacing.md,flexShrink:0},
  logoT:     {fontSize:font.sizes.sm,color:colors.brand600,fontWeight:font.weights.bold},
  jTitle:    {fontSize:font.sizes.base,fontWeight:font.weights.semibold,color:colors.gray900,marginBottom:2},
  jCompany:  {fontSize:font.sizes.sm,color:colors.gray400},
  score:     {fontSize:font.sizes['2xl'],fontWeight:font.weights.bold,color:colors.brand600,lineHeight:28},
  scoreSub:  {fontSize:font.sizes.xs,color:colors.gray400},
  meta:      {flexDirection:'row',gap:spacing.lg,marginBottom:spacing.md},
  metaT:     {fontSize:font.sizes.sm,color:colors.gray400},
  tags:      {flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,marginBottom:spacing.sm},
  rlTag:     {borderRadius:radius.full,paddingVertical:3,paddingHorizontal:12},
  rlTagT:    {fontSize:font.sizes.xs,fontWeight:font.weights.semibold},
  sk:        {backgroundColor:colors.gray100,borderRadius:radius.full,paddingVertical:3,paddingHorizontal:10},
  skT:       {fontSize:font.sizes.xs,color:colors.gray600},
  reasons:   {fontSize:font.sizes.sm,color:colors.gray400,lineHeight:18},
  empty:     {flex:1,alignItems:'center',justifyContent:'center',padding:spacing['3xl'],paddingTop:60},
  ei:        {fontSize:40,marginBottom:spacing.md},
  et:        {fontSize:font.sizes.md,color:colors.gray400,textAlign:'center',lineHeight:22},
});
