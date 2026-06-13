import { useState } from "react";
import Header from "./Components/Header";
import Filters from "./Components/Filters";
import Projects from "./Components/Projects";
import Tasks from "./Components/Tasks";

function App() {
  const [showFilters, setShowFilters] = useState(false);
  const closeHandler = () => {
    setShowFilters(false);
  };

  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 flex flex-col overflow-x-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
      </div>

      <Header setShow={setShowFilters} />

      {/* Main Container */}
      <main className="relative z-10 flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 items-start">
        {/* Left Filters Sidebar */}
        <section
          className={`w-full md:w-64 flex-shrink-0 bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl transition-all duration-300 md:block md:h-[620px] md:overflow-y-auto flex flex-col justify-between ${
            showFilters ? "block fixed inset-x-4 top-24 bottom-6 z-50 overflow-y-auto bg-zinc-950 border-zinc-700/80" : "hidden"
          }`}
        >
          <Filters setShow={setShowFilters} />
          <Projects />
          {showFilters && (
            <button
              onClick={closeHandler}
              className="mt-6 w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl border border-zinc-800 transition-colors md:hidden text-sm"
            >
              Apply Filters
            </button>
          )}
        </section>

        {/* Right Tasks Area */}
        <section className="flex-grow w-full bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl md:h-[620px] flex flex-col">
          <Tasks />
        </section>
      </main>
    </div>
  );
}

export default App;
