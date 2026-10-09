import { Award, Trophy, Medal } from 'lucide-react';
import { TopStudent } from '../types';

interface TopStudentsProps {
  students: TopStudent[];
}

export function TopStudents({ students }: TopStudentsProps) {
  // Sort students by rank ascending (1 -> 2 -> 3 ...)
  // This ensures the list is always 1, 2, 3, 4, 5... regardless of database order
  const sortedStudents = [...students].sort((a, b) => a.rank - b.rank);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-orange-600" size={24} />;
    return <Award className="text-blue-600" size={20} />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
    if (rank <= 10) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2">Ең үздік 50 оқушы</h1>
        <p className="text-gray-600">Жалпы үлгерімі және жетістіктері</p>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <Trophy className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="mb-2">Үздік оқушылар</h3>
            <p className="text-gray-700">
              Бұл тізім орташа үлгеріміне, байқаулардағы жетістіктеріне, жобаларға қосқан үлесіне және өздерінің IT мамандануындағы жалпы жетістіктеріне негізделген үздік оқушыларымызды көрсетеді. 
              Бұл оқушылар ерекше жауапкершілікті, креативтілікті және жоғары техникалық қабілеттерді танытады.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6">Орыны</th>
                <th className="text-left py-4 px-6">Оқушының аты</th>
                <th className="text-left py-4 px-6">Сыныбы</th>
                <th className="text-left py-4 px-6">Орташа үлгерімі</th>
                <th className="text-left py-4 px-6">Жетістіктері</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    student.rank <= 3 ? 'bg-yellow-50/30' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {getMedalIcon(student.rank)}
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(student.rank)}`}>
                        {student.rank}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">{student.name}</td>
                  <td className="py-4 px-6 text-gray-600">{student.grade}</td>
        
                <td className="py-4 px-6">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {student.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                      {student.achievements} 
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
