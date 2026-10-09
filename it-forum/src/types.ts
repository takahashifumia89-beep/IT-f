export interface NewsItem { id: number; title: string; date: string; content: string }
export interface Olympiad { id: number; name: string; date: string; location: string; registration: string }
export interface SchedulePDF { id: number; title: string; fileName: string; fileUrl: string; uploadDate: string }
export interface TopStudent { id: number; rank: number; name: string; grade: string; gpa: number; achievements: number; specialty: string }
export interface ForumReply { id: number; author: string; content: string; timestamp: string }
export interface ForumPost { id: number; author: string; title: string; content: string; timestamp: string; likes: number; replies: ForumReply[] }

export interface AllData {
  news: NewsItem[];
  olympiads: Olympiad[];
  schedulePDFs: SchedulePDF[];
  topStudents: TopStudent[];
  forumPosts: ForumPost[];
}
