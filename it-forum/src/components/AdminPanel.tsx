import { useState } from 'react';
import { Settings, Newspaper, Trophy, Calendar, Award, LogOut, Plus, Pencil, Trash2, X, Upload, FileText, MessageSquare } from 'lucide-react';
import { NewsItem, Olympiad, SchedulePDF, TopStudent, ForumPost } from '../types';
import { api } from '../api';
import { toast } from 'sonner';

interface AdminPanelProps {
  onLogout: () => void;
  news: NewsItem[];
  setNews: (news: NewsItem[]) => void;
  olympiads: Olympiad[];
  setOlympiads: (olympiads: Olympiad[]) => void;
  schedulePDFs: SchedulePDF[];
  setSchedulePDFs: (pdfs: SchedulePDF[]) => void;
  topStudents: TopStudent[];
  setTopStudents: (students: TopStudent[]) => void;
  forumPosts: ForumPost[];
  setForumPosts: (posts: ForumPost[]) => void;
}

type AdminSection = 'news' | 'olympiads' | 'students' | 'schedule' | 'forum';

export function AdminPanel({ 
  onLogout, 
  news, 
  olympiads, 
  schedulePDFs,
  topStudents,
  forumPosts,
}: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('news');

  const sections = [
    { id: 'news', label: 'Жаңалықтар', icon: Newspaper },
    { id: 'olympiads', label: 'Олимпиадалар', icon: Trophy },
    { id: 'schedule', label: 'Сабақ кестесі', icon: Calendar },
    { id: 'students', label: 'Оқушылар рейтингі', icon: Award },
    { id: 'forum', label: 'Форум', icon: MessageSquare }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-white">Админ панелі</h1>
              <p className="text-purple-100">Сайт мазмұнын басқару</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Шығу
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="mb-4">Бөлімдер</h3>
            <div className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as AdminSection)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <section.icon size={20} />
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-4">
          {activeSection === 'news' && <NewsManager news={news} />}
          {activeSection === 'olympiads' && <OlympiadsManager olympiads={olympiads} />}
          {activeSection === 'schedule' && <SchedulePDFManager schedulePDFs={schedulePDFs} />}
          {activeSection === 'students' && <StudentsManager students={topStudents} />}
          {activeSection === 'forum' && <ForumManager forumPosts={forumPosts} />}
        </div>
      </div>
    </div>
  );
}

