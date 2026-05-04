// app/(tabs)/coach.tsx — AI Career Coach chat
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useCareerStore } from '../../../src/store/careerStore';
import { callClaude } from '../../api/claude';
import { colors, spacing, radius, font } from '../../../src/theme';
import { ChatMessage } from '../../../src/types';

const INIT: ChatMessage = {
  id:'init', role:'assistant',
  content:"Hi! I'm your AI career coach. I have full context about your profile and recommendations. What would you like to explore today?",
};

const QUICK = [
  'What career should I focus on?','How do I close my skill gaps?',
  'What salary should I target?','How long will my transition take?',
];

export default function CoachScreen() {
  const { profile, careerMatches, chatHistory, addMessage } = useCareerStore();
  const [input, setInput] = useState('');
  const [busy, setBusy]   = useState(false);
  const ref = useRef<FlatList>(null);

  const msgs: ChatMessage[] = [INIT, ...chatHistory];

  const ctx = () => {
    const top = careerMatches[0];
    return [
      profile.name       ? `User: ${profile.name}` : '',
      profile.currentRole? `Role: ${profile.currentRole}` : '',
      profile.skills.length ? `Skills: ${profile.skills.join(', ')}` : '',
      top                ? `Top match: ${top.title} (${top.fitScore}% fit)` : '',
      top?.keyGaps?.length ? `Key gaps: ${top.keyGaps.join(', ')}` : '',
      profile.goals      ? `Goals: ${profile.goals}` : '',
    ].filter(Boolean).join('\n');
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput('');
    const um: ChatMessage = { id: Date.now().toString(), role:'user', content:msg };
    addMessage(um);
    setBusy(true);
    try {
      const history = [...chatHistory, um].slice(-14).map(({role,content})=>({role,content}));
      const reply = await callClaude(
        `You are an expert career coach with 20 years of experience. ${ctx()}\nBe warm, direct, and specific. Keep responses to 2–4 sentences.`,
        history, 500
      );
      addMessage({ id:(Date.now()+1).toString(), role:'assistant', content:reply });
    } catch {
      addMessage({ id:(Date.now()+1).toString(), role:'assistant', content:'Network issue. Please try again.' });
    } finally { setBusy(false); }
  };

  useEffect(()=>{ setTimeout(()=>ref.current?.scrollToEnd({animated:true}),100); },[chatHistory,busy]);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'} keyboardVerticalOffset={Platform.OS==='ios'?88:0}>
        <FlatList
          ref={ref}
          data={msgs}
          keyExtractor={m=>m.id}
          contentContainerStyle={s.list}
          onContentSizeChange={()=>ref.current?.scrollToEnd({animated:true})}
          renderItem={({item:m})=>(
            <View style={[s.bubble, m.role==='user'?s.bubbleU:s.bubbleA]}>
              <Text style={[s.bubbleT, m.role==='user'?s.bubbleTU:s.bubbleTA]}>{m.content}</Text>
            </View>
          )}
          ListFooterComponent={busy?(
            <View style={s.typing}><ActivityIndicator size="small" color={colors.brand400}/><Text style={s.typingT}>Coach is thinking…</Text></View>
          ):null}
        />

        {/* Quick prompts – shown only before first user message */}
        {chatHistory.length===0 && (
          <View style={s.quickRow}>
            {QUICK.map(q=>(
              <TouchableOpacity key={q} style={s.qBtn} onPress={()=>send(q)}>
                <Text style={s.qBtnT}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={s.inputRow}>
          <TextInput
            style={s.input} value={input} onChangeText={setInput}
            placeholder="Ask your coach anything…" placeholderTextColor={colors.gray400}
            multiline returnKeyType="send" blurOnSubmit
            onSubmitEditing={()=>send()}
          />
          <TouchableOpacity style={[s.send,(!input.trim()||busy)&&s.sendOff]} onPress={()=>send()} disabled={!input.trim()||busy}>
            <Text style={s.sendT}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   {flex:1,backgroundColor:colors.gray50},
  list:   {padding:spacing.lg,gap:spacing.md,paddingBottom:spacing.sm},
  bubble: {maxWidth:'82%',borderRadius:radius.lg,paddingVertical:10,paddingHorizontal:14},
  bubbleU:{alignSelf:'flex-end',backgroundColor:colors.brand600,borderBottomRightRadius:4},
  bubbleA:{alignSelf:'flex-start',backgroundColor:colors.white,borderWidth:0.5,borderColor:colors.gray200,borderBottomLeftRadius:4},
  bubbleT:{fontSize:font.sizes.md,lineHeight:22},
  bubbleTU:{color:colors.white},
  bubbleTA:{color:colors.gray900},
  typing: {flexDirection:'row',alignItems:'center',gap:spacing.sm,padding:spacing.md,alignSelf:'flex-start'},
  typingT:{fontSize:font.sizes.sm,color:colors.gray400},
  quickRow:{paddingHorizontal:spacing.lg,paddingBottom:spacing.sm,flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},
  qBtn:   {backgroundColor:colors.white,borderWidth:0.5,borderColor:colors.brand200,borderRadius:radius.full,paddingVertical:6,paddingHorizontal:14},
  qBtnT:  {fontSize:font.sizes.sm,color:colors.brand600},
  inputRow:{flexDirection:'row',alignItems:'flex-end',gap:spacing.sm,padding:spacing.md,borderTopWidth:0.5,borderTopColor:colors.gray200,backgroundColor:colors.white},
  input:  {flex:1,backgroundColor:colors.gray50,borderWidth:0.5,borderColor:colors.gray200,borderRadius:radius.lg,paddingHorizontal:spacing.md,paddingVertical:10,fontSize:font.sizes.md,color:colors.gray900,maxHeight:100},
  send:   {width:40,height:40,borderRadius:radius.full,backgroundColor:colors.brand600,alignItems:'center',justifyContent:'center'},
  sendOff:{backgroundColor:colors.gray200},
  sendT:  {color:colors.white,fontSize:18,fontWeight:'700'},
});
