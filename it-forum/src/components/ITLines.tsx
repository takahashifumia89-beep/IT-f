import { Calendar, Trophy, Newspaper, FileText, Download } from 'lucide-react';
import { NewsItem, Olympiad, SchedulePDF } from '../types';

interface ITLinesProps {
  news: NewsItem[];
  olympiads: Olympiad[];
  schedulePDFs: SchedulePDF[];
}

export function ITLines({ news, olympiads, schedulePDFs }: ITLinesProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2">IT Lines</h1>
        <p className="text-gray-600">Сабақ кестесі, олимпиадалар және соңғы жаңалықтар</p>
      </div>

      {/* School News */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Newspaper className="text-green-600" size={20} />
          </div>
          <h2>Мектеп жаңалықтары</h2>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Newspaper size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Жаңалықтар жоқ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <article key={item.id} className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.date}</p>
                <p className="text-gray-700">{item.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Schedule PDFs */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="text-blue-600" size={20} />
          </div>
          <h2>Сабақ кестесі</h2>
        </div>
        
        {schedulePDFs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Сабақ кестесі жүктелмеген</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedulePDFs.map((pdf) => (
              <a
                key={pdf.id}
                href={pdf.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-red-600" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 truncate">{pdf.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{pdf.uploadDate}</p>
                    <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700">
                      <Download size={16} />
                      <span className="text-sm">Ашу/Жүктеу</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Olympiads */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Trophy className="text-purple-600" size={20} />
          </div>
          <h2>Жақын арадағы олимпиадалар</h2>
        </div>

        {olympiads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Олимпиадалар жоқ</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {olympiads.map((olympiad) => (
              <div key={olympiad.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <h3 className="mb-3">{olympiad.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-gray-600">Күні:</div>
                      <div>{olympiad.date}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">📍</span>
                    <div>
                      <div className="text-gray-600">Орны:</div>
                      <div>{olympiad.location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">✏️</span>
                    <div>
                      <div className="text-gray-600">Тіркеу:</div>
                      <div className="text-green-600">{olympiad.registration}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

