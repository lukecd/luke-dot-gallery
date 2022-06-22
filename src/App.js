import './index.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import BouncingBalls from './BouncingBalls';
import TvVideo from './components/TvVideo';
import Coding from './components/Coding';
import Contact from './components/Contact';

function App() {
  return (
    <div>
      <Navbar />
      <Home />
      <About />
      <Coding />
      <TvVideo />
      <Contact />
    </div>
  );
}

export default App;
 