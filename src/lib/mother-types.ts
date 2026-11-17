export interface CheckIn {
  id: string;
  at: string;
  feeling: "good" | "mixed" | "support";
  symptoms: string[];
  note: string;
}

export interface Thread {
  id: string;
  name: string;
  role: string;
  note: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  from: "mother" | "care";
  body: string;
  at: string;
}

export interface Lesson {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  minutes: number;
  body: string[];
}

export interface MotherProfile {
  setupComplete: boolean;
  name: string;
  phone: string;
  address: string;
  nextOfKin: string;
  language: string;
  consentShare: boolean;
}
