// api/pipeline.ts — All AI agent functions
import { callClaude, parseJSON } from './claude';
import { UserProfile, EnrichedProfile, CareerMatch, Roadmap, JobMatch } from '../../src/types';

const DB = [
  { id:'swe',    title:'Software Engineer',    category:'Technology', salaryMin:95,  salaryMax:180 },
  { id:'ds',     title:'Data Scientist',        category:'Technology', salaryMin:100, salaryMax:175 },
  { id:'pm',     title:'Product Manager',       category:'Business',   salaryMin:110, salaryMax:190 },
  { id:'ux',     title:'UX Designer',           category:'Design',     salaryMin:80,  salaryMax:145 },
  { id:'de',     title:'Data Engineer',         category:'Technology', salaryMin:105, salaryMax:170 },
  { id:'ml',     title:'ML Engineer',           category:'Technology', salaryMin:130, salaryMax:220 },
  { id:'ba',     title:'Business Analyst',      category:'Business',   salaryMin:75,  salaryMax:130 },
  { id:'devops', title:'DevOps Engineer',       category:'Technology', salaryMin:100, salaryMax:175 },
  { id:'cw',     title:'Content Strategist',    category:'Marketing',  salaryMin:65,  salaryMax:120 },
  { id:'fa',     title:'Financial Analyst',     category:'Finance',    salaryMin:80,  salaryMax:150 },
];

export async function agentProfileAnalyzer(p: UserProfile): Promise<EnrichedProfile> {
  const raw = await callClaude(
    'You are a career psychologist. Return ONLY valid JSON, no markdown. Schema: {"careerDNA":{"strengths":["..."],"weaknesses":["..."],"motivators":["..."]},"workStyle":"...","inferredTraits":["..."],"candidateArchetypes":["..."]}',
    [{ role:'user', content:`Name:${p.name} Age:${p.age} Location:${p.location} Education:${p.education} Role:${p.currentRole} Exp:${p.yearsExp} Skills:[${p.skills.join(',')}] Values:[${p.values.slice(0,4).join(',')}] Goals:${p.goals}` }],
    800
  );
  return parseJSON<EnrichedProfile>(raw);
}

export async function agentCareerMatcher(p: UserProfile, ep: EnrichedProfile): Promise<CareerMatch[]> {
  const raw = await callClaude(
    'You are a career matching specialist. Return ONLY a JSON array, no markdown. Each item: {"careerId":"swe|ds|pm|ux|de|ml|ba|devops|cw|fa","fitScore":0-100,"skillFit":0-100,"interestFit":0-100,"marketScore":0-100,"growthScore":0-100,"reasoning":"2 sentences","keyStrengths":["..."],"keyGaps":["..."]}',
    [{ role:'user', content:`Skills:[${p.skills.join(',')}] Values:[${p.values.slice(0,4).join(',')}] Exp:${p.yearsExp} Education:${p.education} Goals:${p.goals} DNA:${JSON.stringify(ep.careerDNA)} Available careers: Software Engineer(swe),Data Scientist(ds),Product Manager(pm),UX Designer(ux),Data Engineer(de),ML Engineer(ml),Business Analyst(ba),DevOps Engineer(devops),Content Strategist(cw),Financial Analyst(fa). Return 4-5 best matches as JSON array only.` }],
    1200
  );
  const matches = parseJSON<CareerMatch[]>(raw);
  return matches
    .map(m => ({ ...m, ...(DB.find(c => c.id === m.careerId) ?? DB[0]) }))
    .sort((a, b) => b.fitScore - a.fitScore);
}

export async function agentRoadmapBuilder(p: UserProfile, top: CareerMatch): Promise<Roadmap> {
  const raw = await callClaude(
    'You are a curriculum designer. Return ONLY a JSON object, no markdown. Schema: {"totalMonths":number,"weeklyHours":number,"phases":[{"title":"...","durationWeeks":number,"skills":["..."],"resources":["specific name"],"milestone":"..."}],"ninetyDayPlan":["Week 1-2: ...","Week 3-4: ...","Week 5-8: ...","Week 9-12: ..."]} Include 3-4 phases.',
    [{ role:'user', content:`Target:${top.title} CurrentSkills:[${p.skills.join(',')}] KeyGaps:[${(top.keyGaps??[]).join(',')}] Exp:${p.yearsExp}` }],
    1200
  );
  return { ...parseJSON<Roadmap>(raw), targetCareer: top.title };
}

export async function agentJobMatcher(p: UserProfile, matches: CareerMatch[]): Promise<JobMatch[]> {
  const top2 = matches.slice(0,2).map(c=>c.title).join(' and ');
  const raw = await callClaude(
    'You are a recruitment specialist. Return ONLY a JSON array, no markdown. Each: {"title":"...","company":"real company","location":"city or Remote","salaryRange":"$Xk-$Yk","matchScore":0-100,"readinessLevel":"Ready now|Stretch|Future goal","matchReasons":["..."],"skills":["..."]}',
    [{ role:'user', content:`Targets:${top2} Skills:[${p.skills.join(',')}] WorkPref:${p.workType} SalaryFloor:$${p.salaryFloor||'70000'}. Return 5 realistic job listings as JSON array only.` }],
    1000
  );
  return parseJSON<JobMatch[]>(raw);
}
