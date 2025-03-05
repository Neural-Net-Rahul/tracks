import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../design/Home.css";
import axios from "axios";

interface Tracks {
  id: number,
  name : string,
  image: string,
  createdAt : Date,
  updatedAt : Date,
  chaptersCount : number
}

const Home = () => {
  const navigate = useNavigate();

  const [tracks, setTracks] = useState([]);
  const [currentTracks, setCurrentTracks] = useState<Tracks[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getTracks = async() => {
      try{
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/tracks/getAllTracks');
        console.log(response);
        const allTracks = response.data.tracks.sort((a:any, b:any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setTracks(allTracks);
        setLoading(false);
        setCurrentTracks(allTracks);
      }
      catch(e){
        alert("Error in fetching tracks");
      }
    }
    getTracks();
  }, []);

  const handleWatch = (id:number) => {
    navigate(`/watch/track/${id}`)
  }

  const handleProfile = () => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      navigate("/");
    } else {
      const obj = jwtDecode(token) as { id: number };
      const id = obj.id;
      navigate(`/profile/${id}`);
    }
  };

  const handleSearchChange = (e: any) => {
    setSearchQuery(e.target.value);
    let searchValue = e.target.value;
    const filteredTracks = tracks.filter((ithTrack:{name:string,tags:string[]})=>{
      const nameMatch = ithTrack.name.toLowerCase().includes(searchValue.toLowerCase());
      const tagsMatch = ithTrack.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase()));
      return nameMatch || tagsMatch;
    })
    filteredTracks.sort(
      (a: any, b: any) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setCurrentTracks(filteredTracks);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  if(loading){
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`home-container ${darkMode ? "dark-mode" : ""}`}>
      <header className="home-header">
        <div className="header-left">
          <img src="/logo_tracks.png" alt="Logo" className="logo-image" />
          <h1 className="text-3xl bold">Tracks</h1>
        </div>
        <div className="header-right flex flex-row gap-2">
          <button onClick={handleProfile}>Profile</button>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={toggleDarkMode} className="dark-mode-toggle">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>

      <main className="home-body">
        <section className="intro-section">
          <h2 className="text-lg">
            <span className="text-blue-400">Manage</span> and{" "}
            <span className="text-pink-600">create</span> your tracks
          </h2>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search tracks..."
            className="search-bar"
            style={{color:"black"}}
          />
        </section>

        <section className="tracks-section">
          {currentTracks.length > 0 ? (
            <div className="tracks-grid">
              {currentTracks.map((track) => (
                <div key={track.id} className="track-card">
                  <img
                    src={track.image}
                    alt={track.name}
                    className="track-image"
                  />
                  <div className="track-details">
                    <h3>{track.name}</h3>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(track.createdAt))}
                    </p>
                    <p>
                      <strong>Updated:</strong>{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(track.updatedAt))}
                    </p>

                    <p>Chapters: {track.chaptersCount}</p>
                    <div
                      className="track-buttons"
                      onClick={() => {
                        handleWatch(track.id);
                      }}
                    >
                      <button>Watch</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No tracks found.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
