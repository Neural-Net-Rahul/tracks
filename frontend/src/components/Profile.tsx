import React, { useEffect, useState } from "react";
import "../design/Profile.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<
    "details" | "public" | "private"
  >("details");
  const navigate = useNavigate();
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [publicTracks, setPublicTracks] = useState([]);
  const [privateTracks, setPrivateTracks] = useState([]);
  const [profileImage, setProfileImage] = useState('');

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    async function getUserData(){
      try{
        const token = localStorage.getItem("token") || "";
        if (!token) {
          navigate("/");
          return;
        }
        setLoading(true);
        const response = await axios.post("https://tracks-2qce.onrender.com/api/users/getUserData",{token});
        const userData = response.data.userData;
        setName(userData.name)
        setEmail(userData.email);
        setProfileImage(userData.profilePhoto);
        const pub = userData.tracks
          .filter((ithTrack: any) => ithTrack.isPublic === true)
          .sort(
            (a: any, b: any) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        const pri = userData.tracks
          .filter((ithTrack: any) => ithTrack.isPublic === false)
          .sort(
            (a: any, b: any) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        setPublicTracks(pub);
        setPrivateTracks(pri);
        setLoading(false);
      }
      catch(e){
        navigate('/');
      }
    }
    getUserData();
  },[])

  const handlePublic = async(id:any) => {
    const token = localStorage.getItem('token') || '';
    if(!token){
      navigate('/');
    }
    try{
      const response = await axios.post("https://tracks-2qce.onrender.com/api/tracks/changeTrackStatus", {
        token,
        trackId: id,
      });
      const track = response.data.track;
      const pub = track
        .filter((ithTrack: any) => ithTrack.isPublic === true)
        .sort(
          (a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      const pri = track
        .filter((ithTrack: any) => ithTrack.isPublic === false)
        .sort(
          (a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      setPublicTracks(() => pub);
      setPrivateTracks(() => pri);
    }
    catch(e){
      console.log(e);
      alert('Some error occurred');
      navigate('/');
    }
  }

  const createTrack = async() => {
    try{
      const token = localStorage.getItem('token') || '';
      if(!token){
        navigate('/');
        return;
      }
      const response = await axios.post("https://tracks-2qce.onrender.com/api/users/create",{token});
      navigate(`/create/${response.data.trackId}`);
    }
    catch(e){
      alert('Error in creating track');
    }
  }

  if(loading){
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className={`profile-container ${
        theme === "light" ? "light-mode" : "dark-mode"
      }`}
    >
      {/* Header with title, dark/light toggle button, and create tag button */}
      <header className="header">
        <h1 className="text-2xl">Profile</h1>
        <div className="header-buttons">
          <button className="button button-home"
            onClick={() => {
              navigate("/");
            }}
          >
            Home
          </button>
          <button onClick={toggleTheme} className="button button-toggle">
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
          <button onClick={createTrack} className="button button-create">
            Create Track
          </button>
        </div>
      </header>

      <div className="content-container">
        {/* Sidebar with navigation options */}
        <aside className="sidebar">
          <button
            className={selectedSection === "details" ? "active" : ""}
            onClick={() => setSelectedSection("details")}
          >
            User Details
          </button>
          <button
            className={selectedSection === "public" ? "active" : ""}
            onClick={() => setSelectedSection("public")}
          >
            Public Tracks
          </button>
          <button
            className={selectedSection === "private" ? "active" : ""}
            onClick={() => setSelectedSection("private")}
          >
            Private Tracks
          </button>
        </aside>

        {/* Main content area changing based on sidebar selection */}
        <main className="main-content">
          {selectedSection === "details" && (
            <div className="user-details flex flex-col justify-center items-center">
              <img
                src={profileImage}
                alt="User"
                className="user-image w-8/12"
              />
              <h2>{name}</h2>
              <p>{email}</p>
            </div>
          )}

          {selectedSection === "public" && publicTracks.length > 0 ? (
            <div className="tracks-grid">
              {publicTracks.map((track: any) => (
                <div key={track.id} className="track-card">
                  <img
                    src={track.image}
                    alt={track.name}
                    className="track-image"
                  />
                  <div className="track-details">
                    <h3 className="text-xl">{track.name}</h3>
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
                        // handleWatch(track.id);
                      }}
                    >
                      <button
                        onClick={() => navigate(`/watch/track/${track.id}`)}
                      >
                        Watch
                      </button>
                      <button onClick={() => navigate(`/create/${track.id}`)}>
                        Edit
                      </button>
                      <button onClick={() => handlePublic(track.id)}>
                        Make it Private
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}

          {selectedSection === "public" && publicTracks.length === 0
            ? "No Public Tracks"
            : ""}

          {selectedSection === "private" && privateTracks.length > 0 ? (
            <div className="tracks-grid">
              {privateTracks.map((track: any) => (
                <div key={track.id} className="track-card">
                  <img
                    src={track.image}
                    alt={track.name}
                    className="track-image"
                  />
                  <div className="track-details">
                    <h3 className="text-xl">{track.name}</h3>
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
                        // handleWatch(track.id);
                      }}
                    >
                      <button
                        onClick={() => navigate(`/watch/track/${track.id}`)}
                      >
                        Watch
                      </button>
                      <button onClick={() => navigate(`/create/${track.id}`)}>
                        Edit
                      </button>
                      <button onClick={() => handlePublic(track.id)}>
                        Make it Public
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}
          {selectedSection === "private" && privateTracks.length === 0
            ? "No Private Tracks"
            : ""}
        </main>
      </div>
    </div>
  );
};

export default Profile;
