export function Footer() {
    return (
      <footer className="bg-white text-black border-t border-gray-300 py-6">
        <div className="mx-auto max-w-[1300px] px-4 text-center">
          &copy; {new Date().getFullYear()} Project. All rights reserved.
        </div>
      </footer>
    )
  }
  