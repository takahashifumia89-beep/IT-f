import { Code, Users, Award, Info, MessageSquare, Shield } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: 'it-lines' | 'students' | 'top-students' | 'about' | 'forum' | 'admin') => void;
}

const navItems = [
  { id: 'it-lines', label: 'IT Lines', icon: Code },
  { id: 'top-students', label: 'Ең үздік 50 оқушы', icon: Award },
  { id: 'about', label: 'Мектеп туралы', icon: Info },
  { id: 'forum', label: 'Форум', icon: MessageSquare },
  { id: 'admin', label: 'Админ', icon: Shield }
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                currentPage === item.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}