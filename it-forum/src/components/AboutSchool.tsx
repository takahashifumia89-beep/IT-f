import { Calendar, Users, Trophy, MapPin, Target, BookOpen } from 'lucide-react';

const statistics = [
  { label: 'Оқушылар саны', value: '284', icon: Users, color: 'bg-blue-100 text-blue-600' },
  { label: 'Ұстаздар құрамы', value: '35', icon: BookOpen, color: 'bg-green-100 text-green-600' },
  { label: 'Мектептің жасы', value: '8', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
  { label: 'Жүлделері', value: '400+', icon: Trophy, color: 'bg-yellow-100 text-yellow-600' }
];

const milestones = [
  { year: '2017', event: 'Мектебіміздің құрылуы', description: 'Технология саласында жоғары деңгейлі білім беру мақсатымен құрылған' },
  { year: '2020', event: 'Алғаш түлектер', description: '2020 жылдан бастап мектебіміз тұрақты түлектер шығаруда және олардың бәрі танымал үздік университеттерде оқуда' },
  { year: '2022', event: 'Халықаралық деңгейдегі жүлделер', description: '2022 жылдан бастап мектебіміз халықаралық деңгейде жарыса бастады' },
  { year: '2024', event: 'Ғимараттың жаңа бөлігінің ашылуы', description: 'Заманауи зертханалармен және жабдықтармен кеңейту' },
  { year: '2025', event: 'Мақсаттар', description: 'Мектебіміз жаңа белестерді асу барысында' },
  
];

export function AboutSchool() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2">IT мектебіміз туралы</h1>
        <p className="text-gray-600">2017 жылдан бері Технологиялық білім берудің үздіктерінің бірі</p>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg p-8">
        <div className="flex items-start gap-4">
          <Target className="flex-shrink-0 mt-1" size={32} />
          <div>
            <h2 className="text-white mb-4">Біздің міндетіміз</h2>
            <p className="text-blue-100 text-lg mb-4">
            Инновациялық білім беру арқылы технология көшбасшыларының келесі ұрпағын тәрбиелеу, 
              ортада шығармашылық пен сыни ойлауды дамыту мінсіз және этикалық жауапкершілікке шақыру.
            </p>
            <p className="text-blue-100 text-lg">
             Біз әрбір оқушының технология әлеміне елеулі үлес қосуға мүмкіндігі бар деп 
              есептейміз және олардың армандарына жетуіне көмектесуге тырысамыз.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="text-3xl mb-2">{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* History */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="text-purple-600" size={20} />
          </div>
          <h2>Құрылу тарихы</h2>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-gray-700 text-lg">
            IT мектебінің негізін 2017 жылы озық ойлы педагогтар мен технологиялық мамандар тобы құрған.
            Небәрі 50 оқушысы бар шағын оқу орнынан басталған оқу орны аймақтағы жетекші технологиялық мектептердің біріне айналды.
          </p>
          <p className="text-gray-700 text-lg">
            Соңғы 7 жыл ішінде біз оқу бағдарламамызды үнемі дамытып келеміз.
          </p>
        </div>

        <h3 className="mb-6">Маңызды жылдар</h3>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-20 text-right">
                <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full">
                  {milestone.year}
                </span>
              </div>
              <div className="flex-1 border-l-2 border-blue-200 pl-6 pb-4">
                <h4 className="mb-1">{milestone.event}</h4>
                <p className="text-gray-600">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="mb-6">Мектеп жайлары</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="mb-3">💻 Компьютерлік кабинеттер</h3>
            <p className="text-gray-700">
              Жаңа үлгідегі аппараттық және бағдарламалық құралдармен жабдықталған 4 заманауи компьютерлік зертхана, 
              оның ішінде AI және графикаға арналған жоғары өнімді жұмыс жағдайлары.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="mb-3">🔬 Зертханалар</h3>
            <p className="text-gray-700">
              Химия және биология бағыттарына арналған арнайы жабдықталған зертханалар, онда тәжірибелер жүргізуге, биохимиялық талдаулар жасауға, 
              микроскопиялық зерттеулер жүргізуге арналған кәсіби деңгейдегі құралдар мен жабдықтар орнатылған.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="mb-3">📚 Кітапхана</h3>
            <p className="text-gray-700">
              Заманауи кітапхана – оқу, зерттеу және шығармашылықпен айналысуға арналған кеңістік. Мұнда цифрлық және баспа ресурстары, 
              тыныш оқуға арналған аймақтар, мультимедиялық материалдар және білімді кеңейтуге қажетті құралдар ұсынылған.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="mb-3">🚀 Инновациялық хаб</h3>
            <p className="text-gray-700">
              Студенттік жобалар мен стартаптар үшін сала мамандарының тәлімгерлігімен бірлескен жұмыс кеңістігі.
            </p>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <MapPin className="text-red-600" size={20} />
          </div>
          <h2>Орналасқан жері</h2>
        </div>
        <div className="space-y-2 text-gray-700">
          <p>ММЛИ IT</p>
          <p>Колодезная 9</p>
          <p>Қазыбек би ауданы</p>
          <p>Телефон: +7 (747) 703 74 07</p>
          <p>Email: itmmli2017@gmail.com</p>
        </div>
      </section>
    </div>
  );
}
