import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ITLines } from './components/ITLines';
import { TopStudents } from './components/TopStudents';
import { AboutSchool } from './components/AboutSchool';
import { Forum } from './components/Forum';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { api } from './api';
import type { NewsItem, Olympiad, SchedulePDF, TopStudent, ForumPost } from './types';

export type { NewsItem, Olympiad, SchedulePDF, TopStudent, ForumPost };

type Page = 'it-lines' | 'top-students' | 'about' | 'forum' | 'admin';

const POLL_MS = 60_000; // D1 тегін лимитін үнемдеу үшін минутына бір рет

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('it-lines');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [schedulePDFs, setSchedulePDFs] = useState<SchedulePDF[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await api.getAll();
      setNews(d.news);
      setOlympiads(d.olympiads);
      setSchedulePDFs(d.schedulePDFs);
      setTopStudents(d.topStudents);
      setForumPosts(d.forumPosts);
      setLoadError(null);
    } catch (e: any) {
      console.warn('Деректерді жүктеу қатесі:', e.message);
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    api.me().then(() => setIsAdminAuthenticated(true)).catch(() => {});

    const onChange = () => load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_MS);
    window.addEventListener('data-changed', onChange);
    return () => {
      clearInterval(timer);
      window.removeEventListener('data-changed', onChange);
    };
  }, [load]);

  const handleAdminLogout = async () => {
    try { await api.logout(); } catch {}
    setIsAdminAuthenticated(false);
    setCurrentPage('it-lines');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl">Жүктелуде...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      <Header />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      {loadError && (
        <div className="bg-red-50 text-red-700 text-center text-sm py-2">
          Серверге қосылу мүмкін болмады: {loadError}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'it-lines' && (
          <ITLines news={news} olympiads={olympiads} schedulePDFs={schedulePDFs} />
        )}
        {currentPage === 'top-students' && <TopStudents students={topStudents} />}
        {currentPage === 'about' && <AboutSchool />}
        {currentPage === 'forum' && <Forum posts={forumPosts} setPosts={setForumPosts} />}
        {currentPage === 'admin' &&
          (isAdminAuthenticated ? (
            <AdminPanel
              onLogout={handleAdminLogout}
              news={news}
              setNews={setNews}
              olympiads={olympiads}
              setOlympiads={setOlympiads}
              schedulePDFs={schedulePDFs}
              setSchedulePDFs={setSchedulePDFs}
              topStudents={topStudents}
              setTopStudents={setTopStudents}
              forumPosts={forumPosts}
              setForumPosts={setForumPosts}
            />
          ) : (
            <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
          ))}
      </main>
    </div>
  );
}
