export function Header() {
  return (
   <header
    className="relative text-white py-5 bg-cover bg-center"
    style={{ backgroundImage: "url('https://img.freepik.com/premium-photo/it-industry-modern-technologies-man-presses-screen_438099-7030.jpg')" }}
    >
  <div className="absolute inset-0 bg-black/50"></div>

  <div className="relative max-w-7xl mx-auto px-5">
    <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="/logo.jpg"
              alt="IT School Logo"
              className="w-full h-full object-cover"
            />
          </div>
           <div>
            <h1 className="text-2xl font-bold tracking-wide">
              IT School
              <span className="text-yellow-200"> • Official Website</span>
            </h1>
            <p className="text-sm text-blue-100">
              Smart education for digital future
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}