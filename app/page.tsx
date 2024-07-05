import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import TvVideo from "./components/TvVideo";
import Music from "./components/Music";
import DevRel from "./components/DevRel";
import Contact from "./components/Contact";

function App() {
	return (
		<div className="bg-[#15274c] text-[#f5ead9]">
			<Navbar />
			<Home />
			<About />
			<DevRel />
			<Music />
			<TvVideo />
			<Contact />
		</div>
	);
}

export default App;
