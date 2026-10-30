const {
  DEG_ORDER,
  DEG_LABEL,
  jobDegrees,
  jobCareerPaths,
  jobProfiles,
  jobCerts,
  jobSchools,
  schoolUrls,
  categories,
  jobPathwayNotes,
  jobCareerDevelopmentResources
} = window.TRACK_DATA;

let activeCareerAreaFilter = "all";
let activeEntryPathFilter = "all";
let currentSearchQuery = "";
let activeJobName = null;
let activeSearchMode = "job";
let activeIndexCategoryId = null;
const selectedJobs = new Set();
const COVERAGE_TIERS = [
  { id:"us", label:"U.S. Programs" },
  { id:"outside-us", label:"Programs Outside the U.S." }
];

const SOURCE_PROGRAM_TYPE_LABELS = {
  university: "College / University",
  conservatories: "Arts / Conservatory",
  research: "Graduate / Research",
  specialized: "Specialized / Technical"
};

const PROGRAM_CATEGORY_DESCRIPTIONS = {
  all: "Browse every listed school and training provider",
  us: "Programs based in the United States, including degree, conservatory, technical, online, and professional training options",
  "outside-us": "Programs based outside the United States, with language information shown when it is available"
};

const US_STATE_NAMES = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California", CO:"Colorado", CT:"Connecticut", DE:"Delaware",
  FL:"Florida", GA:"Georgia", HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa", KS:"Kansas", KY:"Kentucky",
  LA:"Louisiana", ME:"Maine", MD:"Maryland", MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi",
  MO:"Missouri", MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire", NJ:"New Jersey", NM:"New Mexico",
  NY:"New York", NC:"North Carolina", ND:"North Dakota", OH:"Ohio", OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania",
  RI:"Rhode Island", SC:"South Carolina", SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont",
  VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming", DC:"District of Columbia"
};
const US_STATE_NAME_LOOKUP = Object.fromEntries(Object.entries(US_STATE_NAMES).map(([abbr,name])=>[name.toLowerCase(), abbr]));

