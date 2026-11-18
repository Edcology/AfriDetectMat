import { addDays } from "./format.ts";
import type { CheckIn, ChatMessage, Lesson, Thread } from "./mother-types.ts";

export const MOTHER_SLUG = "amara-okafor";

export const symptoms = [
  { id: "headache", label: "Headache" },
  { id: "nausea", label: "Nausea or vomiting" },
  { id: "fatigue", label: "Fatigue" },
  { id: "back-pain", label: "Back pain" },
  { id: "heartburn", label: "Heartburn" },
  { id: "constipation", label: "Constipation" },
  { id: "dizziness", label: "Dizziness" },
  { id: "leg-cramps", label: "Leg cramps" },
  { id: "swelling", label: "Swollen feet or ankles" },
  { id: "sleep", label: "Trouble sleeping" },
];

export const feelings = [
  { id: "good", emoji: "🙂", label: "Good", hint: "I'm very fine" },
  { id: "mixed", emoji: "😐", label: "Urghhh", hint: "Some ups & downs" },
  { id: "support", emoji: "🙁", label: "Not great", hint: "I'd like some support" },
] as const;

/** Symptoms that a care team needs to see the same day. */
export const concernSymptoms = ["headache", "swelling"];

const at = (dayOffset: number, h: number, m = 0) => addDays(new Date(2026, 10, 17), dayOffset).setHours(h, m, 0);

export const lessons: Lesson[] = [
  {
    slug: "why-antenatal-visits-matter",
    tag: "Pregnancy",
    title: "Why antenatal visits matter",
    excerpt:
      "Antenatal visits give your care team regular chances to check your blood pressure, your weight and how your baby is growing.",
    minutes: 3,
    body: [
      "Antenatal visits are the regular appointments you have while you are pregnant. They are a chance for your care team to check that you and your baby are well.",
      "At each visit your blood pressure, weight and urine are checked, and your baby's growth and heartbeat are measured. Problems are easier to manage when they are found early.",
      "Bring your questions. Nothing is too small to ask — sleep, food, pain, money, or how you are feeling.",
      "If you cannot make an appointment, reschedule instead of skipping it. Your care team would rather see you later than not at all.",
    ],
  },
  {
    slug: "when-you-get-urgent-help",
    tag: "Warning signs",
    title: "When you get urgent help",
    excerpt:
      "If you have heavy bleeding, a seizure, severe headache, changes in vision, difficulty breathing, or severe pain, get help immediately.",
    minutes: 4,
    body: [
      "Some symptoms mean you should get medical help straight away — do not wait for your next appointment.",
      "Go to your facility or call for help if you have: heavy bleeding, a seizure, a severe headache that will not go away, blurred vision or flashing lights, difficulty breathing, severe pain in your tummy, or you feel the baby is not moving as usual.",
      "Swelling of the face or hands, especially with a headache, also needs to be checked the same day.",
      "This app is not an emergency service. If you are seriously unwell, seek medical care now.",
    ],
  },
  {
    slug: "after-your-baby-is-born",
    tag: "Postpartum",
    title: "After your baby is born",
    excerpt:
      "Your care continues after birth. You will be invited to postnatal visits and recovery check-ins.",
    minutes: 3,
    body: [
      "The first six weeks after birth matter as much as pregnancy. Your body is recovering and your baby is changing quickly.",
      "Postnatal visits check your bleeding, blood pressure, wound healing and mood, and your baby's feeding, weight and jaundice.",
      "Tell your care team if you feel low, anxious, or unable to sleep even when the baby sleeps. Support is available.",
      "Keep taking any medicines you were given and attend every visit you are invited to.",
    ],
  },
  {
    slug: "eating-well-in-pregnancy",
    tag: "Pregnancy",
    title: "Eating well in pregnancy",
    excerpt:
      "Eating a variety of foods is generally encouraged in pregnancy. Your care team can tailor advice if you have a condition.",
    minutes: 3,
    body: [
      "You do not need a special diet, but you do need enough energy and a variety of foods: grains, beans, vegetables, fruit, eggs, fish, meat and dairy where you eat them.",
      "Take folic acid and iron supplements if they have been prescribed, and drink water through the day.",
      "Avoid raw or undercooked meat, unpasteurised dairy, and alcohol. Limit caffeine.",
      "If you have diabetes or high blood pressure, your care team will give you specific advice.",
    ],
  },
  {
    slug: "your-daily-check-in",
    tag: "Pregnancy",
    title: "Your daily check-in",
    excerpt:
      "A short daily check-in lets your care team see how you are doing between visits, and notice changes early.",
    minutes: 2,
    body: [
      "Your daily check-in takes about a minute. It asks how you feel and whether you have any symptoms.",
      "If you record a blood pressure reading, your care team sees it alongside your usual range.",
      "You can add a note about anything else — sleep, worries, or a question for your next visit.",
      "Check-ins are reviewed by your care team during working hours. They are not monitored as an emergency service.",
    ],
  },
];

