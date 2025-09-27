export function Footer() {
    return (
      <footer className=" text-gray-300 bg-gradient-to-r  via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-t border-white/10 shadow-lg shadow-purple-500/10 py-6">
        <div className="mx-auto max-w-[1300px] px-4 text-center">
          &copy; {new Date().getFullYear()} AstrumGate. All rights reserved.
        </div>
      </footer>
    )
  }
  