function normalizeSearchText(value){
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

const JOB_SEARCH_ALIASES = {
  "Audio editor": [
    "daw editor",
    "daw operator",
    "daw specialist",
    "pro tools editor",
    "pro tools operator",
    "pro tools engineer",
    "pro tools specialist",
    "digital audio workstation editor",
    "digital audio workstation operator",
    "session editor",
    "audio cleanup editor",
    "dialogue editor",
    "sound effects editor",
    "post audio editor"
  ],
  "Audiobook producer": [
    "audio book producer",
    "audiobook production",
    "audio book production"
  ],
  "Audio Preservationist": [
    "archival and analog audio specialist",
    "analog audio specialist",
    "audio preservation specialist",
    "audio digitization specialist",
    "tape transfer specialist"
  ],
  "Studio maintenance engineer / technician": [
    "studio maintenance tech",
    "studio maintenance technician",
    "studio maintenance engineer",
    "studio tech",
    "studio technician",
    "maintenance engineer"
  ],
  "Tour manager": [
    "road manager",
    "tour road manager"
  ],
  "RF Technician / Wireless Systems Technician": [
    "rf technician",
    "wireless technician",
    "wireless systems technician",
    "rf coordinator",
    "wireless coordinator"
  ],
  "Entertainment Rigger": [
    "rigger",
    "concert rigger",
    "arena rigger",
    "theatre rigger",
    "theater rigger",
    "stage rigger",
    "high rigger",
    "ground rigger"
  ],
  "Road Case Builder / Case Fabricator": [
    "road case builder",
    "case builder",
    "road case fabricator",
    "case fabricator",
    "custom case builder"
  ],
  "Event Security Coordinator": [
    "security coordinator",
    "event security",
    "venue security coordinator",
    "festival security coordinator",
    "security manager"
  ],
  "Scenic Carpenter / Set Builder": [
    "set builder",
    "scenic carpenter",
    "stage carpenter",
    "theatre carpenter",
    "theater carpenter"
  ],
  "Show Caller / Live Event Stage Manager": [
    "show caller",
    "live event stage manager",
    "producer show caller",
    "deputy stage manager",
    "production stage manager"
  ],
  "Classical String Player": [
    "orchestral strings",
    "orchestral string player",
    "violinist",
    "violist",
    "cellist",
    "double bassist",
    "classical bassist",
    "chamber musician",
    "string quartet",
    "classical soloist",
    "orchestra musician",
    "symphony musician"
  ],
  "Classical Woodwind Player": [
    "orchestral woodwinds",
    "orchestral woodwind player",
    "flutist",
    "oboist",
    "clarinetist",
    "bassoonist",
    "contrabassoonist",
    "chamber musician",
    "woodwind quintet",
    "orchestra musician",
    "symphony musician"
  ],
  "Classical Brass Player": [
    "orchestral brass",
    "orchestral brass player",
    "trumpet player",
    "horn player",
    "french horn",
    "trombonist",
    "tuba player",
    "euphonium player",
    "chamber musician",
    "brass quintet",
    "orchestra musician",
    "symphony musician"
  ],
  "Classical Percussionist / Timpanist": [
    "orchestral percussionist",
    "orchestral percussion",
    "timpanist",
    "timpani player",
    "classical percussionist",
    "percussionist",
    "chamber musician",
    "orchestra musician",
    "symphony musician"
  ],
  "Classical Harpist": [
    "harp orchestral",
    "orchestral harp",
    "orchestral harpist",
    "harpist",
    "classical harp",
    "chamber musician",
    "orchestra musician",
    "symphony musician"
  ],
  "Classical Saxophonist": [
    "classical saxophone",
    "classical saxophone player",
    "saxophonist",
    "saxophone quartet",
    "chamber musician",
    "new music saxophone"
  ],
  "Classical Vocalist": [
    "classical vocalist concert",
    "classical singer",
    "concert vocalist",
    "oratorio singer",
    "art song singer",
    "lieder singer",
    "classical soloist"
  ],
  "Classical Guitarist": [
    "classical guitarist concert",
    "concert classical guitarist",
    "guitar soloist",
    "classical soloist",
    "chamber musician"
  ],
  "Classical Pianist": [
    "concert pianist",
    "piano soloist",
    "collaborative pianist",
    "chamber musician",
    "classical soloist"
  ],
  "Bassist": [
    "bass player",
    "electric bassist",
    "upright bassist",
    "session bassist",
    "touring bassist",
    "pit bassist",
    "multi-instrumentalist bassist",
    "sideperson bassist"
  ],
  "Drummer / Percussionist": [
    "drummer",
    "percussionist",
    "session drummer",
    "touring drummer",
    "pit drummer",
    "drum set player",
    "auxiliary percussionist",
    "multi-instrumentalist drummer",
    "sideperson drummer"
  ],
  "Guitarist (Rock/Pop/Country)": [
    "guitarist",
    "guitar player",
    "electric guitarist",
    "acoustic guitarist",
    "session guitarist",
    "touring guitarist",
    "pit guitarist",
    "multi-instrumentalist guitarist",
    "sideperson guitarist"
  ],
  "Horn Player (Brass)": [
    "contemporary brass player",
    "horn player",
    "brass player",
    "trumpet player",
    "trombone player",
    "french horn player",
    "session horn player",
    "touring horn player",
    "brass section",
    "multi-instrumentalist brass"
  ],
  "Keyboardist / Pianist (Contemporary)": [
    "keyboardist",
    "contemporary pianist",
    "session keyboardist",
    "touring keyboardist",
    "synth player",
    "organ player",
    "mainstage keyboardist",
    "pit keyboardist",
    "multi-instrumentalist keyboardist",
    "sideperson keyboardist"
  ],
  "String Player (Contemporary)": [
    "contemporary string player",
    "electric violinist",
    "electric violist",
    "electric cellist",
    "session string player",
    "touring string player",
    "crossover string player",
    "pit string player",
    "multi-instrumentalist strings"
  ],
  "Vocalist (Contemporary)": [
    "contemporary vocalist",
    "singer",
    "lead singer",
    "background vocalist",
    "bgv",
    "session singer",
    "touring vocalist",
    "pop vocalist",
    "r&b vocalist",
    "country vocalist"
  ],
  "Woodwind Player": [
    "contemporary woodwind player",
    "saxophonist",
    "flutist",
    "clarinetist",
    "ewi player",
    "session woodwind player",
    "touring woodwind player",
    "pit woodwind player",
    "woodwind doubler",
    "multi-instrumentalist woodwinds"
  ],
  "Artist Liaison / Talent Wrangler": [
    "artist liaison",
    "artist relations",
    "artist relations assistant",
    "artist relations coordinator",
    "talent wrangler",
    "artist wrangler",
    "talent escort",
    "artist escort",
    "festival artist liaison",
    "artist hospitality",
    "backstage hospitality",
    "green room assistant"
  ],
  "Live Event AV Technician / AV Show Technician": [
    "av technician",
    "a/v technician",
    "a v technician",
    "av tech",
    "a/v tech",
    "show technician",
    "show tech",
    "live event av",
    "event av technician",
    "av field tech",
    "festival av tech",
    "venue av tech",
    "touring av technician",
    "corporate av technician",
    "audio visual technician",
    "audio visual tech"
  ],
  "Media Server Operator / Video Playback Operator": [
    "media server operator",
    "media server tech",
    "media server technician",
    "video playback",
    "video playback operator",
    "playback operator",
    "playback tech",
    "disguise operator",
    "disguise programmer",
    "resolume operator",
    "resolume tech",
    "watchout operator",
    "qlab operator",
    "notch operator",
    "touchdesigner operator"
  ],
  "Music Agency Assistant / Entertainment Assistant": [
    "agency assistant",
    "music agency assistant",
    "entertainment assistant",
    "agent assistant",
    "booking assistant",
    "assistant to agent",
    "assistant to music agent",
    "music assistant",
    "artist manager assistant",
    "management assistant",
    "label assistant",
    "mailroom",
    "agent trainee",
    "coordinator assistant"
  ],
  "Wardrobe Technician / Dresser": [
    "wardrobe technician",
    "wardrobe tech",
    "dresser",
    "tour dresser",
    "costume technician",
    "costume tech",
    "wardrobe assistant",
    "local stitcher",
    "stitcher",
    "tailor",
    "quick change dresser"
  ],
  "FOH Audio Engineer / Sound Engineer": [
    "front of house",
    "front of house audio",
    "front of house engineer",
    "front of house sound engineer",
    "foh",
    "foh engineer",
    "foh audio engineer",
    "audio tech",
    "audio technician",
    "front of house tech",
    "house audio engineer"
  ],
  "Production manager": [
    "production coordinator",
    "assistant production manager",
    "tour production manager",
    "festival operations manager",
    "event production manager",
    "live event production manager"
  ],
  "Technical Director / Video Switcher Operator": [
    "live video switcher",
    "live video switcher operator",
    "video switcher",
    "video switcher operator",
    "technical director",
    "td",
    "imag switcher",
    "broadcast switcher",
    "production switcher operator",
    "video director video switcher operator",
    "video director / video switcher operator"
  ],
  "Monitor engineer/Monitor mixer": [
    "monitor tech",
    "monitor technician",
    "iem tech",
    "iem technician",
    "in ear monitor tech",
    "monitor mixer",
    "monitor engineer"
  ],
  "PA System Technician": [
    "PA system tech",
    "pa systems tech",
    "pa systems technician",
    "pa technician",
    "pa tech",
    "speaker tech",
    "speaker technician",
    "audio crew chief",
    "system tech",
    "systems tech",
    "front of house tech"
  ],
  "Props Master / Properties Supervisor": [
    "props master",
    "property master",
    "properties master",
    "properties supervisor",
    "props supervisor",
    "head props person"
  ],
  "Equipment rental coordinator": [
    "rental coordinator",
    "equipment coordinator",
    "rental house coordinator",
    "av rental coordinator",
    "shop tech",
    "warehouse prep",
    "prep technician",
    "inventory coordinator",
    "rental account coordinator"
  ],
  "A2 Audio Technician/Backline": [
    "a2",
    "a2 audio",
    "a2 audio technician",
    "theatre backline",
    "theater backline",
    "theatrical backline",
    "musical theatre backline",
    "musical theater backline",
    "theatre audio technician",
    "theater audio technician",
    "assistant audio technician"
  ],
  "Backline technician": [
    "backline",
    "backline tech",
    "music backline",
    "touring backline",
    "touring backline tech",
    "touring backline technician",
    "instrument tech",
    "instrument technician",
    "guitar tech",
    "guitar technician",
    "bass tech",
    "bass technician",
    "drum tech",
    "drum technician",
    "keyboard tech",
    "keyboard technician",
    "keys tech",
    "keys technician",
    "playback tech",
    "playback technician",
    "ableton tech",
    "mainstage tech",
    "midi tech",
    "pedalboard tech",
    "effects pedal tech",
    "amp tech",
    "amplifier tech"
  ],
  "Amplifier technician": [
    "amp technician",
    "amp tech",
    "amp repair technician",
    "amp repair tech",
    "amplifier repair",
    "guitar amp repair",
    "tube amp repair",
    "amp builder",
    "guitar amp builder",
    "pedal builder",
    "effects pedal builder"
  ],
  "Electronic instrument designer / builder": [
    "electronic instrument builder",
    "synthesizer builder",
    "synth builder",
    "midi controller builder",
    "electronic music instrument designer"
  ],
  "Instrument maker": [
    "instrument builder",
    "instrument manufacturer",
    "brass instrument maker",
    "brass instrument manufacturer",
    "woodwind maker",
    "woodwind instrument maker",
    "mouthpiece maker",
    "mouthpiece manufacturing",
    "string manufacturer",
    "strings manufacturer",
    "musical string manufacturing technician"
  ],
  "Instrument repair technician": [
    "instrument repair",
    "instrument repair tech",
    "band instrument repair",
    "brass repair",
    "woodwind repair",
    "reed maker",
    "bow rehairer",
    "repair tech"
  ],
  "Luthier": [
    "guitar repair tech",
    "guitar repair",
    "guitar builder",
    "guitar maker",
    "violin maker",
    "string instrument maker",
    "instrument finishing",
    "instrument finishing technician",
    "lacquer specialist",
    "finish repair",
    "fretwork",
    "guitar setup"
  ],
  "Music store owner/manager": [
    "music store owner",
    "music store manager",
    "record store owner",
    "vinyl record store owner",
    "sheet music store operator",
    "record store buyer",
    "music retail buyer",
    "retail buyer music",
    "online music retailer"
  ],
  "Machine Learning Engineer (Music Recommendation)": [
    "music recommendation engineer",
    "recommendation engineer",
    "recommender systems engineer",
    "music recommender systems",
    "music personalization engineer",
    "personalization engineer",
    "machine learning personalization",
    "playlist recommendation",
    "streaming recommendation",
    "music discovery engineer"
  ],
  "Music product designer": [
    "accessories designer",
    "instrument accessories designer",
    "music accessories designer"
  ],
  "Percussion instrument/product builder": [
    "drum builder",
    "drum maker",
    "drum manufacturer",
    "drum head specialist",
    "drumstick maker",
    "drum stick maker",
    "drum stick manufacturer",
    "percussion product specialist",
    "percussion product designer",
    "percussion builder",
    "percussion manufacturer"
  ],
  "Piano technician": [
    "piano tuner",
    "piano tuning",
    "piano repair",
    "piano builder",
    "piano rebuilding",
    "piano manufacturing technician",
    "piano manufacturer"
  ]
};

function jobMatchesJobSearch(jobName, query){
  const normalizedQuery = normalizeSearchText(query);
  if(!normalizedQuery) return true;
  const searchable = [
    jobName,
    ...(JOB_SEARCH_ALIASES[jobName] || [])
  ].map(normalizeSearchText).join(" ");
  return searchable.includes(normalizedQuery);
}

function resolveStateSearch(query){
  const normalized = normalizeSearchText(query);
  if(!normalized) return null;
  const compact = normalized.replace(/\s+/g, "");
  const upper = compact.toUpperCase();
  if(US_STATE_NAMES[upper]) return {abbr:upper, name:US_STATE_NAMES[upper]};
  const abbr = US_STATE_NAME_LOOKUP[normalized];
  return abbr ? {abbr, name:US_STATE_NAMES[abbr]} : null;
}

function programStateTokens(name){
  const text = String(name || "");
  const tokens = new Set();
  const stateAbbrPattern = /(?:,\s*|\(\s*|\/\s*|\s)(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)(?=$|[\s,)\/])/g;
  let match;
  while((match = stateAbbrPattern.exec(text))){
    const abbr = match[1];
    tokens.add(abbr.toLowerCase());
    tokens.add(US_STATE_NAMES[abbr].toLowerCase());
  }
  const normalized = normalizeSearchText(text);
  Object.entries(US_STATE_NAMES).forEach(([abbr,name])=>{
    if(new RegExp(`\\\\b${name.toLowerCase().replace(/ /g, "\\\\s+")}\\\\b`).test(normalized)){
      tokens.add(abbr.toLowerCase());
      tokens.add(name.toLowerCase());
    }
  });
  return tokens;
}

function programGeographies(name, sourceTiers=[]){
  const tiers = sourceTiers instanceof Set ? sourceTiers : new Set(Array.isArray(sourceTiers) ? sourceTiers : [sourceTiers]);
  const text = String(name || "");
  const url = resolveSchoolUrl(text);
  let hostname = "";
  try{ hostname = new URL(url).hostname.toLowerCase(); }catch(_error){}

  const usState = /(?:,\s*|\(\s*)(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)(?=$|[\s,)\/])/g.test(text);
  const outsideCountry = /\b(?:uk|united kingdom|scotland|ireland|canada|spain|france|germany|australia|austria|belgium|denmark|finland|iceland|italy|japan|netherlands|norway|singapore|south korea|sweden|switzerland|taiwan|china|hong kong|new zealand)\b/i.test(text);
  const outsideCity = /\b(?:montreal|toronto|vancouver|london|liverpool|manchester|guildford|birmingham|paris|berlin|vienna|copenhagen|helsinki|oslo|stockholm|gothenburg|tokyo|beijing|shanghai|seoul|sydney|melbourne)\b/i.test(text);
  const outsideDomain = /\.(?:uk|ca|au|de|fr|fi|se|no|dk|nl|at|be|ch|it|es|ie|jp|sg|cn|tw|hk|kr|nz)(?:\/|$)/.test(`${hostname}/`);
  const usText = /\b(?:united states|u\.s\.|new york|los angeles|nashville|boston|chicago|philadelphia|san francisco|seattle|miami|atlanta|baltimore|pittsburgh|cleveland|denver|detroit|houston|dallas|austin|portland)\b/i.test(text);
  const usDomain = /\.edu(?:\/|$)/.test(`${hostname}/`);
  const geographies = new Set();

  const hasOutsideEvidence = tiers.has("international") || outsideCountry || outsideDomain || (outsideCity && !usState);
  if(hasOutsideEvidence) geographies.add("outside-us");
  if(usState || usText || (usDomain && !hasOutsideEvidence)) geographies.add("us");
  if(!geographies.size) geographies.add(tiers.has("international") ? "outside-us" : "us");
  return geographies;
}

function normalizedProgramRecord(entry, sourceTier){
  const name = typeof entry === "object" && entry !== null ? entry.name : String(entry).split(" — ")[0];
  const description = typeof entry === "object" && entry !== null
    ? (entry.desc || "")
    : (String(entry).split(" — ").slice(1).join(" — ") || "");
  return {
    name,
    url: typeof entry === "object" && entry !== null ? (entry.url || "") : "",
    descriptions: description ? [description] : [],
    highlights: typeof entry === "object" && entry !== null && entry.highlight ? [entry.highlight] : [],
    badges: typeof entry === "object" && entry !== null && Array.isArray(entry.badges) ? [...entry.badges] : [],
    sourceTiers: new Set(sourceTier ? [sourceTier] : [])
  };
}

function collectProgramsByGeography(data){
  const merged = new Map();
  const sourceNames = new Set();

  for(const [tier, entries] of Object.entries(data || {})){
    if(!Array.isArray(entries)) continue;
    entries.forEach(entry=>{
      const next = normalizedProgramRecord(entry, tier);
      if(!next.name) return;
      const key = next.name.toLowerCase().replace(/\s+/g, " ").trim();
      sourceNames.add(key);
      if(!merged.has(key)) merged.set(key, next);
      else{
        const current = merged.get(key);
        if(next.url && !current.url) current.url = next.url;
        next.descriptions.forEach(value=>{ if(!current.descriptions.includes(value)) current.descriptions.push(value); });
        next.highlights.forEach(value=>{ if(!current.highlights.includes(value)) current.highlights.push(value); });
        next.badges.forEach(value=>{ if(!current.badges.includes(value)) current.badges.push(value); });
        next.sourceTiers.forEach(value=>current.sourceTiers.add(value));
      }
    });
  }

  const grouped = {us:[], "outside-us":[]};
  for(const record of merged.values()){
    record.description = record.descriptions.join(" ");
    record.geographies = programGeographies(record.name, record.sourceTiers);
    record.geographies.forEach(geography=>grouped[geography].push(record));
  }
  Object.values(grouped).forEach(records=>records.sort((a,b)=>a.name.localeCompare(b.name, undefined, {sensitivity:"base"})));

  const groupedNames = new Set([...grouped.us, ...grouped["outside-us"]].map(record=>record.name.toLowerCase().replace(/\s+/g, " ").trim()));
  if(groupedNames.size !== sourceNames.size) console.error("Program grouping mismatch", {source:sourceNames.size, grouped:groupedNames.size});
  return grouped;
}

function programFactLabels(program){
  const labels = [];
  const sourceTiers = program.sourceTiers || new Set();
  sourceTiers.forEach(tier=>{
    const label = SOURCE_PROGRAM_TYPE_LABELS[tier];
    if(label && !labels.includes(label)) labels.push(label);
  });

  const details = `${program.name || ""} ${program.description || ""}`;
  if(!labels.some(label=>label.includes("College") || label.includes("Conservatory"))){
    if(/\b(?:university|college)\b/i.test(program.name || "")) labels.push("College / University");
    else if(/\b(?:conservatory|conservatoire|school of music)\b/i.test(program.name || "")) labels.push("Arts / Conservatory");
  }
  if(/\b(?:ph\.?d|doctor(?:al|ate)|dma|master'?s|graduate|postgraduate|m\.?s\.?|m\.?a\.?)\b/i.test(details) && !labels.includes("Graduate / Research")) labels.push("Graduate level");
  if(/\b(?:associate'?s?|certificate|diploma|vocational|apprenticeship|a\.?a\.?s\.?)\b/i.test(details)) labels.push("Certificate / Associate");
  if(/\b(?:bachelor'?s?|undergraduate|b\.?a\.?|b\.?s\.?|bmus|bfa)\b/i.test(details)) labels.push("Bachelor's / Undergraduate");
  if(/\bhybrid\b/i.test(details)) labels.push("Hybrid");
  else if(/\b(?:online|remote|distance learning|virtual)\b/i.test(details)) labels.push("Online");
  if(/language note|language of instruction|taught (?:primarily )?in/i.test(details)) labels.push("Language details provided");
  (program.badges || []).forEach(label=>{ if(label && !labels.includes(label)) labels.push(label); });
  return labels;
}

function renderProgramFacts(program){
  const labels = programFactLabels(program);
  return labels.length ? `<div class="school-card-facts">${labels.map(label=>`<span class="school-card-fact">${escapeHTML(label)}</span>`).join("")}</div>` : "";
}

const SCHOOL_INSTITUTION_LABELS = {
  "arts.ac.uk": "University of the Arts London",
  "berklee.edu": "Berklee",
  "cmu.edu": "Carnegie Mellon University",
  "columbia.edu": "Columbia University",
  "gatech.edu": "Georgia Institute of Technology",
  "harvard.edu": "Harvard University",
  "indiana.edu": "Indiana University",
  "iatse.net": "IATSE Training & Apprenticeships",
  "jhu.edu": "Johns Hopkins University",
  "namm.org": "NAMM Education & Training",
  "nyu.edu": "New York University",
  "rochester.edu": "University of Rochester",
  "syracuse.edu": "Syracuse University",
  "uc.edu": "University of Cincinnati",
  "ucla.edu": "University of California, Los Angeles",
  "umich.edu": "University of Michigan",
  "usc.edu": "University of Southern California",
  "usitt.org": "USITT Education & Training",
  "yale.edu": "Yale University"
};

function schoolWebsiteFamily(url){
  if(!url) return "";
  try{
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    const parts = hostname.split(".");
    const compoundSuffixes = new Set([
      "ac.uk", "co.uk", "org.uk", "gov.uk", "edu.au", "org.au", "ac.jp",
      "edu.sg", "com.sg", "edu.hk", "edu.tw", "ac.kr", "edu.cn", "ac.nz", "com.au"
    ]);
    const finalTwo = parts.slice(-2).join(".");
    return compoundSuffixes.has(finalTwo) ? parts.slice(-3).join(".") : finalTwo;
  }catch(_error){
    return "";
  }
}

function schoolProviderKey(name){
  const url = resolveSchoolUrl(name);
  const family = schoolWebsiteFamily(url);
  return family || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function cleanInstitutionCandidate(name){
  return String(name || "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .split(/\s+[—–]\s+/)[0]
    .replace(/\s+/g, " ")
    .trim();
}

function sharedInstitutionPrefix(names){
  const candidates = names.map(cleanInstitutionCandidate).filter(Boolean);
  if(!candidates.length) return "";
  if(candidates.length === 1) return candidates[0];
  const tokenLists = candidates.map(name => name.split(/\s+/));
  const shared = [];
  for(let index = 0; index < Math.min(...tokenLists.map(tokens => tokens.length)); index += 1){
    const token = tokenLists[0][index];
    if(tokenLists.every(tokens => tokens[index].toLowerCase() === token.toLowerCase())) shared.push(token);
    else break;
  }
  while(shared.length && /^(of|the|and|&|\/)$/.test(shared[shared.length - 1].toLowerCase())) shared.pop();
  const prefix = shared.join(" ");
  if(prefix.length >= 5 && !/^(university|college|school|institute)$/i.test(prefix)) return prefix;
  return candidates.sort((a,b) => a.length - b.length || a.localeCompare(b))[0];
}

function buildSchoolRegistry(){
  const programMap = new Map();
  const visibleJobs = new Set(categories.flatMap(category => category.jobs));
  for(const [job, tiers] of Object.entries(jobSchools)){
    if(!visibleJobs.has(job)) continue;
    for(const [tier, entries] of Object.entries(tiers || {})){
      if(!Array.isArray(entries)) continue;
      for(const entry of entries){
        const name = typeof entry === "object" ? entry.name : String(entry).split(" — ")[0];
        if(!name) continue;
        if(!programMap.has(name)){
          programMap.set(name, {
            id: name,
            name,
            url: resolveSchoolUrl(name),
            institutionKey: schoolProviderKey(name),
            jobs: new Set(),
            tiers: new Set(),
            geographies: new Set(),
            states: programStateTokens(name)
          });
        }
        const program = programMap.get(name);
        program.jobs.add(job);
        program.tiers.add(tier);
        programGeographies(name, [tier]).forEach(geography=>program.geographies.add(geography));
        programStateTokens(name).forEach(state=>program.states.add(state));
      }
    }
  }

  const institutionMap = new Map();
  for(const program of programMap.values()){
    if(!institutionMap.has(program.institutionKey)){
      institutionMap.set(program.institutionKey, {
        id: program.institutionKey,
        label: "",
        programs: [],
        jobs: new Set(),
        tiers: new Set(),
        geographies: new Set(),
        states: new Set()
      });
    }
    const institution = institutionMap.get(program.institutionKey);
    institution.programs.push(program);
    program.jobs.forEach(job => institution.jobs.add(job));
    program.tiers.forEach(tier => institution.tiers.add(tier));
    program.geographies.forEach(geography => institution.geographies.add(geography));
    program.states.forEach(state => institution.states.add(state));
  }

  for(const institution of institutionMap.values()){
    institution.label = SCHOOL_INSTITUTION_LABELS[institution.id] || sharedInstitutionPrefix(institution.programs.map(program => program.name));
    institution.programs.sort((a,b) => a.name.localeCompare(b.name));
  }

  return {
    programs: [...programMap.values()].sort((a,b) => a.name.localeCompare(b.name)),
    institutions: [...institutionMap.values()].sort((a,b) => a.label.localeCompare(b.label)),
    programMap,
    institutionMap
  };
}

const schoolRegistry = buildSchoolRegistry();
let activeSchoolSelection = null;
let activeSchoolBrowserCategory = "all";
let schoolBrowserSortMode = "alphabetical";
let isSchoolBrowserOpen = false;

function schoolTierLabels(tiers){
  return COVERAGE_TIERS.filter(tier => tiers.has(tier.id)).map(tier => tier.label);
}

function schoolRecordMatchesCategory(record){
  return activeSchoolBrowserCategory === "all" || record.geographies.has(activeSchoolBrowserCategory);
}

function matchingSchoolPrograms(query){
  const normalized = normalizeSearchText(query);
  if(!normalized) return schoolRegistry.programs;
  const stateSearch = resolveStateSearch(query);
  return schoolRegistry.programs.filter(program => {
    const institution = schoolRegistry.institutionMap.get(program.institutionKey);
    if(stateSearch) return program.states.has(stateSearch.abbr.toLowerCase()) || program.states.has(stateSearch.name.toLowerCase());
    const programText = normalizeSearchText(program.name);
    const institutionText = normalizeSearchText(institution?.label || "");
    return programText.includes(normalized) || institutionText.includes(normalized);
  });
}

function schoolSearchSummaryLabel(query){
  if(activeSchoolSelection?.label) return activeSchoolSelection.label;
  const stateSearch = resolveStateSearch(query);
  if(stateSearch) return `${stateSearch.name} (${stateSearch.abbr})`;
  const matchedPrograms = matchingSchoolPrograms(query).map(program => cleanInstitutionCandidate(program.name));
  const matchedNames = [...new Set(matchedPrograms)];
  return matchedNames.slice(0,3).join(", ") + (matchedNames.length>3 ? ` +${matchedNames.length-3} more` : "");
}

function jobMatchesSchoolSelection(jobName){
  const tiers = jobSchools[jobName];
  if(!tiers) return false;
  for(const entries of Object.values(tiers)){
    if(!Array.isArray(entries)) continue;
    for(const entry of entries){
      const name = typeof entry === "object" ? entry.name : String(entry).split(" — ")[0];
      if(activeSchoolSelection?.type === "program" && name === activeSchoolSelection.id) return true;
      if(activeSchoolSelection?.type === "institution" && schoolProviderKey(name) === activeSchoolSelection.id) return true;
    }
  }
  return false;
}

function jobMatchesSchoolQuery(jobName, query){
  const matchingNames = new Set(matchingSchoolPrograms(query).map(program => program.name));
  const tiers = jobSchools[jobName];
  if(!tiers || !matchingNames.size) return false;
  return Object.values(tiers).some(entries => Array.isArray(entries) && entries.some(entry => {
    const name = typeof entry === "object" ? entry.name : String(entry).split(" — ")[0];
    return matchingNames.has(name);
  }));
}

function schoolBrowserOption(record, type){
  const isInstitution = type === "institution";
  const label = isInstitution ? record.label : record.name;
  return `<button class="school-browser-option" type="button" role="option" data-school-type="${type}" data-school-key="${escapeHTML(record.id)}">
    <span class="school-browser-option-copy">
      <span class="school-browser-option-name">${escapeHTML(label)}</span>
    </span>
    <span class="school-browser-option-count">${record.jobs.size} career${record.jobs.size === 1 ? "" : "s"}</span>
  </button>`;
}

function renderSchoolBrowser(){
  const browser = document.getElementById("school-browser");
  const filters = document.getElementById("school-browser-filters");
  const list = document.getElementById("school-browser-list");
  const count = document.getElementById("school-browser-count");
  const input = document.getElementById("search");
  if(!browser || !filters || !list || !count || !input) return;

  const query = input.value.trim();
  const source = query ? matchingSchoolPrograms(query) : schoolRegistry.institutions;
  const type = query ? "program" : "institution";
  const recordLabel = record => type === "institution" ? record.label : record.name;
  const records = source.filter(schoolRecordMatchesCategory).sort((a,b)=>{
    if(schoolBrowserSortMode === "coverage"){
      const coverageDifference = b.jobs.size - a.jobs.size;
      if(coverageDifference) return coverageDifference;
    }
    return recordLabel(a).localeCompare(recordLabel(b), undefined, {sensitivity:"base"});
  });

  browser.querySelectorAll("[data-school-sort]").forEach(button=>{
    const isActive = button.dataset.schoolSort === schoolBrowserSortMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  filters.innerHTML = [{id:"all", label:"All Programs"}, ...COVERAGE_TIERS]
    .map(tier => `<button class="school-browser-filter${activeSchoolBrowserCategory === tier.id ? " active" : ""}" type="button" data-school-category="${tier.id}">
      <span class="school-browser-filter-label">${escapeHTML(tier.label)}</span>
      <span class="school-browser-filter-description">${escapeHTML(PROGRAM_CATEGORY_DESCRIPTIONS[tier.id])}</span>
    </button>`)
    .join("");
  count.textContent = `${records.length} ${query ? "programs" : "schools"}`;

  if(!records.length){
    list.innerHTML = `<div class="school-browser-empty">No schools or programs match this search</div>`;
    return;
  }

  let previousLetter = "";
  list.innerHTML = records.map(record => {
    const label = type === "institution" ? record.label : record.name;
    const letter = (label.match(/[A-Za-z0-9]/)?.[0] || "#").toUpperCase();
    const heading = schoolBrowserSortMode === "alphabetical" && letter !== previousLetter ? `<div class="school-browser-letter">${escapeHTML(letter)}</div>` : "";
    previousLetter = letter;
    return heading + schoolBrowserOption(record, type);
  }).join("");
}

function openSchoolBrowser(){
  if(activeSearchMode !== "school") return;
  const browser = document.getElementById("school-browser");
  const input = document.getElementById("search");
  if(!browser || !input) return;
  isSchoolBrowserOpen = true;
  renderSchoolBrowser();
  browser.classList.add("open");
  input.setAttribute("aria-expanded", "true");
}

function closeSchoolBrowser(){
  const browser = document.getElementById("school-browser");
  const input = document.getElementById("search");
  isSchoolBrowserOpen = false;
  if(browser) browser.classList.remove("open");
  if(input) input.setAttribute("aria-expanded", "false");
}

function selectSchoolBrowserItem(type, id){
  const record = type === "institution" ? schoolRegistry.institutionMap.get(id) : schoolRegistry.programMap.get(id);
  if(!record) return;
  const label = type === "institution" ? record.label : record.name;
  activeSchoolSelection = { type, id, label };
  currentSearchQuery = label;
  const input = document.getElementById("search");
  if(input) input.value = label;
  closeSchoolBrowser();
  closeDetailPanel();
  renderCareerResults();
}

function clearSchoolSearch(options={}){
  activeSchoolSelection = null;
  currentSearchQuery = "";
  activeSchoolBrowserCategory = "all";
  const input = document.getElementById("search");
  if(input) input.value = "";
  closeDetailPanel();
  renderCareerResults();
  if(options.focus !== false && input){
    input.focus();
    openSchoolBrowser();
  }
}

function syncFocusedWorkspaceResults(){
  const workspace = document.querySelector('.redesign-product-window');
  if(!workspace) return;
  const view = workspace.dataset.workspace || 'all';
  const waitingForSearch = ['job', 'school'].includes(view) && !currentSearchQuery.trim();
  const waitingForPathway = view === 'pathway' && activeEntryPathFilter === 'all' && activeCareerAreaFilter === 'all';
  workspace.classList.toggle('workspace-waiting', waitingForSearch || waitingForPathway);
  workspace.classList.toggle('pathway-filtered', view === 'pathway' && !waitingForPathway);
}

function getCategoryForJob(jobName){
  return categories.find(category=>category.jobs.includes(jobName)) || null;
}

function getEntryPathForJob(jobName){
  return jobDegrees[jobName] || "none";
}

function getVisibleJobCount(){
  return categories.reduce((total, category)=>total + category.jobs.length, 0);
}

function groupJobsByEntryPath(jobs){
  const jobsByEntryPath = {none:[], assoc:[], bach:[], grad:[]};
  jobs.forEach(jobName=>{
    jobsByEntryPath[getEntryPathForJob(jobName)].push(jobName);
  });
  return jobsByEntryPath;
}

function getJobProfileFields(jobName) {
  const profile = jobProfiles[jobName];
  return profile ? [profile.d, profile.r, profile.e || profile.w] : [
    `Responsible for ${jobName.toLowerCase()} work within the music industry.`,
    "Managing daily tasks; Collaborating with artists and stakeholders; Ensuring quality and consistency",
    "Music industry companies, Independent artists, Agencies, Studios"
  ];
}

function getMatchingSchoolNames(query){
  if(!query.trim()) return [];
  return matchingSchoolPrograms(query).map(program => program.name);
}

function jobListsAnySchoolVariant(jobName, schoolVariants){
  const tiers = jobSchools[jobName];
  if(!tiers) return false;
  for(const schools of Object.values(tiers)){
    for(const schoolEntry of schools){
      const listedSchoolName = typeof schoolEntry==="object" ? schoolEntry.name : schoolEntry.split(" — ")[0];
      if(schoolVariants.some(schoolVariant => listedSchoolName.toLowerCase().includes(schoolVariant.toLowerCase().split("(")[0].trim()))) return true;
    }
  }
  return false;
}

function getFilteredCareerCategories(){
  const workspace = document.querySelector('.redesign-product-window');
  const isDirectoryView = workspace && ['index', 'compare'].includes(workspace.dataset.workspace);
  const filtered = categories.map(category=>{
    if(isDirectoryView && activeIndexCategoryId && category.id !== activeIndexCategoryId)return null;
    if(activeCareerAreaFilter!=="all"&&category.id!==activeCareerAreaFilter)return null;
    let jobs;
    if(activeSearchMode==="school" && currentSearchQuery.trim()){
      jobs = category.jobs.filter(jobName=>{
        if(activeEntryPathFilter!=="all" && getEntryPathForJob(jobName)!==activeEntryPathFilter) return false;
        return activeSchoolSelection ? jobMatchesSchoolSelection(jobName) : jobMatchesSchoolQuery(jobName, currentSearchQuery);
      });
    } else {
      jobs = category.jobs.filter(jobName=>jobMatchesJobSearch(jobName, currentSearchQuery)&&(activeEntryPathFilter==="all"||getEntryPathForJob(jobName)===activeEntryPathFilter));
    }
    if(!jobs.length)return null;
    return{...category,jobs};
  }).filter(Boolean);

  if(isDirectoryView){
    filtered.sort((firstCategory, secondCategory)=>firstCategory.label.localeCompare(secondCategory.label, undefined, {sensitivity:'base'}));
  }

  return filtered;
}

function setSearchMode(mode, options={}){
  activeSearchMode = mode;
  currentSearchQuery = "";
  activeJobName = null;
  activeSchoolSelection = null;
  activeSchoolBrowserCategory = "all";
  closeSchoolBrowser();
  const input = document.getElementById("search");
  input.value = "";
  if(mode==="school"){
    input.placeholder = "Search or choose a school, program, or state";
    input.classList.add("school-mode");
  } else {
    input.placeholder = "Search jobs";
    input.classList.remove("school-mode");
  }
  document.getElementById("mode-job").classList.toggle("active", mode==="job");
  document.getElementById("mode-school").classList.toggle("active", mode==="school");
  closeDetailPanel();
  renderCareerResults();
  if(options.focus !== false){
    input.focus();
    if(mode === "school") openSchoolBrowser();
  }
}

let isFilterDropdownOpen = false;
function toggleFilterDropdown(event){
  event.stopPropagation();
  isFilterDropdownOpen = !isFilterDropdownOpen;
  if(document.getElementById("filter-dropdown")) document.getElementById("filter-dropdown").classList.toggle("open", isFilterDropdownOpen);
}
document.addEventListener("click", ()=>{
  if(isFilterDropdownOpen){
    isFilterDropdownOpen = false;
    if(document.getElementById("filter-dropdown")) document.getElementById("filter-dropdown").classList.remove("open");
  }
});
if(document.getElementById("filter-dropdown")) document.getElementById("filter-dropdown").addEventListener("click", event=>event.stopPropagation());

function resetAllFilters(){
  activeCareerAreaFilter = "all";
  activeEntryPathFilter = "all";
  currentSearchQuery = "";
  document.getElementById("search").value="";
  closeDetailPanel();
  renderCareerResults();
}

function syncPathwayDegreeDropdown(value=activeEntryPathFilter){
  const select = document.getElementById("pathway-degree");
  const trigger = document.getElementById("pathway-degree-trigger");
  const valueLabel = document.getElementById("pathway-degree-value");
  const menu = document.getElementById("pathway-degree-menu");
  if(select) select.value = value;
  if(!menu) return;
  const options = [...menu.querySelectorAll(".pathway-select-option")];
  const selected = options.find(option=>option.dataset.pathwayDegree === value) || options[0];
  options.forEach(option=>option.setAttribute("aria-selected", option === selected ? "true" : "false"));
  if(valueLabel && selected) valueLabel.textContent = selected.textContent;
  if(trigger && selected) trigger.setAttribute("aria-activedescendant", selected.id || "");
}

function closePathwayDegreeMenu({restoreFocus=false}={}){
  const shell = document.getElementById("pathway-degree-shell");
  const trigger = document.getElementById("pathway-degree-trigger");
  const menu = document.getElementById("pathway-degree-menu");
  if(!shell || !trigger || !menu) return;
  shell.classList.remove("open");
  trigger.setAttribute("aria-expanded", "false");
  menu.hidden = true;
  if(restoreFocus) trigger.focus();
}

function openPathwayDegreeMenu(){
  const shell = document.getElementById("pathway-degree-shell");
  const trigger = document.getElementById("pathway-degree-trigger");
  const menu = document.getElementById("pathway-degree-menu");
  if(!shell || !trigger || !menu) return;
  shell.classList.add("open");
  trigger.setAttribute("aria-expanded", "true");
  menu.hidden = false;
  const selected = menu.querySelector('.pathway-select-option[aria-selected="true"]') || menu.querySelector(".pathway-select-option");
  if(selected) selected.focus();
}

function togglePathwayDegreeMenu(){
  const menu = document.getElementById("pathway-degree-menu");
  if(!menu) return;
  if(menu.hidden) openPathwayDegreeMenu();
  else closePathwayDegreeMenu({restoreFocus:true});
}

function choosePathwayDegree(value){
  syncPathwayDegreeDropdown(value);
  closePathwayDegreeMenu();
  setEntryPathFilter(value);
  const trigger = document.getElementById("pathway-degree-trigger");
  if(trigger) trigger.focus({ preventScroll: true });
}

function handlePathwayDegreeTriggerKey(event){
  if(!["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) return;
  event.preventDefault();
  openPathwayDegreeMenu();
}

function handlePathwayDegreeOptionKey(event, option){
  const menu = document.getElementById("pathway-degree-menu");
  if(!menu) return;
  const options = [...menu.querySelectorAll(".pathway-select-option")];
  const current = options.indexOf(option);
  if(event.key === "Escape"){
    event.preventDefault();
    closePathwayDegreeMenu({restoreFocus:true});
    return;
  }
  if(event.key === "Tab"){
    closePathwayDegreeMenu();
    return;
  }
  if(!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  let next = current;
  if(event.key === "ArrowDown") next = (current + 1) % options.length;
  if(event.key === "ArrowUp") next = (current - 1 + options.length) % options.length;
  if(event.key === "Home") next = 0;
  if(event.key === "End") next = options.length - 1;
  options[next].focus();
}

document.addEventListener("click", event=>{
  const shell = document.getElementById("pathway-degree-shell");
  if(shell && !shell.contains(event.target)) closePathwayDegreeMenu();
});

function updatePathwayFilterControls(){
  const degreeSelect = document.getElementById("pathway-degree");
  if(degreeSelect) degreeSelect.value = activeEntryPathFilter;
  syncPathwayDegreeDropdown(activeEntryPathFilter);

  const categoryWrap = document.getElementById("pathway-categories");
  if(categoryWrap){
    const buttons = [
      `<button class="pathway-chip${activeCareerAreaFilter==="all" ? " active" : ""}" type="button" onclick="setCareerAreaFilter('all')">All Areas</button>`,
      ...categories.map(category =>
        `<button class="pathway-chip${activeCareerAreaFilter===category.id ? " active" : ""}" type="button" onclick="setCareerAreaFilter('${category.id}')">${category.label}</button>`
      )
    ];
    categoryWrap.innerHTML = buttons.join("");
  }

  const guideCount = document.getElementById("pathway-guide-count");
  if(guideCount){
    const filtered = getFilteredCareerCategories();
    const total = filtered.reduce((sum, category) => sum + category.jobs.length, 0);
    guideCount.textContent = `${total.toLocaleString()} matching ${total===1 ? "role" : "roles"}`;
  }
}

const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

function renderCareerPathSection(cp){
  if(!cp) return "";
  if(Array.isArray(cp)){
    return `<div class="programs-chapter">
      Career Path
    </div>
    <div class="popup-section career-path-section" style="padding-top:10px">
      <ol class="career-steps">
        ${cp.map(stage=>`<li><strong>${stage.stage}</strong><br>${stage.desc}</li>`).join("")}
      </ol>
    </div>`;
  }
  return `<div class="programs-chapter">
    Career Path
  </div>
  <div class="popup-section career-path-section" style="padding-top:10px">
    ${cp.entry ? `<div class="career-entry-box">
      <div class="career-entry-label">Starting Point</div>
      <div class="career-entry-text">${cp.entry}</div>
    </div>` : ""}
    ${cp.steps && cp.steps.length ? `
    <div class="popup-label" style="margin-bottom:6px;margin-top:2px">Career Progression</div>
    <ol class="career-steps">
      ${cp.steps.map(step=>`<li>${step}</li>`).join("")}
    </ol>` : ""}
    ${cp.certs && cp.certs.length ? `
    <div class="popup-label" style="margin-bottom:6px;margin-top:10px">Useful Certifications</div>
    <div class="career-certs">
      ${cp.certs.map(certification=>`<div class="career-cert-item"><span class="career-cert-icon">&#9670;</span><span>${certification}</span></div>`).join("")}
    </div>` : ""}
  </div>`;
}

function renderPathwayNoteSection(pathwayNote){
  if(!pathwayNote) return "";
  return `<div class="pathway-note ${pathwayNote.type}">
    <span class="pathway-note-icon">${pathwayNote.type === 'required' ? '⚑' : '↗'}</span>
    <div class="pathway-note-body"><strong>${pathwayNote.label}</strong>${pathwayNote.body}</div>
  </div>`;
}


function switchTierTab(panelId, tierName, clickedTab){
  const tabsContainer = document.getElementById(panelId + "-tabs");
  if(tabsContainer) tabsContainer.querySelectorAll(".tier-tab").forEach(tab=>tab.classList.remove("active"));
  ["university","conservatories","research","international","specialized"].forEach(programTierName=>{
    const programPanel = document.getElementById(panelId + "-" + programTierName);
    if(programPanel) programPanel.classList.remove("active");
  });
  clickedTab.classList.add("active");
  const selectedProgramPanel = document.getElementById(panelId + "-" + tierName);
  if(selectedProgramPanel) selectedProgramPanel.classList.add("active");
}

function renderWorkspaceSchoolCards(programs){
  return (programs || []).map(program=>{
    const name = typeof program === "object" ? program.name : program.split(" — ")[0];
    const description = typeof program === "object" ? (program.description || program.desc || "") : (program.split(" — ").slice(1).join(" — ") || "");
    return `<div class="school-card">
      <div class="school-card-accent"></div>
      <div class="school-card-body">
        <div class="school-card-name">${schoolLink(name, program.url)}</div>
        ${typeof program === "object" ? renderProgramFacts(program) : ""}
        ${description ? `<div class="school-card-desc">${escapeHTML(description)}</div>` : ""}
        ${typeof program === "object" && program.highlights?.length ? `<div class="school-card-highlight">${program.highlights.map(escapeHTML).join(" · ")}</div>` : ""}
      </div>
    </div>`;
  }).join("");
}

function classifyCareerPreparationEntry(name){
  const normalized = String(name || "").toLowerCase();
  if(!normalized || normalized.startsWith("no standard certification")) return "note";

  const professionalDevelopmentPatterns = [
    /osha\s*10|osha\s*30/,
    /proficiency/,
    /training certificate|training certification|training\/designation/,
    /training course|training program|product training|operator training|specialist training/,
    /\btraining\b/,
    /\bcourses?\b/,
    /\bskills?\b/,
    /\bknowledge\b/,
    /workshops?/,
    /apprenticeship/,
    /membership/,
    /sound healing practitioner certificate/,
    /sound bath practitioner certificate/,
    /worship leadership certificate/,
    /certification programs/,
    /platform-specific certification/,
    /fema ics/,
    /laser safety officer/,
    /healthrhythms/
  ];
  if(professionalDevelopmentPatterns.some(pattern=>pattern.test(normalized))) return "training";

  const requirementPatterns = [
    /\blicen[cs]e\b|\blicen[cs]ed\b/,
    /\bpermit\b/,
    /\bregistration\b|\baffiliation\b/,
    /\bcdl\b|\bendorsement\b/,
    /faa part 107/,
    /dot medical/,
    /atf explosives/,
    /variance/,
    /customs broker/,
    /clean driving record/,
    /testing documentation/,
    /blanket licenses/
  ];
  if(requirementPatterns.some(pattern=>pattern.test(normalized))) return "requirement";

  const certificationPatterns = [
    /\bcertif/,
    /registered piano technician|\brpt\b|ptg associate/,
    /professional credential|venue safety credentials/
  ];
  if(certificationPatterns.some(pattern=>pattern.test(normalized))) return "certification";

  return "training";
}

const CAREER_PREPARATION_TEXT_REPLACEMENTS = new Map([
  ["cpr/first aid/aed and crowd-management training", "Crowd-management training"],
  ["alcohol service certification where applicable", "TIPS Alcohol Server/Seller Certification where required or accepted locally"],
  ["electronics technician certification (beneficial)", "ETA Associate Certified Electronics Technician (CETa)"],
  ["machining or cnc operator certification (beneficial for precision metalwork)", "NIMS CNC Mill Operations or CNC Lathe Operations credential"],
  ["atem / ross switcher operator training", "Blackmagic Design ATEM Training, Ross University Switcher Training"],
  ["steadicam or specialty rig operator certification", "Steadicam Workshops"],
  ["icc/code training, accessibility/ada training, fire/life-safety education, and local permitting experience are useful; licensed professionals may be required for stamped work", "ICC/code training, accessibility/ADA training, NFPA fire/life-safety education, and local permitting experience are useful; licensed professionals may be required for stamped work"]
]);

function normalizeCareerPreparationItem(item){
  const name = String(item.name || "").trim();
  const replacement = CAREER_PREPARATION_TEXT_REPLACEMENTS.get(name.toLowerCase());
  return replacement ? {...item, name:replacement} : {...item, name};
}

function getCareerPreparationIdentity(name){
  const normalized = String(name || "").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

  if(normalized.includes("event safety alliance")) return "resource:event-safety-alliance";
  if(normalized.includes("rational acoustics") && normalized.includes("smaart")) return "resource:smaart-training";
  if(normalized.includes("faa part 107")) return "credential:faa-part-107";
  if(normalized.includes("state security guard license") || normalized.includes("security guard license where required")) return "requirement:security-guard-license";
  if(normalized.includes("fema ics")) return "resource:fema-ics";
  if(normalized.includes("registered piano technician")) return "credential:registered-piano-technician";
  if(normalized.includes("avixa cts")) return "credential:avixa-cts";
  if(normalized.includes("pro tools") && normalized.includes("certif")) return "credential:pro-tools";
  if(normalized.includes("brompton technology")) return "resource:brompton-training";
  if(normalized.includes("blackmagic design") && (normalized.includes("training") || normalized.includes("certif"))) return "resource:blackmagic-training";
  if(normalized.includes("l acoustics") && (normalized.includes("education") || normalized.includes("system certif") || normalized.includes("manufacturer system training"))) return "resource:l-acoustics-system-training";
  if(normalized.includes("namm") && normalized.includes("education")) return "resource:namm-education";
  if(/fire (?:and )?life safety/.test(normalized) && (normalized.includes("icc code training") || normalized.includes("nfpa"))) return "resource:building-code-safety-training";

  if(normalized.includes("entertainment technician certification program") && !/(rigger|electrician|portable power)/.test(normalized)){
    return "credential:etcp-general";
  }

  if(normalized.includes("osha")){
    const levels = [...new Set(normalized.match(/\b(?:10|30)\b/g) || [])].sort();
    return `resource:osha:${levels.join("-") || "general"}`;
  }

  if(normalized.includes("dante certification")){
    const levels = [];
    for(const match of String(name || "").matchAll(/level\s*([123])(?:\s*\/\s*([123]))?/gi)){
      levels.push(match[1]);
      if(match[2]) levels.push(match[2]);
    }
    const uniqueLevels = [...new Set(levels)].sort();
    return uniqueLevels.length ? `credential:dante:${uniqueLevels.join("-")}` : "credential:dante:general";
  }

  return `name:${normalized}`;
}

function mergeCareerPreparationItems(current, candidate, identity){
  const score = item=>String(item.name || "").length + Math.min(String(item.note || "").length, 120) * 0.05;
  const preferred = score(candidate) > score(current) ? candidate : current;
  const secondary = preferred === current ? candidate : current;
  const kindRank = {training:1, certification:2, requirement:3};
  const kind = kindRank[current.kind] >= kindRank[candidate.kind] ? current.kind : candidate.kind;
  const merged = {
    ...secondary,
    ...preferred,
    kind,
    url:preferred.url || secondary.url || "",
    org:preferred.org || secondary.org || "",
    note:preferred.note || secondary.note || ""
  };
  const multiProviderIdentities = new Set([
    "resource:brompton-training",
    "resource:blackmagic-training",
    "resource:l-acoustics-system-training",
    "resource:namm-education",
    "resource:building-code-safety-training"
  ]);
  if(multiProviderIdentities.has(identity)) merged.url = "";
  if(identity === "resource:fema-ics") merged.name = "FEMA Incident Command System courses appropriate to the role";
  return merged;
}

function getCareerPreparation(jobName){
  const careerPath = jobCareerPaths[jobName];
  const pathEntries = careerPath && !Array.isArray(careerPath) && Array.isArray(careerPath.certs)
    ? careerPath.certs.map(name=>({name, org:"", note:"", url:"", source:"path"}))
    : [];
  const listedEntries = jobCerts && Array.isArray(jobCerts[jobName])
    ? jobCerts[jobName].map(item=>({...item, source:"listed"}))
    : [];
  const careerDevelopmentEntries = Array.isArray(jobCareerDevelopmentResources[jobName])
    ? jobCareerDevelopmentResources[jobName]
    : [];
  const grouped = new Map();
  const preparation = {credentials:[], training:[]};

  [...pathEntries, ...listedEntries, ...careerDevelopmentEntries].map(normalizeCareerPreparationItem).forEach(item=>{
    const kind = classifyCareerPreparationEntry(item.name);
    if(kind === "note") return;
    const normalizedItem = {...item, kind};
    const identity = getCareerPreparationIdentity(item.name);
    const existing = grouped.get(identity);
    grouped.set(identity, existing ? mergeCareerPreparationItems(existing, normalizedItem, identity) : normalizedItem);
  });

  const hasSpecificDanteCredential = [...grouped.keys()].some(key=>key.startsWith("credential:dante:") && key !== "credential:dante:general");
  if(hasSpecificDanteCredential) grouped.delete("credential:dante:general");

  grouped.forEach(item=>{
    if(item.kind === "certification" || item.kind === "requirement") preparation.credentials.push(item);
    else preparation.training.push(item);
  });

  return preparation;
}

const CAREER_PREPARATION_LINK_RULES = [
  { pattern:/Certified Customs Specialist(?: \(CCS\))?/i, url:"https://www.ncbfaa.org/education" },
  { pattern:/Licensed Customs Broker(?: \(CB\))?/i, url:"https://www.cbp.gov/trade/programs-administration/customs-brokers" },
  { pattern:/IATA Dangerous Goods Regulations?/i, url:"https://www.iata.org/en/training/courses/dgr/" },
  { pattern:/FAA Part 107/i, url:"https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot" },
  { pattern:/CCC-SLP/i, url:"https://www.asha.org/certification/slpcertification/" },
  { pattern:/CCC-A/i, url:"https://www.asha.org/certification/audcertification/" },
  { pattern:/MT-BC/i, url:"https://www.cbmt.org/" },
  { pattern:/NBCOT/i, url:"https://www.nbcot.org/" },
  { pattern:/Registered Piano Technician(?: \(RPT\))?/i, url:"https://www.ptg.org/ptgmain/certification" },
  { pattern:/Certified Broadcast Technologist/i, url:"https://sbe.org/certification/" },
  { pattern:/OSHA(?:\s*10|\s*30|\s*10\/30)?/i, url:"https://www.osha.gov/training/outreach" },
  { pattern:/FEMA ICS/i, url:"https://training.fema.gov/nims/" },
  { pattern:/CDL/i, url:"https://www.fmcsa.dot.gov/registration/commercial-drivers-license" },
  { pattern:/DOT medical certificate/i, url:"https://www.fmcsa.dot.gov/medical/driver-medical-requirements" },
  { pattern:/CPR(?:\/First Aid| and First Aid)?/i, url:"https://www.redcross.org/take-a-class" },
  { pattern:/First Aid(?:\/CPR)?/i, url:"https://www.redcross.org/take-a-class" },
  { pattern:/ServSafe/i, url:"https://www.servsafe.com/" },
  { pattern:/ATA Carnet/i, url:"https://www.uscib.org/ata-carnet/" },
  { pattern:/ATF explosives permit/i, url:"https://www.atf.gov/explosives" },
  { pattern:/Laser Safety Officer/i, url:"https://www.ilda.com/" },
  { pattern:/Dante Certification/i, url:"https://www.getdante.com/resources/training/dante-certification-program/" },
  { pattern:/\bDante\b/i, url:"https://www.getdante.com/resources/training/dante-certification-program/" },
  { pattern:/Entertainment Technician Certification Program/i, url:"https://etcp.esta.org/" },
  { pattern:/ETCP/i, url:"https://etcp.esta.org/" },
  { pattern:/Avid Pro Tools/i, url:"https://www.avid.com/learning/certification" },
  { pattern:/Pro Tools certification/i, url:"https://www.avid.com/learning/certification" },
  { pattern:/\bPro Tools\b/i, url:"https://www.avid.com/learning" },
  { pattern:/Apple Digital Masters/i, url:"https://www.apple.com/apple-music/apple-digital-masters/" },
  { pattern:/Dolby Atmos/i, url:"https://professional.dolby.com/music/" },
  { pattern:/Adobe Certified Professional/i, url:"https://certifiedprofessional.adobe.com/" },
  { pattern:/American Choral Directors Association/i, url:"https://acda.org/" },
  { pattern:/\bACDA\b/i, url:"https://acda.org/" },
  { pattern:/American Federation of Musicians/i, url:"https://www.afm.org/" },
  { pattern:/\bAFM\b/i, url:"https://www.afm.org/" },
  { pattern:/American Guild of Organists/i, url:"https://www.agohq.org/certification/" },
  { pattern:/American Orff-Schulwerk Association/i, url:"https://aosa.org/" },
  { pattern:/Organization of American Kodály Educators/i, url:"https://www.oake.org/" },
  { pattern:/Suzuki Association of the Americas/i, url:"https://suzukiassociation.org/" },
  { pattern:/Audio Engineering Society/i, url:"https://aes2.org/" },
  { pattern:/\bAES\b/, url:"https://aes2.org/" },
  { pattern:/Acoustical Society of America/i, url:"https://acousticalsociety.org/" },
  { pattern:/\bASA\b/, url:"https://acousticalsociety.org/" },
  { pattern:/Academy of Neurologic Music Therapy/i, url:"https://nmtacademy.co/" },
  { pattern:/American Music Therapy Association/i, url:"https://www.musictherapy.org/" },
  { pattern:/Certification Board for Music Therapists/i, url:"https://www.cbmt.org/" },
  { pattern:/Performing Arts Medicine Association/i, url:"https://www.artsmed.org/" },
  { pattern:/International Association for Dance Medicine & Science/i, url:"https://iadms.org/" },
  { pattern:/International Code Council/i, url:"https://www.iccsafe.org/professional-development/" },
  { pattern:/\bICC\b/, url:"https://www.iccsafe.org/professional-development/" },
  { pattern:/\bADA\b/, url:"https://www.ada.gov/law-and-regs/design-standards/" },
  { pattern:/INCE-USA/i, url:"https://www.inceusa.org/" },
  { pattern:/\bIOA\b/, url:"https://www.ioa.org.uk/" },
  { pattern:/Event Safety Alliance/i, url:"https://eventsafetyalliance.org/" },
  { pattern:/USITT/i, url:"https://www.usitt.org/education-training" },
  { pattern:/IATSE/i, url:"https://iatse.net/education/" },
  { pattern:/AVIXA/i, url:"https://www.avixa.org/training-section" },
  { pattern:/NFPA/i, url:"https://www.nfpa.org/for-professionals/training-for-me" },
  { pattern:/Music Business Association/i, url:"https://musicbiz.org/" },
  { pattern:/NAMM/i, url:"https://www.namm.org/" },
  { pattern:/Volunteer Lawyers for the Arts/i, url:"https://vlany.org/" },
  { pattern:/Copyright Alliance/i, url:"https://copyrightalliance.org/" },
  { pattern:/Copyright Society/i, url:"https://copyrightsociety.org/" },
  { pattern:/SoundExchange/i, url:"https://www.soundexchange.com/creator-hub/" },
  { pattern:/The Mechanical Licensing Collective/i, url:"https://www.themlc.com/" },
  { pattern:/\bMLC\b/, url:"https://www.themlc.com/" },
  { pattern:/\bHFA\b/, url:"https://www.harryfox.com/" },
  { pattern:/Copyright Office/i, url:"https://www.copyright.gov/registration/" },
  { pattern:/ASCAP/i, url:"https://www.ascap.com/help/career-development/how-to-join-ascap" },
  { pattern:/\bBMI\b/, url:"https://www.bmi.com/join" },
  { pattern:/SESAC/i, url:"https://www.sesac.com/" },
  { pattern:/\bGMR\b/, url:"https://globalmusicrights.com/" },
  { pattern:/Spotify for Artists/i, url:"https://artists.spotify.com/" },
  { pattern:/DDEX/i, url:"https://ddex.net/" },
  { pattern:/Avid Learning Partners/i, url:"https://www.avid.com/products/pro-tools/avid-learning-partner" },
  { pattern:/Blackmagic Design/i, url:"https://www.blackmagicdesign.com/training" },
  { pattern:/DaVinci Resolve/i, url:"https://www.blackmagicdesign.com/products/davinciresolve/training" },
  { pattern:/Adobe After Effects/i, url:"https://www.adobe.com/products/aftereffects.html" },
  { pattern:/Adobe Premiere Pro/i, url:"https://www.adobe.com/products/premiere.html" },
  { pattern:/Adobe Audition/i, url:"https://www.adobe.com/products/audition.html" },
  { pattern:/Adobe Creative Cloud/i, url:"https://www.adobe.com/creativecloud.html" },
  { pattern:/\bAdobe\b/i, url:"https://www.adobe.com/creativecloud.html" },
  { pattern:/Lightroom/i, url:"https://www.adobe.com/products/photoshop-lightroom.html" },
  { pattern:/Photoshop/i, url:"https://www.adobe.com/products/photoshop.html" },
  { pattern:/AutoCAD/i, url:"https://www.autodesk.com/certification/all-certifications/autocad" },
  { pattern:/Autodesk Revit/i, url:"https://www.autodesk.com/certification/all-certifications/revit-architectural-design-professional" },
  { pattern:/Vectorworks/i, url:"https://www.vectorworks.net/training" },
  { pattern:/SketchUp/i, url:"https://learn.sketchup.com/" },
  { pattern:/\bRhino(?:ceros)?\b/i, url:"https://www.rhino3d.com/learn/" },
  { pattern:/SolidWorks/i, url:"https://www.solidworks.com/certifications" },
  { pattern:/ASTM E1050/i, url:"https://www.astm.org/e1050-19.html" },
  { pattern:/Shure Audio Institute/i, url:"https://www.shure.com/en-us/shure-academy/certification" },
  { pattern:/Sennheiser Sound Academy/i, url:"https://www.sennheiser.com/en-us/sound-academy" },
  { pattern:/Lectrosonics/i, url:"https://www.lectrosonics.com/" },
  { pattern:/L-Acoustics/i, url:"https://www.l-acoustics.com/education/" },
  { pattern:/Meyer Sound/i, url:"https://meyersound.com/education/" },
  { pattern:/d&b(?: audiotechnik)?/i, url:"https://www.dbaudio.com/global/en/education/" },
  { pattern:/Adamson/i, url:"https://adamson.ai/education/" },
  { pattern:/Rational Acoustics/i, url:"https://www.rationalacoustics.com/pages/training" },
  { pattern:/\bSmaart\b/i, url:"https://www.rationalacoustics.com/pages/training" },
  { pattern:/\bREW\b/, url:"https://www.roomeqwizard.com/" },
  { pattern:/\bEASE\b/, url:"https://www.afmg.eu/en/training" },
  { pattern:/\bODEON\b/, url:"https://odeon.dk/learn/" },
  { pattern:/SynAudCon/i, url:"https://www.prosoundtraining.com/" },
  { pattern:/grandMA/i, url:"https://www.malighting.com/grandma3/training/" },
  { pattern:/Grand\s+MA/i, url:"https://www.malighting.com/grandma3/training/" },
  { pattern:/MA Lighting/i, url:"https://www.malighting.com/grandma3/training/" },
  { pattern:/Hog console/i, url:"https://www.etcconnect.com/Training/" },
  { pattern:/Brompton Technology/i, url:"https://www.bromptontech.com/training/" },
  { pattern:/NovaStar/i, url:"https://www.novastar.tech/training/" },
  { pattern:/ROE Visual Academy/i, url:"https://www.roevisual.com/en/academy" },
  { pattern:/Christie/i, url:"https://www.christieuniversity.com/" },
  { pattern:/\bBarco\b/i, url:"https://www.barco.com/en/support/training" },
  { pattern:/Panasonic/i, url:"https://na.panasonic.com/us/audio-video-solutions/education-training" },
  { pattern:/\bILDA\b/, url:"https://www.ilda.com/" },
  { pattern:/TRUST certificate/i, url:"https://www.faa.gov/uas/recreational_flyers/knowledge_test_updates" },
  { pattern:/HazMat endorsement/i, url:"https://www.tsa.gov/for-industry/hazmat-endorsement" },
  { pattern:/Forklift(?: \/ warehouse equipment operator)? certification/i, url:"https://www.osha.gov/powered-industrial-trucks" },
  { pattern:/Welding certification/i, url:"https://www.aws.org/certification-and-education/professional-certification/" },
  { pattern:/Ableton Live Certified Trainer/i, url:"https://www.ableton.com/en/certified-training/" },
  { pattern:/\bAbleton Live\b/i, url:"https://www.ableton.com/en/learning-music/" },
  { pattern:/Neve/i, url:"https://www.ams-neve.com/education/" },
  { pattern:/\bSSL\b/, url:"https://www.solidstatelogic.com/support" },
  { pattern:/API console/i, url:"https://apiaudio.com/" },
  { pattern:/Gibson/i, url:"https://www.gibson.com/" },
  { pattern:/Fender/i, url:"https://www.fender.com/articles/techniques" },
  { pattern:/Roland/i, url:"https://www.roland.com/us/learning/" },
  { pattern:/Drum Circle Facilitators Guild/i, url:"https://www.dcfg.org/" },
  { pattern:/HealthRHYTHMS/i, url:"https://remo.com/experience/post/healthrhythms/" },
  { pattern:/ICF-accredited coaching certification/i, url:"https://coachingfederation.org/credentials-and-standards" },
  { pattern:/NASM Wellness Coach/i, url:"https://www.nasm.org/continuing-education/wellness-coach" },
  { pattern:/Guild of Music Supervisors/i, url:"https://www.guildofmusicsupervisors.com/education" },
  { pattern:/IAVM/i, url:"https://iavm.org/education/" },
  { pattern:/TIPS/i, url:"https://www.gettips.com/" },
  { pattern:/ETA Associate Certified Electronics Technician(?: \(CETa\))?/i, url:"https://www.etai.org/assets/fact_sheets/Basic_Electronics.pdf" },
  { pattern:/NIMS CNC (?:Mill|Lathe) Operations/i, url:"https://isv.nims-skills.org/sts/public/credentials/1/list" },
  { pattern:/Steadicam/i, url:"https://steadicam.com/workshops/" },
  { pattern:/\bNAB\b/, url:"https://nabamplify.com/education/" },
  { pattern:/Blackmagic ATEM/i, url:"https://www.blackmagicdesign.com/products/atemmini/training" },
  { pattern:/\bATEM\b/, url:"https://www.blackmagicdesign.com/products/atemmini/training" },
  { pattern:/Ross switcher/i, url:"https://www.rossvideo.com/services/ross-university/" },
  { pattern:/Ross Video/i, url:"https://www.rossvideo.com/services/ross-university/" },
  { pattern:/Ross University/i, url:"https://www.rossvideo.com/resources/ross-university/" },
  { pattern:/Disguise/i, url:"https://www.disguise.one/en/learn-support/training" },
  { pattern:/Resolume/i, url:"https://resolume.com/training" },
  { pattern:/Melodyne/i, url:"https://www.celemony.com/en/start" },
  { pattern:/Estill/i, url:"https://estillvoice.com/courses/" },
  { pattern:/Somatic Voicework/i, url:"https://somaticvoicework.com/" },
  { pattern:/Logic Pro/i, url:"https://training.apple.com/us/en/learn/logic-pro" },
  { pattern:/Cubase/i, url:"https://www.steinberg.net/tutorials/" },
  { pattern:/Max\/MSP/i, url:"https://cycling74.com/learn" },
  { pattern:/Rekordbox/i, url:"https://rekordbox.com/en/learn/" },
  { pattern:/Serato/i, url:"https://serato.com/dj/pro/learn" },
  { pattern:/Avid VENUE/i, url:"https://www.avid.com/learning" },
  { pattern:/DiGiCo/i, url:"https://www.digico.biz/training/" },
  { pattern:/Yamaha/i, url:"https://usa.yamaha.com/products/contents/proaudio/training_support/index.html" },
  { pattern:/Allen & Heath/i, url:"https://www.allen-heath.com/resources/training/" },
  { pattern:/Midas/i, url:"https://www.midasconsoles.com/" },
  { pattern:/iZotope RX/i, url:"https://www.izotope.com/en/learn.html" },
  { pattern:/iZotope Ozone/i, url:"https://www.izotope.com/en/learn.html" },
  { pattern:/\bACX\b/, url:"https://www.acx.com/mp/blog/production-resources" },
  { pattern:/FMOD/i, url:"https://www.fmod.com/learn" },
  { pattern:/Wwise/i, url:"https://www.audiokinetic.com/en/education/learn-wwise/" },
  { pattern:/JUCE/i, url:"https://juce.com/learn/" },
  { pattern:/MDN/i, url:"https://developer.mozilla.org/en-US/docs/Learn_web_development" },
  { pattern:/\bUnity\b/i, url:"https://learn.unity.com/" },
  { pattern:/Unreal Engine/i, url:"https://dev.epicgames.com/community/unreal-engine/learning" },
  { pattern:/QuickBooks/i, url:"https://quickbooks.intuit.com/learn-support/" }
];

function renderCareerPreparationName(item){
  const name = String(item.name || "");
  if(item.url){
    return `<a href="${escapeHTML(item.url)}" target="_blank" rel="noopener">${escapeHTML(name)}</a>`;
  }

  const matches = [];
  CAREER_PREPARATION_LINK_RULES.forEach(rule=>{
    const flags = rule.pattern.flags.includes("g") ? rule.pattern.flags : `${rule.pattern.flags}g`;
    const matcher = new RegExp(rule.pattern.source, flags);
    let match;
    while((match = matcher.exec(name)) !== null){
      matches.push({start:match.index, end:match.index + match[0].length, text:match[0], url:rule.url});
      if(match[0].length === 0) matcher.lastIndex += 1;
    }
  });

  matches.sort((a,b)=>a.start - b.start || b.end - a.end);
  const selected = [];
  matches.forEach(match=>{
    if(selected.some(existing=>match.start < existing.end && match.end > existing.start)) return;
    selected.push(match);
  });
  selected.sort((a,b)=>a.start - b.start);
  if(!selected.length) return escapeHTML(name);

  let output = "";
  let cursor = 0;
  selected.forEach(match=>{
    output += escapeHTML(name.slice(cursor, match.start));
    output += `<a href="${escapeHTML(match.url)}" target="_blank" rel="noopener">${escapeHTML(match.text)}</a>`;
    cursor = match.end;
  });
  return output + escapeHTML(name.slice(cursor));
}

function cleanCareerDevelopmentIdea(value){
  return String(value || "")
    .trim()
    .replace(/^(?:and|or)\s+/i, "")
    .replace(/\s+(?:are|is|can be)\s+useful(?:\s+depending on (?:the )?role|\s+for this role)?\.?$/i, "")
    .replace(/[.;]+$/, "")
    .trim();
}

const VERIFIED_CAREER_DEVELOPMENT_REPLACEMENTS = [
  {
    pattern:/^camera$/i,
    name:"ARRI Academy Certified User Training for Camera Systems",
    url:"https://www.arri.com/en/learn-help/arri-academy/arri-certified-courses/certified-user-training-for-cameras"
  },
  {
    pattern:/^Broadcast camera operation courses \(B&H, NAB, manufacturers\)$/i,
    name:"ARRI Academy Certified User Training for Camera Systems",
    url:"https://www.arri.com/en/learn-help/arri-academy/arri-certified-courses/certified-user-training-for-cameras"
  },
  {
    pattern:/^lighting$/i,
    name:"ARRI Academy Certified User Training for Lighting",
    url:"https://www.arri.com/en/learn-help/arri-academy/arri-certified-courses/certified-user-training-for-lighting"
  },
  {
    pattern:/^(?:production[- ]safety|set safety)(?: training)?(?: can be useful depending on (?:the )?role)?$/i,
    name:"IATSE TTF Safety First! Online Courses",
    url:"https://www.iatsetrainingtrust.org/safetyfirst"
  },
  {
    pattern:/^project[- ]management(?: training)?(?: can help.*)?$/i,
    name:"PMI Certified Associate in Project Management (CAPM)",
    url:"https://www.pmi.org/certifications/certified-associate-capm"
  },
  {
    pattern:/^Excel\/Sheets$/i,
    name:"Microsoft Excel Help & Learning",
    url:"https://support.microsoft.com/en-us/excel/"
  },
  {
    pattern:/^(?:digital marketing|paid media|paid social)$/i,
    name:"Google Skillshop Ads Training and Certification",
    url:"https://skillshop.withgoogle.com/googleads/"
  },
  {
    pattern:/^(?:analytics|marketing analytics|platform analytics|PR analytics)$/i,
    name:"Google Analytics Skillshop Training",
    url:"https://skillshop.withgoogle.com/"
  },
  {
    pattern:/^CRM(?:\/email)?$/i,
    name:"HubSpot Academy CRM Training",
    url:"https://academy.hubspot.com/"
  },
  {
    pattern:/^(?:copyright|copyright\/licensing|music licensing|rights\/licensing training)$/i,
    name:"U.S. Copyright Office Music Modernization Act Educational Materials",
    url:"https://www.copyright.gov/music-modernization/educational-materials/"
  },
  {
    pattern:/^metadata$/i,
    name:"DDEX Knowledge Base",
    url:"https://kb.ddex.net/"
  },
  {
    pattern:/^(?:accounting software training|bookkeeping|basic accounting \/ bookkeeping skills for settlement reporting)$/i,
    name:"QuickBooks Online Training and Certification",
    url:"https://quickbooks.intuit.com/accountants/training-certification/"
  },
  {
    pattern:/^(?:event safety|crowd[- ]management training|emergency[- ]planning)$/i,
    name:"Event Safety Alliance Training and Education",
    url:"https://eventsafetyalliance.org/"
  },
  {
    pattern:/^(?:grant writing|nonprofit management training)(?: \(.*\))?$/i,
    name:"Candid Learning Nonprofit Training",
    url:"https://learning.candid.org/"
  },
  {
    pattern:/^iZotope RX training(?: is| can be)? useful.*$/i,
    name:"iZotope RX Learning Resources",
    url:"https://www.izotope.com/en/learn.html"
  },
  {
    pattern:/^Apple Digital Masters provider knowledge.*$/i,
    name:"Apple Digital Masters Delivery Resources",
    url:"https://www.apple.com/apple-music/apple-digital-masters/"
  },
  {
    pattern:/^CPR\/First Aid is useful.*$/i,
    name:"Red Cross First Aid/CPR/AED Training",
    url:"https://www.redcross.org/take-a-class"
  },
  {
    pattern:/^(?:Vectorworks or lighting visualization training|Vectorworks Spotlight proficiency)$/i,
    name:"Vectorworks Spotlight Training",
    url:"https://www.vectorworks.net/training"
  },
  {
    pattern:/^OSHA(?: 10\/30| 10)? or equivalent safety training$/i,
    name:"OSHA General Industry Outreach Training",
    url:"https://www.osha.gov/training/outreach"
  },
  {
    pattern:/^OSHA or (?:shop|scenic-shop) safety training$/i,
    name:"OSHA 10-Hour General Industry Outreach Training",
    url:"https://www.osha.gov/training/outreach"
  },
  {
    pattern:/^OSHA\/workplace safety$/i,
    name:"OSHA General Industry Outreach Training",
    url:"https://www.osha.gov/training/outreach"
  },
  {
    pattern:/^OSHA\/ETCP electrical safety knowledge$/i,
    name:"ETCP Certified Entertainment Electrician",
    url:"https://etcp.esta.org/"
  },
  {
    pattern:/^ETCP rigging knowledge or certified staff.*$/i,
    name:"ETCP Certified Rigger",
    url:"https://etcp.esta.org/"
  },
  {
    pattern:/^Music wellness-specific training.*$/i,
    name:"NASM Certified Wellness Coach",
    url:"https://www.nasm.org/continuing-education/wellness-coach"
  },
  {
    pattern:/^Pro Tools$/i,
    name:"Avid Pro Tools Learning and Certification",
    url:"https://www.avid.com/learning/certification"
  },
  {
    pattern:/^Adobe\/visual design tools$/i,
    name:"Adobe Creative Cloud Learning Resources",
    url:"https://creativecloud.adobe.com/learn"
  },
  {
    pattern:/^Copyright Office registration knowledge$/i,
    name:"U.S. Copyright Office Registration Learning Resources",
    url:"https://www.copyright.gov/registration/"
  }
];

function matchingCareerPreparationLink(name){
  return CAREER_PREPARATION_LINK_RULES.find(rule=>{
    const matcher = new RegExp(rule.pattern.source, rule.pattern.flags.replace("g", ""));
    return matcher.test(String(name || ""));
  }) || null;
}

function resolveCareerDevelopmentIdeas(item){
  const rawIdeas = splitCareerDevelopmentIdeas(item.name);
  const mayUseSharedUrl = rawIdeas.length === 1 && Boolean(item.url);
  const resolved = [];

  rawIdeas.forEach(idea=>{
    const replacement = VERIFIED_CAREER_DEVELOPMENT_REPLACEMENTS.find(rule=>rule.pattern.test(idea));
    if(replacement){
      resolved.push({...item, name:replacement.name, url:replacement.url, org:"", note:""});
      return;
    }
    if(mayUseSharedUrl){
      resolved.push({...item, name:idea});
      return;
    }
    if(matchingCareerPreparationLink(idea)){
      resolved.push({...item, name:idea, url:"", org:"", note:""});
    }
  });

  const unique = new Map();
  resolved.forEach(idea=>{
    const key = `${String(idea.name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}|${idea.url || ""}`;
    if(!unique.has(key)) unique.set(key, idea);
  });
  return [...unique.values()];
}

function isVerifiedCredentialItem(item){
  const name = String(item.name || "");
  if(item.kind === "requirement" || /\b(?:licensure|required|where applicable)\b/i.test(name)) return true;
  return Boolean(item.url || matchingCareerPreparationLink(item.name));
}

function splitCareerDevelopmentIdeas(name){
  const text = String(name || "").trim();
  if(!text) return [];
  const parts = [];
  let current = "";
  let depth = 0;

  for(const character of text){
    if("([{<".includes(character)) depth += 1;
    if(")]}>".includes(character)) depth = Math.max(0, depth - 1);
    if(depth === 0 && (character === "," || character === ";")){
      if(current.trim()) parts.push(current);
      current = "";
      continue;
    }
    current += character;
  }
  if(current.trim()) parts.push(current);

  const ideas = parts.map(cleanCareerDevelopmentIdea).filter(Boolean);
  return ideas.length ? ideas : [cleanCareerDevelopmentIdea(text)].filter(Boolean);
}

function renderCareerDevelopmentList(ideas){
  return `<ul class="career-development-list">
    ${ideas.map(idea=>`<li class="career-development-item">
      ${renderCareerPreparationName(idea)}
      ${idea.note ? `<div class="job-cert-note">${escapeHTML(idea.note)}</div>` : ""}
    </li>`).join("")}
  </ul>`;
}

function renderCareerPreparationSection(preparation){
  const credentials = (preparation.credentials || []).filter(isVerifiedCredentialItem);
  const training = preparation.training || [];
  const developmentIdeas = training.flatMap(resolveCareerDevelopmentIdeas);
  const uniqueDevelopmentIdeas = [...new Map(developmentIdeas.map(item=>[
    `${String(item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}|${item.url || ""}`,
    item
  ])).values()];
  if(!credentials.length && !uniqueDevelopmentIdeas.length) return "";
  return `<section class="career-training-section">
    <div class="career-workspace-label">Certifications and Career Development</div>
    <div class="job-certs-section">
      ${credentials.map(item=>`<div class="job-cert-item">
        <div class="job-cert-type">${item.kind === "certification" ? "Certification" : "License, permit, or professional requirement"}</div>
        <div class="job-cert-name">${renderCareerPreparationName(item)}</div>
        ${item.org ? `<div class="job-cert-org">${escapeHTML(item.org)}</div>` : ""}
        ${item.note ? `<div class="job-cert-note">${escapeHTML(item.note)}</div>` : ""}
      </div>`).join("")}
      ${uniqueDevelopmentIdeas.length ? `<div class="job-cert-item job-cert-item-training">
        <div class="job-cert-type">Career development</div>
        ${renderCareerDevelopmentList(uniqueDevelopmentIdeas)}
      </div>` : ""}
    </div>
  </section>`;
}

function renderCareerSpecializationsSection(specializations){
  if(!Array.isArray(specializations) || !specializations.length) return "";
  return `<section class="career-specializations-section">
    <div class="career-workspace-label">Backline specializations</div>
    <div class="career-specialization-list">
      ${specializations.map((spec,index)=>`<details class="career-specialization"${index===0 ? " open" : ""}>
        <summary>
          <span>${escapeHTML(spec.title || "Specialization")}</span>
          <span class="career-specialization-icon" aria-hidden="true">+</span>
        </summary>
        ${spec.body ? `<p class="career-specialization-copy">${escapeHTML(spec.body)}</p>` : ""}
        ${Array.isArray(spec.items) && spec.items.length ? `<ul class="career-specialization-items">
          ${spec.items.map(item=>`<li>${escapeHTML(item)}</li>`).join("")}
        </ul>` : ""}
      </details>`).join("")}
    </div>
  </section>`;
}

function buildCareerPathTab(jobName){
  const careerPath = jobCareerPaths[jobName];
  const pathwayNote = jobPathwayNotes[jobName];
  const preparation = getCareerPreparation(jobName);
  const preparationSection = renderCareerPreparationSection(preparation);

  if(Array.isArray(careerPath) && careerPath.length){
    return `<div class="career-workspace-label">Career progression</div>
      <ol class="career-steps">
        ${careerPath.map(stage=>`<li><div><strong>${escapeHTML(stage.stage)}</strong><br>${escapeHTML(stage.desc)}</div></li>`).join("")}
      </ol>${preparationSection}`;
  }

  if(careerPath){
    return `${careerPath.entry ? `<div class="career-entry-box">
        <div class="career-entry-label">Starting point</div>
        <div class="career-entry-text">${escapeHTML(careerPath.entry)}</div>
      </div>` : ""}
      ${careerPath.steps && careerPath.steps.length ? `<div class="career-workspace-label">Career progression</div>
        <ol class="career-steps">${careerPath.steps.map(step=>`<li><div>${escapeHTML(step)}</div></li>`).join("")}</ol>` : ""}
      ${renderCareerSpecializationsSection(careerPath.specializations)}
      ${preparationSection}`;
  }

  if(pathwayNote){
    return `<div class="pathway-note ${escapeHTML(pathwayNote.type || "typical")}">
      <div class="pathway-note-body"><strong>${escapeHTML(pathwayNote.label || "Pathway note")}</strong>${escapeHTML(pathwayNote.body || "")}</div>
    </div>${preparationSection}`;
  }

  return preparationSection;
}

function buildProgramsTab(jobName){
  const category = getCategoryForJob(jobName);
  const data = jobSchools[jobName];
  if(!category || !data) return "";

  const definitions = {
    us: {
      label: "U.S. Programs"
    },
    "outside-us": {
      label: "Programs Outside the U.S."
    }
  };
  const grouped = collectProgramsByGeography(data);
  const available = ["us", "outside-us"].filter(key=>grouped[key].length);
  if(!available.length) return "";

  const tabs = available.length > 1 ? `<div class="career-program-tabs" role="tablist" aria-label="Program locations">
    ${available.map((key,index)=>`<button class="career-program-tab${index===0 ? " active" : ""}" type="button" role="tab" aria-selected="${index===0 ? "true" : "false"}" data-program-tier="${key}" onclick="switchDetailProgramTier(this, '${key}')">${definitions[key].label}</button>`).join("")}
  </div>` : "";

  return `${tabs}
    <div class="career-program-panels">
      ${available.map((key,index)=>`<section class="career-program-panel${index===0 ? " active" : ""}" data-program-panel="${key}">
        ${renderWorkspaceSchoolCards(grouped[key])}
      </section>`).join("")}
    </div>`;
}

function switchDetailWorkspaceTab(button, tabName){
  const workspace = button.closest(".career-workspace");
  if(!workspace) return;
  workspace.querySelectorAll(".career-workspace-tab").forEach(tab=>{
    const isActive = tab === button;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
    tab.setAttribute("tabindex", isActive ? "0" : "-1");
  });
  workspace.querySelectorAll(".career-workspace-panel").forEach(panel=>{
    const isActive = panel.dataset.detailPanel === tabName;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
    if(isActive) panel.scrollTop = 0;
  });
  const constrainedPanel = workspace.closest("#detail-panel.detail-panel-constrained");
  if(constrainedPanel) constrainedPanel.scrollTop = 0;
}

function handleDetailWorkspaceTabKey(event, button){
  if(!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const tabs = [...button.closest(".career-workspace-tabs").querySelectorAll(".career-workspace-tab")];
  if(!tabs.length) return;
  event.preventDefault();
  const current = tabs.indexOf(button);
  let next = current;
  if(event.key === "ArrowRight") next = (current + 1) % tabs.length;
  if(event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
  if(event.key === "Home") next = 0;
  if(event.key === "End") next = tabs.length - 1;
  tabs[next].focus();
  tabs[next].click();
}

function switchDetailProgramTier(button, tierName){
  const workspace = button.closest(".career-workspace-panel");
  if(!workspace) return;
  workspace.querySelectorAll(".career-program-tab").forEach(tab=>{
    const isActive = tab === button;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  workspace.querySelectorAll(".career-program-panel").forEach(panel=>{
    panel.classList.toggle("active", panel.dataset.programPanel === tierName);
  });
}

function buildDetailHTML(jobName, profileFields){
  const [description, responsibilities] = profileFields;
  const responsibilityItems = (responsibilities||"").split(/[;|]/).map(item=>item.trim()).filter(Boolean);
  const category = getCategoryForJob(jobName);
  const degreeLabels = {
    none: "No degree entry",
    assoc: "Certificate / Associate entry",
    bach: "Bachelor's entry",
    grad: "Graduate entry"
  };
  const careerPathContent = buildCareerPathTab(jobName);
  const programsContent = buildProgramsTab(jobName);
  const sections = [
    {
      id: "overview",
      label: "Overview",
      content: `<div class="career-overview-grid">
        <div><div class="career-workspace-label">Description</div><div class="career-workspace-copy">${escapeHTML(description)}</div></div>
        <div><div class="career-workspace-label">Key responsibilities</div><ul class="career-workspace-responsibilities">${responsibilityItems.map(responsibility=>`<li>${escapeHTML(responsibility)}</li>`).join("")}</ul></div>
      </div>`
    },
    ...(careerPathContent ? [{id:"path", label:"Career path", content:careerPathContent}] : []),
    ...(programsContent ? [{id:"programs", label:"Programs", content:programsContent}] : [])
  ];

  return `
    <article class="career-workspace">
      <header class="career-workspace-head">
        <button class="popup-close" type="button" aria-label="Close career details" onclick="closeDetailPanel()">&#x2715;</button>
        <h2 class="popup-title">${escapeHTML(jobName)}</h2>
        <div class="career-workspace-meta">
          <span class="career-workspace-tag">${degreeLabels[getEntryPathForJob(jobName)] || "Career entry"}</span>
          ${category ? `<span class="career-workspace-tag">${escapeHTML(category.label)}</span>` : ""}
        </div>
      </header>
      <nav class="career-workspace-tabs" role="tablist" aria-label="Career profile sections">
        ${sections.map((section,index)=>`<button class="career-workspace-tab${index===0 ? " active" : ""}" type="button" role="tab" aria-selected="${index===0 ? "true" : "false"}" tabindex="${index===0 ? "0" : "-1"}" data-detail-tab="${section.id}" onclick="switchDetailWorkspaceTab(this, '${section.id}')" onkeydown="handleDetailWorkspaceTabKey(event, this)">${section.label}</button>`).join("")}
      </nav>
      <div class="career-workspace-stage">
        ${sections.map((section,index)=>`<section class="career-workspace-panel${index===0 ? " active" : ""}" role="tabpanel" data-detail-panel="${section.id}"${index===0 ? "" : " hidden"}>${section.content}</section>`).join("")}
      </div>
    </article>
  `;
}

let detailPanelResizeFrame = null;

function updateDetailPanelViewportHeight(){
  const panel = document.getElementById("detail-panel");
  if(!panel || isMobile() || !panel.classList.contains("open")) return;
  const rect = panel.getBoundingClientRect();
  const bottomGap = 24;
  const stickyTop = 24;
  const visibleTop = Math.max(rect.top, stickyTop);
  const availableHeight = Math.max(280, window.innerHeight - visibleTop - bottomGap);
  panel.style.setProperty("--detail-panel-available-height", `${availableHeight}px`);
  panel.classList.toggle("detail-panel-constrained", availableHeight < 560);
}

function scheduleDetailPanelViewportHeight(){
  if(detailPanelResizeFrame) return;
  detailPanelResizeFrame = requestAnimationFrame(()=>{
    detailPanelResizeFrame = null;
    updateDetailPanelViewportHeight();
  });
}

function scrollCareerDetailIntoView(){
  const workspace = document.querySelector('.redesign-product-window');
  const panel = document.getElementById("detail-panel");
  const layout = document.getElementById("app-layout");
  if(!panel || isMobile() || !panel.classList.contains("open")) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anchor = workspace?.dataset.workspace === 'job' && layout ? layout : panel;
  const targetTop = Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - 24);
  window.scrollTo({
    top: targetTop,
    behavior: reduceMotion ? 'auto' : 'smooth'
  });

  [0, 120, 280, 520].forEach(delay=>{
    window.setTimeout(scheduleDetailPanelViewportHeight, delay);
  });
}

function openDetailPanel(jobName, html){
  const panel = document.getElementById("detail-panel");
  const panelInner = document.getElementById("detail-inner");
  const drawerInner = document.getElementById("detail-drawer-inner");
  const drawer = document.getElementById("detail-drawer");
  const overlay = document.getElementById("drawer-overlay");
  if(isMobile()){
    drawerInner.innerHTML = html;
    drawer.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  } else {
    panelInner.innerHTML = html;
    panel.classList.add("open");
    overlay.classList.add("open");
    document.body.classList.add("detail-modal-open");
  }
  const activeSection = (isMobile() ? drawerInner : panelInner).querySelector(".career-workspace-panel.active");
  if(activeSection) activeSection.scrollTop = 0;
}

function closeDetailPanel(){
  activeJobName = null;
  document.querySelectorAll(".job-tag.active").forEach(jobButton=>jobButton.classList.remove("active"));
  const panel = document.getElementById("detail-panel");
  panel.classList.remove("open");
  panel.classList.remove("detail-panel-constrained");
  panel.style.removeProperty("--detail-panel-available-height");
  document.getElementById("detail-drawer").classList.remove("open");
  document.getElementById("drawer-overlay").classList.remove("open");
  document.body.classList.remove("detail-modal-open");
  document.body.style.overflow = "";
}

function slugify(str){
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

const jobSlugMap = {};
(function buildSlugMap(){
  for(const category of categories){
    for(const jobName of category.jobs){
      jobSlugMap[slugify(jobName)] = jobName;
    }
  }
})();

function openJob(jobName, clickedJobButton){
  if(activeJobName===jobName){ closeDetailPanel(); return; }
  closeDetailPanel();
  activeJobName = jobName;
  if(clickedJobButton) clickedJobButton.classList.add("active");
  const profileFields = getJobProfileFields(jobName);
  if(activeJobName===jobName) openDetailPanel(jobName, buildDetailHTML(jobName, profileFields));
}

function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[char]));
}

function resolveSchoolUrl(schoolName) {
  if(schoolUrls[schoolName]) return schoolUrls[schoolName];
  const base = schoolName.replace(/\s*\(.*\)\s*$/, '').trim();
  for (const [key, val] of Object.entries(schoolUrls)) {
    if (key.startsWith(base) || key.includes(base)) return val;
  }
  return "";
}

function schoolLink(schoolName, explicitUrl = "") {
  const safeName = escapeHTML(schoolName);
  const url = explicitUrl || resolveSchoolUrl(schoolName);
  return url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${safeName}</a>` : safeName;
}

function selectedJobButton(jobName){
  const selected = selectedJobs.has(jobName);
  const slug = slugify(jobName);
  return `<button class="job-select-toggle${selected ? " selected" : ""}" type="button" data-select-job-id="${slug}" aria-pressed="${selected}" aria-label="${selected ? "Remove from program matches" : "Add to program matches"}: ${escapeHTML(jobName)}" title="${selected ? "Remove from program matches" : "Add to program matches"}"><span aria-hidden="true">${selected ? "✓" : "+"}</span></button>`;
}

function renderJobChoice(job, extraClass=""){
  const selected = selectedJobs.has(job);
  const active = activeJobName === job;
  const extra = extraClass ? ` ${extraClass}` : "";
  return `<div class="job-select-wrap${selected ? " selected" : ""}">
    <button class="job-tag${extra}${active ? " active" : ""}" type="button" data-job-id="${slugify(job)}" aria-label="${escapeHTML(job)}"><span class="job-dot"></span><span class="job-tag-label">${escapeHTML(job)}</span></button>
    ${selectedJobButton(job)}
  </div>`;
}

function toggleJobSelection(jobName){
  if(selectedJobs.has(jobName)) selectedJobs.delete(jobName);
  else selectedJobs.add(jobName);
  syncSelectedJobControls();
  updateCompareTray();
}

function clearSelectedJobs(){
  selectedJobs.clear();
  syncSelectedJobControls();
  updateCompareTray();
  closeCompareResults();
}

function removeSelectedJob(jobName){
  selectedJobs.delete(jobName);
  syncSelectedJobControls();
  updateCompareTray();
  if(document.getElementById("compare-overlay").classList.contains("open")) renderCompareResults();
}

function removeSelectedJobBySlug(slug){
  const jobName = jobSlugMap[slug];
  if(jobName) removeSelectedJob(jobName);
}

function syncSelectedJobControls(){
  document.querySelectorAll(".job-select-wrap, .orch-parent-row").forEach(jobChoiceContainer=>{
    const jobButton = jobChoiceContainer.querySelector(".job-tag");
    const jobName = jobButton ? jobSlugMap[jobButton.dataset.jobId] : null;
    jobChoiceContainer.classList.toggle("selected", !!jobName && selectedJobs.has(jobName));
  });
  document.querySelectorAll(".job-select-toggle").forEach(selectToggleButton=>{
    const jobName = jobSlugMap[selectToggleButton.dataset.selectJobId];
    const selected = !!jobName && selectedJobs.has(jobName);
    selectToggleButton.classList.toggle("selected", selected);
    selectToggleButton.setAttribute("aria-pressed", String(selected));
    selectToggleButton.setAttribute("aria-label", `${selected ? "Remove from program matches" : "Add to program matches"}: ${jobName || "job"}`);
    selectToggleButton.title = selected ? "Remove from program matches" : "Add to program matches";
    selectToggleButton.innerHTML = `<span aria-hidden="true">${selected ? "✓" : "+"}</span>`;
  });
}

function updateCompareTray(){
  const tray = document.getElementById("compare-tray");
  const countEl = document.getElementById("compare-count");
  const listEl = document.getElementById("compare-selected-list");
  const runBtn = document.getElementById("compare-run-btn");
  if(!tray || !countEl || !listEl || !runBtn) return;
  const jobs = [...selectedJobs];
  tray.classList.toggle("has-selection", jobs.length > 0);
  countEl.textContent = `${jobs.length} selected`;
  runBtn.disabled = jobs.length < 2;
  listEl.innerHTML = jobs.length
    ? jobs.map(job=>`<span class="compare-selected-chip">${escapeHTML(job)} <button class="compare-chip-remove" type="button" onclick="removeSelectedJobBySlug('${slugify(job)}')" aria-label="Remove ${escapeHTML(job)}">×</button></span>`).join("")
    : "";
}

function getCoverageMatches(){
  const selected = [...selectedJobs];
  const results = {};
  COVERAGE_TIERS.forEach(tier => results[tier.id] = new Map());

  selected.forEach(job=>{
    const tiers = jobSchools[job];
    if(!tiers) return;
    const grouped = collectProgramsByGeography(tiers);
    COVERAGE_TIERS.forEach(({id})=>{
      const programs = grouped[id];
      if(!Array.isArray(programs)) return;
      programs.forEach(program=>{
        const name = program.name;
        if(!name) return;
        if(!results[id].has(name)){
          results[id].set(name, {
            name,
            url: program.url || "",
            desc: program.description || "",
            sourceTiers: new Set(program.sourceTiers || []),
            badges: [...(program.badges || [])],
            jobs: new Set()
          });
        }
        const entry = results[id].get(name);
        entry.jobs.add(job);
        if(program.url && !entry.url) entry.url = program.url;
        program.sourceTiers?.forEach(tier=>entry.sourceTiers.add(tier));
        (program.badges || []).forEach(badge=>{ if(!entry.badges.includes(badge)) entry.badges.push(badge); });
        if(program.description && !entry.desc.includes(program.description)) entry.desc = entry.desc ? `${entry.desc} ${program.description}` : program.description;
      });
    });
  });

  return Object.fromEntries(COVERAGE_TIERS.map(({id}) => {
    const sorted = [...results[id].values()]
      .sort((a,b)=>b.jobs.size - a.jobs.size || a.name.localeCompare(b.name));
    return [id, sorted];
  }));
}

function renderCompareResults(){
  const selected = [...selectedJobs];
  const resultsEl = document.getElementById("compare-results");
  if(!resultsEl) return;

  if(selected.length < 2){
    resultsEl.innerHTML = "";
    return;
  }

  const matches = getCoverageMatches();
  const selectedHTML = `<div class="compare-selected-summary">${selected.map(job=>`<span class="compare-selected-chip">${escapeHTML(job)}</span>`).join("")}</div>`;
  const sections = COVERAGE_TIERS.map(({id,label})=>{
    const cards = matches[id] || [];
    if(!cards.length){
      return `<section class="compare-result-section">
        <div class="compare-result-heading">${label}</div>
        <div class="compare-empty">No programs in this category overlap with your selected jobs yet.</div>
      </section>`;
    }
    return `<section class="compare-result-section">
      <div class="compare-result-heading">${label}</div>
      <div class="compare-result-grid">
        ${cards.map(card=>{
          const matched = [...card.jobs];
          const gaps = selected.filter(job=>!card.jobs.has(job));
          const desc = card.desc ? `<div class="compare-result-desc">${escapeHTML(card.desc)}</div>` : "";
          return `<article class="compare-result-card">
            <div class="compare-result-name">${schoolLink(card.name, card.url)}</div>
            <div class="compare-result-score">Listed for ${matched.length} of ${selected.length} selected jobs</div>
            ${renderProgramFacts({...card, description:card.desc})}
            ${desc}
            <div class="compare-match-list"><strong>Matches:</strong> ${matched.map(escapeHTML).join(", ")}</div>
            ${gaps.length ? `<div class="compare-gap-list"><strong>Not listed for:</strong> ${gaps.map(escapeHTML).join(", ")}</div>` : ""}
          </article>`;
        }).join("")}
      </div>
    </section>`;
  }).join("");
  resultsEl.innerHTML = selectedHTML + sections;
}

function openCompareResults(){
  if(selectedJobs.size < 2) return;
  closeDetailPanel();
  renderCompareResults();
  document.getElementById("compare-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCompareResults(){
  const overlay = document.getElementById("compare-overlay");
  if(overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
}

function completeIndexIsActive(){
  const workspace = document.querySelector('.redesign-product-window');
  return Boolean(workspace && ['index', 'compare'].includes(workspace.dataset.workspace));
}

function alphabetizedIndexCategories(){
  return [...categories].sort((a,b)=>a.label.localeCompare(b.label, undefined, {sensitivity:'base'}));
}

function renderIndexOverview(){
  const ordered = alphabetizedIndexCategories();
  return `<section class="index-overview" aria-label="Career areas">
    <div class="index-overview-grid">
      ${ordered.map(cat=>`<button class="index-overview-item" type="button" onclick="setIndexCategory('${cat.id}')">
        <span class="index-overview-name">${cat.label}</span>
        <span class="index-overview-meta">${cat.jobs.length} ${cat.jobs.length === 1 ? 'career' : 'careers'}</span>
      </button>`).join('')}
    </div>
  </section>`;
}

function setIndexCategory(categoryId){
  activeIndexCategoryId = categoryId || null;
  activeCareerAreaFilter = 'all';
  activeEntryPathFilter = 'all';
  currentSearchQuery = '';
  closeDetailPanel();
  renderCareerResults();
}

function renderCareerResults(){
  const isCompleteIndex = completeIndexIsActive();
  const filteredCategories = getFilteredCareerCategories();
  const visibleJobCount = filteredCategories.reduce((total, category)=>total + category.jobs.length,0);
  const statsEl = document.getElementById("stats");
  if(isCompleteIndex){
    const selectedCategory = activeIndexCategoryId ? categories.find(cat=>cat.id === activeIndexCategoryId) : null;
    statsEl.textContent = selectedCategory
      ? `${visibleJobCount.toLocaleString()} careers in ${selectedCategory.label}`
      : `${getVisibleJobCount().toLocaleString()} careers across ${categories.length} areas`;
  } else {
    statsEl.textContent=`${visibleJobCount.toLocaleString()} of ${getVisibleJobCount().toLocaleString()} jobs`;
  }
  syncFocusedWorkspaceResults();
  
  updatePathwayFilterControls();
  
  const contentEl=document.getElementById("content");

  const bannerEl = document.getElementById("school-banner");
  if(bannerEl){
    if(activeSearchMode==="school" && currentSearchQuery.trim()){
      const schoolMatchCount = filteredCategories.reduce((total, category)=>total + category.jobs.length,0);
      const nameList = schoolSearchSummaryLabel(currentSearchQuery);
      bannerEl.innerHTML = `Showing <strong>${schoolMatchCount} job${schoolMatchCount!==1?"s":""}</strong> where <strong>${nameList||currentSearchQuery}</strong> is listed
        <span class="banner-clear" onclick="clearSchoolSearch()" title="Clear school search">Clear</span>`;
      bannerEl.style.display = "flex";
    } else {
      bannerEl.style.display = "none";
    }
  }

  if(isCompleteIndex && !activeIndexCategoryId){
    activeJobName = null;
    contentEl.innerHTML = renderIndexOverview();
    updateCompareTray();
    return;
  }

  if(!filteredCategories.length){
    contentEl.innerHTML=`<div class="no-results">No jobs match your ${activeSearchMode==="school"?"school":"job title"} search.</div>`;
    updateCompareTray();
    return;
  }
  activeJobName=null;
  
  const isSearching = currentSearchQuery.length > 0;
  contentEl.innerHTML=filteredCategories.map(category=>{
    const groups=groupJobsByEntryPath(category.jobs);
    const showLabels=!currentSearchQuery.length&&activeEntryPathFilter==="all";
    const hasGuideFilter=activeEntryPathFilter!=="all"||activeCareerAreaFilter!=="all";
    const categorySectionId='cat-'+category.label.replace(/[^a-z0-9]/gi,'-').toLowerCase();
    const groupsHtml=DEG_ORDER.map(entryPathKey=>{
      const jobs=groups[entryPathKey];if(!jobs.length)return"";
      const entryPathGroupId=categorySectionId+'-'+entryPathKey;
      const entryPathGroupCollapsed=!isCompleteIndex&&showLabels&&!isSearching&&!hasGuideFilter?'collapsed':'';
      const label=showLabels
        ?`<div class="deg-group-label" onclick="toggleDegGroup('${entryPathGroupId}')" role="button" tabindex="0"><span>${DEG_LABEL[entryPathKey]}</span><svg class="deg-group-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>`
        :'';
      return`<div class="deg-group ${entryPathGroupCollapsed}" id="${entryPathGroupId}">${label}<div class="jobs-grid">${jobs.map(jobName=>renderJobChoice(jobName)).join("")}</div></div>`;
    }).join("");
    const chevronSvg=isCompleteIndex ? '' : `<svg class="section-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
    const headerAction=isCompleteIndex ? '' : ` onclick="toggleSection('${categorySectionId}')" role="button" tabindex="0"`;
    const indexReturn = isCompleteIndex ? `<button class="index-overview-back" type="button" onclick="setIndexCategory('')"><span aria-hidden="true">&#8592;</span> All Career Areas</button>` : '';
    return`${indexReturn}<div class="section${isCompleteIndex ? ' index-focused-section' : ''}" id="${categorySectionId}"><div class="section-header"${headerAction}><span class="section-title">${category.label}</span><span class="section-count">${category.jobs.length} ${category.jobs.length===1?"role":"roles"}</span>${chevronSvg}</div><div class="section-body">${groupsHtml}</div></div>`;
  }).join("");
  syncSelectedJobControls();
  updateCompareTray();
}

function toggleSection(sectionId){
  const section = document.getElementById(sectionId);
  if(section) section.classList.toggle('collapsed');
}
function toggleDegGroup(entryPathGroupId){
  const entryPathGroup = document.getElementById(entryPathGroupId);
  if(entryPathGroup) entryPathGroup.classList.toggle('collapsed');
}

function closeFilterDropdown(){
  isFilterDropdownOpen=false;
  if(document.getElementById("filter-dropdown")) document.getElementById("filter-dropdown").classList.remove("open");
}
function setCareerAreaFilter(categoryId){
  activeJobName = null;
  activeCareerAreaFilter = categoryId;
  closeDetailPanel();
  closeFilterDropdown();
  renderCareerResults();
}
function setEntryPathFilter(entryPathId){
  activeJobName = null;
  activeEntryPathFilter = entryPathId;
  closeDetailPanel();
  renderCareerResults();
  const workspace = document.querySelector('.redesign-product-window[data-workspace="pathway"]');
  const content = document.getElementById('content');
  if(workspace && content && isMobile() && entryPathId !== 'all'){
    window.requestAnimationFrame(() => {
      content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
function handleSearchInput(searchValue){
  activeJobName=null;
  if(activeSearchMode === "school") activeSchoolSelection = null;
  currentSearchQuery = searchValue;
  renderCareerResults();
  if(activeSearchMode === "school") openSchoolBrowser();
}

const schoolSearchInput = document.getElementById("search");
const schoolBrowserElement = document.getElementById("school-browser");

schoolSearchInput.addEventListener("input",function(){handleSearchInput(this.value);});
schoolSearchInput.addEventListener("focus",function(){
  if(activeSearchMode === "school") openSchoolBrowser();
});
schoolSearchInput.addEventListener("keydown",function(event){
  if(activeSearchMode !== "school") return;
  if(event.key === "ArrowDown"){
    const firstOption = document.querySelector("#school-browser-list .school-browser-option");
    if(firstOption){
      event.preventDefault();
      firstOption.focus();
    }
  }else if(event.key === "Escape"){
    closeSchoolBrowser();
  }
});

schoolBrowserElement.addEventListener("click", function(event){
  event.stopPropagation();
  const sortButton = event.target.closest("[data-school-sort]");
  if(sortButton){
    schoolBrowserSortMode = sortButton.dataset.schoolSort;
    renderSchoolBrowser();
    const activeSort = schoolBrowserElement.querySelector(`[data-school-sort="${schoolBrowserSortMode}"]`);
    if(activeSort) activeSort.focus();
    return;
  }
  const categoryButton = event.target.closest("[data-school-category]");
  if(categoryButton){
    activeSchoolBrowserCategory = categoryButton.dataset.schoolCategory;
    renderSchoolBrowser();
    const activeCategory = schoolBrowserElement.querySelector(`[data-school-category="${activeSchoolBrowserCategory}"]`);
    if(activeCategory) activeCategory.focus();
    return;
  }
  const option = event.target.closest("[data-school-type][data-school-key]");
  if(option) selectSchoolBrowserItem(option.dataset.schoolType, option.dataset.schoolKey);
});

schoolBrowserElement.addEventListener("keydown", function(event){
  if(!["ArrowDown", "ArrowUp", "Escape"].includes(event.key)) return;
  if(event.key === "Escape"){
    event.preventDefault();
    closeSchoolBrowser();
    schoolSearchInput.focus();
    return;
  }
  const options = [...schoolBrowserElement.querySelectorAll(".school-browser-option")];
  const currentIndex = options.indexOf(document.activeElement);
  if(currentIndex < 0 || !options.length) return;
  event.preventDefault();
  const direction = event.key === "ArrowDown" ? 1 : -1;
  options[(currentIndex + direction + options.length) % options.length].focus();
});

document.addEventListener("click", function(event){
  const shell = document.querySelector(".school-search-shell");
  if(isSchoolBrowserOpen && shell && !event.composedPath().includes(shell)) closeSchoolBrowser();
});
window.addEventListener("resize",()=>{
  scheduleDetailPanelViewportHeight();
  if(!isMobile() && document.getElementById("detail-drawer").classList.contains("open")){
    const jobName = activeJobName;
    closeDetailPanel();
    if(jobName){
      activeJobName = jobName;
      const activeJobButton = document.querySelector(".job-tag.active");
      const data = getJobProfileFields(jobName);
      document.getElementById("detail-inner").innerHTML = buildDetailHTML(jobName, data);
      document.getElementById("detail-panel").classList.add("open");
      document.getElementById("detail-panel").scrollTop = 0;
      scheduleDetailPanelViewportHeight();
      if(activeJobButton) activeJobButton.classList.add("active");
    }
  }
});
window.addEventListener("scroll", scheduleDetailPanelViewportHeight, { passive:true });

document.addEventListener("keydown", function(event){
  if(event.key === "Escape" && document.getElementById("compare-overlay").classList.contains("open")){
    closeCompareResults();
    return;
  }
  if(event.key === "Escape" && (
    document.getElementById("detail-drawer").classList.contains("open") ||
    document.getElementById("detail-panel").classList.contains("open")
  )){
    closeDetailPanel();
  }
});
renderCareerResults();

document.getElementById("compare-overlay").addEventListener("click", function(event){
  if(event.target === this) closeCompareResults();
});

  document.getElementById('content').addEventListener('click', function(event){
    const selectJobButton = event.target.closest('.job-select-toggle');
    if(selectJobButton){
      const jobName = jobSlugMap[selectJobButton.dataset.selectJobId];
      if(jobName) toggleJobSelection(jobName);
      return;
    }
    const clickedJobButton = event.target.closest('.job-tag');
    if(!clickedJobButton) return;
    const jobSlug = clickedJobButton.dataset.jobId;
    if(!jobSlug) return;
    const jobName = jobSlugMap[jobSlug];
    if(!jobName) return;
    openJob(jobName, clickedJobButton);
  });

  document.addEventListener('keydown', function(event){
    if((event.key === 'Enter' || event.key === ' ') && event.target.getAttribute('role') === 'button'){
      event.preventDefault();
      event.target.click();
    }
  });







function openPolicy(key) {
  const modal = document.getElementById('modal-' + key);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.addEventListener('click', function(event) {
      if (event.target === modal) closePolicy(key);
    }, { once: true });
    document.addEventListener('keydown', function closePolicyOnEscape(event) {
      if (event.key === 'Escape') {
        closePolicy(key);
        document.removeEventListener('keydown', closePolicyOnEscape);
      }
    });
  }
}
function closePolicy(key) {
  const modal = document.getElementById('modal-' + key);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function initFeedbackForm() {
  const feedbackForm = document.getElementById('track-feedback-form');
  const feedbackSuccess = document.getElementById('feedback-success');

  if (!feedbackForm || feedbackForm.dataset.feedbackReady === 'true') return;
  feedbackForm.dataset.feedbackReady = 'true';

  feedbackForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(feedbackForm);
    const isLocalPreview = window.location.protocol === 'file:' ||
      ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

    if (isLocalPreview) {
      alert('Feedback can only be sent from the live site. This local preview will not send a submission.');
      return;
    }

    try {
      const response = await fetch(feedbackForm.getAttribute('action') || '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (response.ok) {
        feedbackForm.reset();
        if (feedbackSuccess) {
          feedbackSuccess.textContent = 'Thank you - your feedback was sent.';
          feedbackSuccess.classList.add('show');
        }
      } else {
        alert('There was a problem sending your feedback. Please try again.');
      }
    } catch (error) {
      alert('There was a problem sending your feedback. Please try again.');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeedbackForm);
} else {
  initFeedbackForm();
}

const redesignWorkspaceCopy = {
  job: {
    title: 'Search By Job',
    description: ''
  },
  school: {
    title: 'Search By School',
    description: ''
  },
  pathway: {
    title: 'Pick An Entry Path',
    description: ''
  },
  compare: {
    title: 'Compare Schools',
    description: ''
  },
  index: {
    title: 'Complete Index of Jobs',
    description: ''
  },
  all: {
    title: 'Use the career index',
    description: 'Search hundreds of music-industry careers, compare training routes, and see which schools support the work you are considering'
  }
};

function setRedesignWorkspace(view) {
  const workspace = document.querySelector('.redesign-product-window');
  const title = document.getElementById('redesign-workspace-title');
  const description = document.getElementById('redesign-workspace-description');
  const copy = redesignWorkspaceCopy[view] || redesignWorkspaceCopy.all;
  if (!workspace || !title || !description) return;

  workspace.dataset.workspace = view;
  if (view === 'all') workspace.classList.remove('workspace-waiting');
  title.textContent = copy.title;
  description.textContent = copy.description;
  description.hidden = !copy.description;
  window.requestAnimationFrame(updateSchoolBackToTop);
}

function updateSchoolBackToTop() {
  const button = document.getElementById('school-back-to-top');
  const workspace = document.querySelector('.redesign-product-window');
  const schoolControls = document.querySelector('.redesign-product-window[data-workspace="school"] .school-browser-head');
  const schoolBrowser = document.getElementById('school-browser');
  if (!button) return;

  const shouldShow = Boolean(
    workspace &&
    workspace.dataset.workspace === 'school' &&
    schoolControls &&
    schoolBrowser &&
    schoolBrowser.classList.contains('open') &&
    schoolControls.getBoundingClientRect().bottom < 0
  );

  button.classList.toggle('visible', shouldShow);
  button.setAttribute('aria-hidden', String(!shouldShow));
  button.tabIndex = shouldShow ? 0 : -1;
}

function scrollSchoolSearchToTop() {
  const searchInput = document.querySelector('.redesign-product-window[data-workspace="school"] #search');
  if (!searchInput) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  searchInput.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function scrollWorkspaceToTop() {
  const workspace = document.querySelector('.redesign-product-window');
  if (!workspace) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  workspace.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function openSearchWorkspace(event, view) {
  if (event) event.preventDefault();

  activeCareerAreaFilter = 'all';
  activeEntryPathFilter = 'all';
  if (view === 'index' || view === 'compare') activeIndexCategoryId = null;
  setRedesignWorkspace(view);

  const mode = view === 'school' ? 'school' : 'job';
  if (typeof setSearchMode === 'function') setSearchMode(mode, { focus: false });

  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.placeholder = view === 'school'
      ? 'Search or choose a school, program, or state'
      : view === 'compare'
        ? 'Search jobs to compare'
        : 'Search jobs';
  }

  scrollWorkspaceToTop();

  window.setTimeout(function () {
    scrollWorkspaceToTop();
    if (view === 'pathway') {
      const pathwaySelect = document.getElementById('pathway-degree-trigger');
      if (pathwaySelect) pathwaySelect.focus({ preventScroll: true });
    } else if (searchInput && view !== 'index') {
      searchInput.focus({ preventScroll: true });
      if (view === 'school') openSchoolBrowser();
    }
  }, 550);
}

function returnToSearchChoices() {
  const searchChoices = document.querySelector('.redesign-hero-searches');
  closeSchoolBrowser();
  activeIndexCategoryId = null;
  setRedesignWorkspace('index');
  renderCareerResults();
  if (searchChoices) searchChoices.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

(function () {
  const schoolBackToTop = document.getElementById('school-back-to-top');
  if (schoolBackToTop) schoolBackToTop.addEventListener('click', scrollSchoolSearchToTop);
  window.addEventListener('scroll', updateSchoolBackToTop, { passive: true });
  window.addEventListener('resize', updateSchoolBackToTop);
  updateSchoolBackToTop();

  const menu = document.querySelector('.redesign-intro-menu');
  const menuToggle = document.querySelector('.redesign-menu-toggle');
  const menuLinks = document.getElementById('redesign-search-menu');

  function setMenuOpen(open) {
    if (!menu || !menuToggle || !menuLinks) return;
    menu.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuLinks.setAttribute('aria-hidden', String(!open));
    menuLinks.toggleAttribute('inert', !open);
  }

  if (menu && menuToggle && menuLinks) {
    menuToggle.addEventListener('click', function () {
      setMenuOpen(!menu.classList.contains('menu-open'));
    });

    menuLinks.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenuOpen(false);
    });

    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) setMenuOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !menu.classList.contains('menu-open')) return;
      setMenuOpen(false);
      menuToggle.focus();
    });
  }

  const heroStage = document.querySelector('.redesign-hero');
  const heroSticky = document.querySelector('.redesign-hero-sticky');
  let heroFrame = 0;

  function clampHeroValue(value) {
    return Math.max(0, Math.min(1, value));
  }

  function updateHeroTransition() {
    heroFrame = 0;
    if (!heroStage || !heroSticky) return;

    const travel = Math.max(1, heroStage.offsetHeight - window.innerHeight);
    const progress = clampHeroValue(-heroStage.getBoundingClientRect().top / travel);
    const titleOpacity = clampHeroValue(1 - (progress / 0.28));
    const cardOpacity = clampHeroValue((progress - 0.34) / 0.2);

    heroStage.style.setProperty('--intro-progress', progress.toFixed(3));
    heroStage.style.setProperty('--intro-title-opacity', titleOpacity.toFixed(3));
    heroStage.style.setProperty('--intro-card-opacity', cardOpacity.toFixed(3));
    heroStage.style.setProperty('--intro-reel-opacity', (0.28 - progress * 0.16).toFixed(3));
    heroStage.style.setProperty('--intro-reel-scale', (1 + progress * 0.65).toFixed(3));
    heroStage.style.setProperty('--intro-reel-blur', (1 + progress * 5).toFixed(2) + 'px');
    heroStage.style.setProperty('--intro-wash-opacity', (progress * 0.46).toFixed(3));
    heroSticky.classList.toggle('search-ready', cardOpacity > 0.55);
  }

  function requestHeroTransition() {
    if (heroFrame) return;
    heroFrame = window.requestAnimationFrame(updateHeroTransition);
  }

  window.addEventListener('scroll', requestHeroTransition, { passive: true });
  window.addEventListener('resize', requestHeroTransition);
  updateHeroTransition();

  const nodes = document.querySelectorAll('.redesign-reveal');
  if (!('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.16 });

  nodes.forEach((node) => observer.observe(node));
})();