// News Manager Component
function NewsManager({ news }: { news: NewsItem[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', date: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await api.update('news', editingId, formData);
        toast.success('Жаңалық жаңартылды');
      } else {
        await api.create('news', formData);
        toast.success('Жаңалық қосылды');
      }
      setFormData({ title: '', date: '', content: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving news:', error);
      toast.error('Қате: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setFormData({ title: item.title, date: item.date, content: item.content });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Бұл жаңалықты жойғыңыз келетініне сенімдісіз бе?')) {
      try {
        await api.remove('news', id);
        toast.success('Жаңалық жойылды');
      } catch (error: any) {
        console.error('Error deleting news:', error);
        toast.error('Қате: ' + error.message);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', date: '', content: '' });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2>Жаңалықтарды басқару</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Болдырмау' : 'Жаңалық қосу'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 border-2 border-purple-200 rounded-lg space-y-4 bg-purple-50">
          <h3 className="mb-4">{editingId ? 'Жаңалықты өңдеу' : 'Жаңа жаңалық'}</h3>
          <div>
            <label className="block text-sm mb-2">Тақырып</label>
            <input
              type="text"
              placeholder="Жаңалық тақырыбы"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Күні</label>
            <input
              type="text"
              placeholder="Күні (мысалы, 10 желтоқсан 2024)"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Мазмұны</label>
            <textarea
              placeholder="Жаңалық мазмұны"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Сақталуда...' : (editingId ? 'Жаңарту' : 'Жасау')}
            </button>
            <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
              Болдырмау
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Newspaper size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Жаңалықтар жоқ</p>
            <p className="text-sm">Бірінші жаңалықты қосыңыз</p>
          </div>
        ) : (
          news.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.date}</p>
                  <p className="text-gray-700">{item.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-700 p-2 border border-blue-600 rounded hover:bg-blue-50"
                    title="Өңдеу"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700 p-2 border border-red-600 rounded hover:bg-red-50"
                    title="Жою"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Olympiads Manager Component
function OlympiadsManager({ olympiads }: { olympiads: Olympiad[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', date: '', location: '', registration: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await api.update('olympiads', editingId, formData);
        toast.success('Олимпиада жаңартылды');
      } else {
        await api.create('olympiads', formData);
        toast.success('Олимпиада қосылды');
      }
      setFormData({ name: '', date: '', location: '', registration: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving olympiad:', error);
      toast.error('Қате: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Olympiad) => {
    setFormData({ name: item.name, date: item.date, location: item.location, registration: item.registration });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Бұл олимпиаданы жойғыңыз келетініне сенімдісіз бе?')) {
      try {
        await api.remove('olympiads', id);
        toast.success('Олимпиада жойылды');
      } catch (error: any) {
        console.error('Error deleting olympiad:', error);
        toast.error('Қате: ' + error.message);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', date: '', location: '', registration: '' });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2>Олимпиадаларды басқару</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Болдырмау' : 'Олимпиада қосу'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 border-2 border-purple-200 rounded-lg space-y-4 bg-purple-50">
          <h3 className="mb-4">{editingId ? 'Олимпиаданы өңдеу' : 'Жаңа олимпиада'}</h3>
          <div>
            <label className="block text-sm mb-2">Атауы</label>
            <input
              type="text"
              placeholder="Олимпиада атауы"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Өткізу күні</label>
            <input
              type="text"
              placeholder="Өткізу күні"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Өткізу орны</label>
            <input
              type="text"
              placeholder="Өткізу орны"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Тіркеу</label>
            <input
              type="text"
              placeholder="Тіркеу туралы ақпарат"
              value={formData.registration}
              onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Сақталуда...' : (editingId ? 'Жаңарту' : 'Жасау')}
            </button>
            <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
              Болдырмау
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {olympiads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Олимпиадалар жоқ</p>
            <p className="text-sm">Бірінші олимпиаданы қосыңыз</p>
          </div>
        ) : (
          olympiads.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-3">{item.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Күні:</span> {item.date}</p>
                    <p><span className="text-gray-600">Орны:</span> {item.location}</p>
                    <p><span className="text-gray-600">Тіркеу:</span> {item.registration}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-700 p-2 border border-blue-600 rounded hover:bg-blue-50"
                    title="Өңдеу"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700 p-2 border border-red-600 rounded hover:bg-red-50"
                    title="Жою"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Schedule PDF Manager Component
function SchedulePDFManager({ schedulePDFs }: { schedulePDFs: SchedulePDF[] }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', fileUrl: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const today = new Date().toLocaleDateString('kk-KZ', { day: 'numeric', month: 'long', year: 'numeric' });
      const newPDF = {
        title: formData.title,
        fileName: formData.fileUrl.split('/').pop() || 'document.pdf',
        fileUrl: formData.fileUrl,
        uploadDate: today
      };
      
      await api.create('schedule_pdfs', newPDF);
      
      toast.success('Кесте қосылды');
      setFormData({ title: '', fileUrl: '' });
      setShowForm(false);
    } catch (error: any) {
      console.error('Error saving PDF:', error);
      toast.error('Қате: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Бұл PDF файлын жойғыңыз келетініне сенімдісіз бе?')) {
      try {
        await api.remove('schedule_pdfs', id);
        toast.success('Кесте жойылды');
      } catch (error: any) {
        console.error('Error deleting PDF:', error);
        toast.error('Қате: ' + error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2>Сабақ кестесін басқару (PDF)</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          {showForm ? <X size={20} /> : <Upload size={20} />}
          {showForm ? 'Болдырмау' : 'PDF қосу'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 border-2 border-purple-200 rounded-lg space-y-4 bg-purple-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Нұсқаулық:</strong> PDF файлыңызды Google Drive, Dropbox немесе басқа бұлтты қоймаға жүктеп, 
              сілтемені төменде көрсетіңіз. Файлға қол жеткізу ашық болуы керек.
            </p>
          </div>
          <div>
            <label className="block text-sm mb-2">Кесте атауы</label>
            <input
              type="text"
              placeholder="мысалы: 2024-2025 оқу жылы сабақ кестесі"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">PDF файл сілтемесі</label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Google Drive сілтемесі үшін: Файлды таңдап, "Бөлісу" {'>'} "Сілтемесі бар кез келген адам көре алады" {'>'} сілтемені көшіріңіз
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Қосылуда...' : 'Қосу'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
              Болдырмау
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {schedulePDFs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p>PDF файлдар жоқ</p>
            <p className="text-sm">Бірінші сабақ кестесін қосыңыз</p>
          </div>
        ) : (
          schedulePDFs.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.uploadDate}</p>
                    <a 
                      href={item.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <FileText size={14} />
                      Файлды ашу
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-700 p-2 border border-red-600 rounded hover:bg-red-50"
                  title="Жою"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Students Rating Manager Component
function StudentsManager({ students }: { students: TopStudent[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: '', gpa: '', achievements: '', specialty: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const studentData = {
        name: formData.name,
        grade: formData.grade,
        gpa: parseFloat(formData.gpa),
        achievements: parseInt(formData.achievements),
        specialty: formData.specialty,
        rank: editingId ? students.find(s => s.id === editingId)?.rank || 0 : students.length + 1,
      };

      if (editingId) {
        await api.update('top_students', editingId, studentData);
        toast.success('Оқушы жаңартылды');
      } else {
        await api.create('top_students', studentData);
        toast.success('Оқушы қосылды');
      }
      
      setFormData({ name: '', grade: '', gpa: '', achievements: '', specialty: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error('Қате: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: TopStudent) => {
    setFormData({ 
      name: item.name, 
      grade: item.grade, 
      gpa: item.gpa.toString(), 
      achievements: item.achievements.toString(), 
      specialty: item.specialty 
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Бұл оқушыны рейтингтен жойғыңыз келетініне сенімдісіз бе?')) {
      try {
        await api.remove('top_students', id);
        // Re-calculate ranks for remaining students (optional, but good for consistency)
        // This is complex to do transactionally on client. 
        // For now, we just delete. The ranks might have gaps.
        toast.success('Оқушы жойылды');
      } catch (error: any) {
        console.error('Error deleting student:', error);
        toast.error('Қате: ' + error.message);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', grade: '', gpa: '', achievements: '', specialty: '' });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2>Оқушылар рейтингін басқару</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Болдырмау' : 'Оқушы қосу'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 border-2 border-purple-200 rounded-lg space-y-4 bg-purple-50">
          <h3 className="mb-4">{editingId ? 'Оқушыны өңдеу' : 'Жаңа оқушы'}</h3>
          <div>
            <label className="block text-sm mb-2">Оқушы аты-жөні</label>
            <input
              type="text"
              placeholder="Толық аты-жөні"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Сыныбы</label>
              <input
                type="text"
                placeholder="10 сынып"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Орташа балл (GPA)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="5"
                placeholder="4.95"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Марапаттар саны</label>
              <input
                type="number"
                min="0"
                placeholder="5"
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Мамандығы</label>
              <input
                type="text"
                placeholder="Веб-әзірлеу"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Сақталуда...' : (editingId ? 'Жаңарту' : 'Қосу')}
            </button>
            <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
              Болдырмау
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 border-b">Орын</th>
              <th className="text-left py-3 px-4 border-b">Аты-жөні</th>
              <th className="text-left py-3 px-4 border-b">Сынып</th>
              <th className="text-left py-3 px-4 border-b">GPA</th>
              <th className="text-left py-3 px-4 border-b">Марапаттар</th>
              <th className="text-left py-3 px-4 border-b">Мамандығы</th>
              <th className="text-left py-3 px-4 border-b">Әрекеттер</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  <Award size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Рейтинг бос</p>
                  <p className="text-sm">Бірінші оқушыны қосыңыз</p>
                </td>
              </tr>
            ) : (
              students.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{item.rank}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{item.grade}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                      {item.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
                      {item.achievements}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{item.specialty}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Өңдеу"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Жою"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Forum Manager Component
function ForumManager({ forumPosts }: { forumPosts: ForumPost[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await api.update('forum_posts', editingId, formData);
        toast.success('Жазу жаңартылды');
      } else {
        const newPost = {
          ...formData,
          author: 'Admin', // Default author for admin panel posts
          timestamp: new Date().toISOString(),
          likes: 0,
          replies: []
        };
        await api.create('forum_posts', newPost);
        toast.success('Жазу қосылды');
      }
      setFormData({ title: '', content: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving forum post:', error);
      toast.error('Қате: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: ForumPost) => {
    setFormData({ title: item.title, content: item.content });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Бұл жазуын жойғыңыз келетініне сенімдісіз бе?')) {
      try {
        await api.remove('forum_posts', id);
        toast.success('Жазу жойылды');
      } catch (error: any) {
        console.error('Error deleting forum post:', error);
        if (error.code === '42501') {
          toast.error('Қате: Рұқсат жоқ (RLS).');
        } else if (error.message?.includes('Failed to fetch')) {
          toast.error('Байланыс қатесі (Network/CORS). Интернетті тексеріңіз.');
        } else {
          toast.error('Қате: ' + error.message);
        }
      }
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', content: '' });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2>Форумды басқару</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Болдырмау' : 'Жазу қосу'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 border-2 border-purple-200 rounded-lg space-y-4 bg-purple-50">
          <h3 className="mb-4">{editingId ? 'Жазуын өңдеу' : 'Жаңа жазу'}</h3>
          <div>
            <label className="block text-sm mb-2">Тақырып</label>
            <input
              type="text"
              placeholder="Жазу тақырыбы"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Мазмұны</label>
            <textarea
              placeholder="Жазу мазмұны"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Сақталуда...' : (editingId ? 'Жаңарту' : 'Жасау')}
            </button>
            <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
              Болдырмау
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {forumPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Жазуылар жоқ</p>
            <p className="text-sm">Бірінші жазуын қосыңыз</p>
          </div>
        ) : (
          forumPosts.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{item.author}</span>
                  </div>
                  <p className="text-gray-700">{item.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700 p-2 border border-red-600 rounded hover:bg-red-50"
                    title="Жою"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
