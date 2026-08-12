/**
 * Mapping of Main Egg Rate Hubs (NECC / Primary Markets) to their sub-cities / regional markets.
 * When daily rates are published for a main city (e.g. Mumbai, Delhi, Bengaluru),
 * all associated sub-cities inherit or sync that rate data.
 */

export const CITY_CLUSTERS: Record<string, string[]> = {
  mumbai: [
    "mumbai",
    "thane",
    "navi-mumbai",
    "kalyan",
    "palghar",
    "ratnagiri",
    "suburban-mumbai",
    "mumbai-suburban",
    "panvel",
    "vasai-virar",
    "mira-bhayandar",
    "dombivli",
    "bhiwandi",
    "raigad",
  ],
  pune: [
    "pune",
    "pimpri-chinchwad",
    "satara",
    "ahmednagar",
    "solapur",
    "kolhapur",
    "sangli",
  ],
  delhi: [
    "delhi",
    "new-delhi",
    "gurugram",
    "gurgaon",
    "faridabad",
    "noida",
    "greater-noida",
    "ghaziabad",
    "bahadurgarh",
    "sonipat",
    "panipat",
  ],
  bengaluru: [
    "bengaluru",
    "bangalore",
    "tumkur",
    "mandya",
    "mysuru",
    "mysore",
    "hassan",
    "kolar",
    "chikkaballapur",
    "ramanagara",
    "udupi",
  ],
  hyderabad: [
    "hyderabad",
    "secunderabad",
    "cyberabad",
    "rangareddy",
    "sangareddy",
    "medak",
    "nizamabad",
    "khammam",
    "mahbubnagar",
    "karimnagar",
    "warangal",
  ],
  ahmedabad: [
    "ahmedabad",
    "gandhinagar",
    "anand",
    "nadiad",
    "mehsana",
    "sanand",
    "kheda",
    "rajkot",
    "jamnagar",
    "junagadh",
    "bhavnagar",
    "morbi",
  ],
  surat: [
    "surat",
    "navsari",
    "valsad",
    "vapi",
    "bharuch",
  ],
  kolkata: [
    "kolkata",
    "howrah",
    "hooghly",
    "asansol",
    "durgapur",
    "siliguri",
    "kharagpur",
    "haldia",
    "bardhaman",
  ],
  chennai: [
    "chennai",
    "kanchipuram",
    "chengalpattu",
    "tiruvallur",
    "vellore",
  ],
  namakkal: [
    "namakkal",
    "salem",
    "erode",
    "karur",
    "dindigul",
    "tiruppur",
    "coimbatore",
    "trichy",
    "madurai",
  ],
  barwala: [
    "barwala",
    "hisar",
    "jind",
    "rohtak",
    "bhiwani",
    "sirsa",
    "ambala",
    "karnal",
    "yamunanagar",
    "panchkula",
    "chandigarh",
    "shimla",
    "solan",
    "mandi",
  ],
  ludhiana: [
    "ludhiana",
    "jalandhar",
    "amritsar",
    "patiala",
    "bathinda",
    "mohali",
    "pathankot",
    "hoshiarpur",
    "phagwara",
  ],
  vijayawada: [
    "vijayawada",
    "guntur",
    "tenali",
    "eluru",
    "machilipatnam",
    "ongole",
    "kakinada",
    "rajahmundry",
  ],
  visakhapatnam: [
    "visakhapatnam",
    "vizag",
    "srikakulam",
    "vizianagaram",
    "anakapalle",
  ],
  chittoor: [
    "chittoor",
    "tirupati",
    "kurnool",
    "anantapur",
    "kadapa",
    "hindupur",
    "proddatur",
    "nellore",
  ],
  patna: [
    "patna",
    "gaya",
    "muzaffarpur",
    "bhagalpur",
    "darbhanga",
    "purnia",
    "bihar-sharif",
    "munger",
    "arrah",
    "begusarai",
    "samastipur",
    "hajipur",
    "chhapra",
    "siwan",
    "bettiah",
    "motihari",
    "saharsa",
    "katihar",
  ],
  ranchi: [
    "ranchi",
    "jamshedpur",
    "dhanbad",
    "bokaro",
    "deoghar",
    "hazaribagh",
    "giridih",
    "ramgarh",
    "dumka",
  ],
  raipur: [
    "raipur",
    "bhilai",
    "bilaspur",
    "korba",
    "durg",
    "rajnandgaon",
    "jagdalpur",
    "ambikapur",
  ],
  bhopal: [
    "bhopal",
    "indore",
    "jabalpur",
    "gwalior",
    "ujjain",
    "sagar",
    "satna",
    "rewa",
    "ratlam",
    "dewas",
    "burhanpur",
    "khandwa",
    "chhindwara",
  ],
  nagpur: [
    "nagpur",
    "amravati",
    "akola",
    "chandrapur",
    "nanded",
    "yavatmal",
    "wardha",
    "gondia",
  ],
  kanpur: [
    "kanpur",
    "lucknow",
    "prayagraj",
    "varanasi",
    "agra",
    "meerut",
    "bareilly",
    "aligarh",
    "moradabad",
    "saharanpur",
    "gorakhpur",
    "jhansi",
    "mathura",
    "muzaffarnagar",
    "ayodhya",
    "mirzapur",
    "firozabad",
    "shahjahanpur",
    "rampur",
    "farrukhabad",
    "mau",
    "hapur",
    "etawah",
  ],
  ajmer: [
    "ajmer",
    "jaipur",
    "jodhpur",
    "kota",
    "bikaner",
    "udaipur",
    "bhilwara",
    "alwar",
    "sikar",
    "sri-ganganagar",
    "pali",
    "bharatpur",
    "jhunjhunu",
  ],
  berhampur: [
    "berhampur",
    "bhubaneswar",
    "cuttack",
    "rourkela",
    "sambalpur",
    "balasore",
    "puri",
    "baripada",
    "jharsuguda",
    "jeypore",
  ],
  "east-godavari": ["east-godavari"],
  "west-godavari": ["west-godavari"],
  hospet: ["hospet", "bellary", "davangere", "gulbarga", "raichur", "bidar"],
};

// Reverse map: sub-city slug -> main city slug
const SUB_TO_MAIN_MAP: Record<string, string> = {};

for (const [mainCity, subCities] of Object.entries(CITY_CLUSTERS)) {
  for (const subCity of subCities) {
    if (subCity !== mainCity) {
      SUB_TO_MAIN_MAP[subCity] = mainCity;
    }
  }
}

/**
 * Returns the parent/main city slug for a sub-city slug, if mapped.
 */
export function getParentCitySlug(subCitySlug: string): string | null {
  return SUB_TO_MAIN_MAP[subCitySlug.toLowerCase()] ?? null;
}

/**
 * Returns all sub-city slugs belonging to a main city hub.
 */
export function getSubCitySlugsForMainCity(mainCitySlug: string): string[] {
  return CITY_CLUSTERS[mainCitySlug.toLowerCase()] ?? [];
}

/**
 * Checks if a city is defined as a main rate hub.
 */
export function isMainCityHub(slug: string): boolean {
  return Boolean(CITY_CLUSTERS[slug.toLowerCase()]);
}

/**
 * List of all main hub slugs.
 */
export function getAllMainCitySlugs(): string[] {
  return Object.keys(CITY_CLUSTERS);
}
