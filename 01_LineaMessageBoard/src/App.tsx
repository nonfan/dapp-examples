import MessageBoard from "./components/MessageBoard";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-gray-900">
      <main className="container py-6">
        <MessageBoard />
      </main>

      <footer className="container py-8 text-sm text-gray-500">
        <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
          <span>Powered by Linea Sepolia</span>
          <a
            href="https://sepolia.lineascan.build/"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Explorer
          </a>
        </div>
      </footer>
    </div>
  );
}
