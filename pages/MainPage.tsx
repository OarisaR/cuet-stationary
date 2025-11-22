import NavBar from "../components/LandingNavbar";
import Home from "./Home";
import About from "./About";
import Contact from "./Contact";
import Footer from "../components/Footer";

function MainPage() {
  return (
    <>
      <NavBar />
      <Home />
      <About />
      <Contact />
      <Footer />
    </>
  );
}

export default MainPage;