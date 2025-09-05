
export function Footer() {
  return (
    <footer className="bg-white text-black border-t border-gray-300 py-6">
      <div className="container-xxl mx-auto px-4 flex flex-col items-center gap-4">


        {/* Copyright */}
        <div className="text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Conflux Wallet App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
