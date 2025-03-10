import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import BlogDetails from "./components/BlogDetails"; // Import BlogDetails

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog/:id" element={<BlogDetails />} /> {/* Blog Details Page */}
                    <Route path="/" element={<Login />} /> {/* Default to Login */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
