export interface StudentApplication {
  regNo: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  photoUrl?: string;
  institution: string;
  studentClass: string;
  principalPhone: string;
  guardianPhone: string;
  email: string;
  senderBkash: string;
  payShotUrl?: string;
  submissionDate?: string;
  status?: string;
  rollNumber?: string;
  examCenter?: string;
  examDate?: string;
}

export interface AdmitCardData {
  regNo: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  motherName?: string;
  studentClass: string;
  institution: string;
  examCenter: string;
  examDate: string;
  examTime: string;
  photoUrl?: string;
  controllerName?: string;
  controllerDesignation?: string;
  controllerSignature?: string;
  controllerPhone?: string;
}

export interface ExamResultData {
  regNo: string;
  rollNumber: string;
  name: string;
  studentClass: string;
  institution: string;
  totalMarks: number;
  obtainedMarks: number;
  gpa: string;
  meritPosition: number;
  scholarshipCategory: "ট্যালেন্টপুল বৃত্তি" | "সাধারণ বৃত্তি" | "মেধা তালিকা" | "অংশগ্রহণমূলক";
  status: "উত্তীর্ণ" | "অনুপস্থিত";
  subjects?: {
    name: string;
    marks: number;
    total: number;
  }[];
  controllerName?: string;
  controllerDesignation?: string;
  controllerSignature?: string;
  controllerPhone?: string;
}

export interface NoticeItem {
  id: string;
  date: string;
  title: string;
  category: "রেজিস্ট্রেশন" | "সিলেবাস" | "পরীক্ষা" | "ফলাফল" | "সাধারণ";
  content: string;
  fileUrl?: string;
  isImportant?: boolean;
}

export interface AdvisorItem {
  id: string;
  name: string;
  role: string;
  photo?: string;
  designation?: string;
  order?: number;
  phone?: string;
  email?: string;
}

export interface DignitaryMessage {
  id: string;
  name: string;
  role: string;
  text: string;
  photo?: string;
}

export interface SyllabusItem {
  id: string;
  studentClass: string;
  subjects: {
    name: string;
    topics: string;
    marks: number;
  }[];
  totalMarks: number;
  examDuration: string;
}
