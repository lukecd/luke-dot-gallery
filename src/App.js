import './index.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import BouncingBalls from './processing/BouncingBalls';
import TvVideo from './pages/TvVideo';
import Coding from './pages/Coding';
import Contact from './pages/Contact';

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
 