export const threads: Thread[] = [
  {
    id: "t-adeyemi",
    name: "T. Adeyemi",
    role: "Midwife",
    note: "Care team closed · replies today at 8am",
    unread: 0,
  },
  {
    id: "t-chima",
    name: "Dr. Chima Nwosu",
    role: "Obstetrician",
    note: "Care team closed · replies today at 8am",
    unread: 1,
  },
];

export const messages: ChatMessage[] = [
  {
    id: "m-1",
    threadId: "t-adeyemi",
    from: "mother",
    body: "Good afternoon, can I move my visit to the afternoon?",
    at: new Date(2026, 10, 10, 16, 40).toISOString(),
  },
  {
    id: "m-2",
    threadId: "t-adeyemi",
    from: "care",
    body: "Yeah, we have moved it. See you on Thursday at 2:30pm.",
    at: new Date(2026, 10, 16, 16, 40).toISOString(),
  },
  {
    id: "m-3",
    threadId: "t-adeyemi",
    from: "care",
    body: "Hello Amara, your last readings look steady. Keep drinking water and rest well.",
    at: new Date(2026, 10, 16, 17, 0).toISOString(),
  },
  {
    id: "m-4",
    threadId: "t-adeyemi",
    from: "mother",
    body: "Okay midwife",
    at: new Date(2026, 10, 16, 17, 5).toISOString(),
  },
  {
    id: "m-5",
    threadId: "t-chima",
    from: "care",
    body: "Hello Amara, your recent readings are within your usual range. Keep up the daily check-ins — we will review again at your next visit.",
    at: new Date(2026, 10, 16, 9, 20).toISOString(),
  },
];

export const checkIns: CheckIn[] = [
  {
    id: "c-1",
    at: new Date(2026, 10, 16, 8, 10).toISOString(),
    feeling: "good",
    symptoms: [],
    note: "Slept well. Baby moving a lot in the evening.",
  },
  {
    id: "c-2",
    at: new Date(2026, 10, 15, 7, 55).toISOString(),
    feeling: "mixed",
    symptoms: ["heartburn", "sleep"],
    note: "Heartburn after dinner, woke twice in the night.",
  },
  {
    id: "c-3",
    at: new Date(2026, 10, 14, 8, 40).toISOString(),
    feeling: "good",
    symptoms: ["back-pain"],
    note: "",
  },
];

export const motherProfile = {
  setupComplete: false,
  name: "Amara Okafor",
  phone: "+234 80 0000 0020",
  address: "14 Herbert Macaulay Way, Yaba, Lagos",
  nextOfKin: "",
  language: "English",
  consentShare: true,
};

export const documents = [
  { name: "Booking summary", kind: "PDF", date: "12 Oct 2026", size: "184 KB" },
  { name: "Dating scan report", kind: "PDF", date: "2 Sep 2026", size: "312 KB" },
  { name: "Antenatal card", kind: "Image", date: "12 Oct 2026", size: "1.2 MB" },
];

export const testResults = [
  { name: "Haemoglobin", value: "11.6 g/dL", range: "11.0 – 15.0", tone: "normal" },
  { name: "Blood group", value: "O positive", range: "Recorded at booking", tone: "normal" },
  { name: "Genotype", value: "AA", range: "Recorded at booking", tone: "normal" },
  { name: "Urine protein", value: "Negative", range: "Negative", tone: "normal" },
  { name: "HIV screening", value: "Non-reactive", range: "Non-reactive", tone: "normal" },
  { name: "Random glucose", value: "4.6 mmol/L", range: "Below 7.8", tone: "normal" },
];

export { at };