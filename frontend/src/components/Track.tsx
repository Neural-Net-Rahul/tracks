import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

const Track = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();

  // Existing state variables
  const [trackName, setTrackName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [order, setOrder] = useState<Number[]>([]);
  const [pages, setPages] = useState([]);
  const [chapterCount, setChapterCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // New state for dark mode (default dark) and track image
  const [darkMode, setDarkMode] = useState(true);
  const [trackImage, setTrackImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getTrackData = async () => {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate("/");
        return;
      }
      try {
        setLoading((prev) => !prev);
        const response = await axios.post(
          "https://tracks-cwh2.onrender.com/api/tracks/trackData",
          { trackId, token }
        );
        const track = response.data.track;
        console.log("track", track);

        if (track) {
          setLoading((prev) => !prev);
          setTrackName(track.name || "");
          setTags(track.tags || []);
          setPages(track.pages || []);
          setOrder(track.order || []);
          setImageUrl(track.image);
          setChapterCount(track.chaptersCount);
        }
      } catch (e) {
        const obj = jwtDecode<{ id: string }>(
          localStorage.getItem("token") || ""
        );
        navigate(`/profile/${obj.id}`);
      }
    };
    getTrackData();
  }, [trackId, navigate]);

  // Existing functions for tags and pages
  const handleTagAdd = () => {
    if (tagInput.trim() !== "") {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagDelete = (index: any) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const movePageUp = async (index: any) => {
    if (index === 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    setOrder(newOrder);
    try {
      const token = localStorage.getItem("token");
      if (!token) navigate("/");
      await axios.post("https://tracks-cwh2.onrender.com/api/tracks/saveTrack", {
        name: trackName,
        tags,
        order: newOrder,
        trackId,
        token,
      });
    } catch (e: any) {
      if (e.response.status === 413) navigate("/");
      alert("Some error occurred");
    }
  };

  const movePageDown = async (index: any) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index + 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index + 1],
    ];
    setOrder(newOrder);
    try {
      const token = localStorage.getItem("token");
      if (!token) navigate("/");
      await axios.post("https://tracks-cwh2.onrender.com/api/tracks/saveTrack", {
        name: trackName,
        tags,
        order: newOrder,
        trackId,
        token,
      });
    } catch (e: any) {
      if (e.response.status === 413) navigate("/");
      alert("Some error occurred");
    }
  };

  const handleCreateFirstPage = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) navigate("/");
      toast.success("Creating first page...");
      const response = await axios.post(
        "https://tracks-cwh2.onrender.com/api/tracks/createPage",
        {
          onPage: false,
          order,
          p_t_Id: trackId,
          trackId: Number(trackId),
          token,
        }
      );
      const pageId = response.data.pId;
      navigate(`/page/${pageId}`);
    } catch (e: any) {
      if (e.response.status === 413) navigate("/");
      alert("Error in creating page");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      if (!token){ navigate("/");  return;}
      toast.success("Details Saved...");
      const formData = new FormData();
      formData.append('name',trackName);
      formData.append('tags',JSON.stringify(tags));
      formData.append('order', JSON.stringify(order));
      formData.append("trackId", trackId!);
      if(trackImage){
        formData.append("image", trackImage);
      }
      await axios.post("https://tracks-cwh2.onrender.com/api/tracks/saveTrack", formData,{
        headers:{
          "Authorization":`Bearer ${token}`
        }
      });
    } catch (e: any) {
      console.log(e);
      if (e.response.status === 413) navigate("/");
      alert("Some error occurred");
    }
  };

  const handleNext = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) navigate("/");
      toast.success("Searching for next page...");
      const response = await axios.post(
        "https://tracks-cwh2.onrender.com/api/tracks/nextPage",
        {
          order,
          onPage: false,
          p_t_id: Number(trackId),
          token,
        }
      );
      if (response.status === 202) {
        const id = response.data.id;
        navigate(`/page/${id}`);
      }
    } catch (e: any) {
      if (e.response.status === 413) navigate("/");
      alert("Some error occurred");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) navigate("/");
      toast.success("Deleting Track...");
      await axios.post("https://tracks-cwh2.onrender.com/api/tracks/deleteTrack", {
        trackId: Number(trackId),
        token,
      });
      const obj = jwtDecode<{ id: string }>(token);
      navigate(`/profile/${obj.id}`);
    } catch (e: any) {
      if (e.response.status === 413) navigate("/");
      alert("Error while deleting Track");
    }
  };

  const handlePageDelete = async (id: Number) => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) navigate("/");
      toast.success("Deleting Page...");
      const response = await axios.post(
        "https://tracks-cwh2.onrender.com/api/tracks/deletePage",
        {
          trackId: Number(trackId),
          pageId: id,
          order,
          token,
        }
      );
      console.log(response.data);
      setOrder(response.data.newOrder);
    } catch (e: any) {
      if (e.response.status === 413) navigate("/");
      alert("Error while deleting Page");
    }
  };

  // New function for dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleFileUploadClick = (e: any) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setTrackImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  // If loading, show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // Define button style for page navigation buttons based on darkMode
  const pageButtonStyle = {
    backgroundColor: darkMode ? "#444" : "#eee",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s ease-in-out",
    color: darkMode ? "#fff" : "#000",
  };

  return (
    <div
      className={`track-container ${darkMode ? "dark-mode" : "light-mode"}`}
      style={{ fontFamily: "outfit", minHeight: "100vh", padding: "20px" }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "35px" }}>Track</h1>
        <button
          onClick={toggleDarkMode}
          style={{
            padding: "8px 12px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: darkMode ? "#f39c12" : "#007BFF",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </header>

      {/* Track Name Section */}
      <div className="track-section">
        <h2 style={{ fontSize: "20px" }}>
          <label htmlFor="trackName" className="track-label">
            Track Name
          </label>
        </h2>
        <input
          type="text"
          id="trackName"
          value={trackName}
          onChange={(e) => setTrackName(e.target.value)}
          className="track-input"
          placeholder="Enter track name"
        />
      </div>

      {/* Tag Section */}
      <div className="tag-section">
        <h2 style={{ fontSize: "20px" }}>Tags</h2>
        <div className="tag-input-container">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="tag-input"
            placeholder="Add new tag"
          />
          <button onClick={handleTagAdd} className="tag-add-btn">
            Add Tag
          </button>
        </div>
        <div className="tag-list">
          {tags.map((tag, index) => (
            <div key={index} className="tag-item">
              <span>{tag}</span>
              <button
                onClick={() => handleTagDelete(index)}
                className="tag-delete-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Track Image Section */}
      <div className="image-upload-section" style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px" }}>Track Image</h2>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Track"
            style={{
              width: "100%",
              maxWidth: "300px",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />
        ) : (
          <p>No image uploaded</p>
        )}
        <button
          onClick={handleFileUploadClick}
          style={{
            padding: "8px 12px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: darkMode ? "#007BFF" : "#f39c12",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Upload Image
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Page Section */}
      <div className="page-section">
        <h2 style={{ fontSize: "20px" }}>Pages ({chapterCount})</h2>
        {pages.length === 0 ? (
          <p>
            No pages available. Please create the first page. You can change the
            order of pages from here.
          </p>
        ) : (
          <ul className="page-list" style={{ listStyle: "none", padding: 0 }}>
            {order.map((pageId, index) => {
              const ithPage: any = pages.find(
                (pageObj: any) => pageObj.id === pageId
              );
              return (
                <li
                  key={ithPage.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    border: darkMode ? "1px solid #444" : "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    backgroundColor: darkMode ? "#333" : "#fff",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                      {ithPage.chapterName}
                    </span>
                    <div
                      style={{
                        fontSize: "12px",
                        color: darkMode ? "#bbb" : "#666",
                      }}
                    >
                      <span>
                        Created: {new Date(ithPage.createdAt).toLocaleString()}
                      </span>
                      <br />
                      <span>
                        Updated: {new Date(ithPage.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => navigate(`/page/${ithPage.id}`)}
                      style={pageButtonStyle}
                    >
                      Go to page
                    </button>
                    <button
                      onClick={() => movePageUp(index)}
                      style={pageButtonStyle}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => movePageDown(index)}
                      style={pageButtonStyle}
                    >
                      ↓
                    </button>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2
                        size={18}
                        color="red"
                        onClick={() => handlePageDelete(ithPage.id)}
                      />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Button Section */}
      <div className="button-section" style={{ textAlign: "center" }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="btn save-btn"
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            border: "1px solid #000",
            background: "red",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          onClick={handleNext}
          className="btn next-btn"
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            border: "1px solid #000",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Next
        </button>
        <button
          onClick={handleCreateFirstPage}
          className="btn create-btn"
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            border: "1px solid #000",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Create First Page
        </button>
        <button
          onClick={() => {
            navigate('/');
          }}
          className="btn create-btn"
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            border: "1px solid #000",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Home
        </button>
        <button
          onClick={() => {
            const token = localStorage.getItem("token") || "";
            if (!token) navigate("/");
            const { id } = jwtDecode(token) as { id: Number };
            toast.success("Going to Profile Page...");
            navigate(`/profile/${id}`);
          }}
          className="btn create-btn"
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            border: "1px solid #000",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Profile Page
        </button>
        <button
          onClick={handleDelete}
          className="btn delete-btn"
          style={{
            padding: "10px 20px",
            border: "1px solid #000",
            background: "#fff",
            color: "#000",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>

      <style>{`
        .track-container {
          max-width: 800px;
          margin: 0 auto;
          border-radius: 8px;
          transition: background-color 0.3s, color 0.3s;
        }
        .dark-mode {
          background-color: #222;
          color: #fff;
        }
        .light-mode {
          background-color: #fff;
          color: #000;
        }
        .track-section,
        .tag-section,
        .page-section,
        .button-section,
        .image-upload-section {
          margin-bottom: 30px;
        }
        .track-label {
          font-weight: bold;
          margin-bottom: 5px;
          display: block;
        }
        .track-input,
        .tag-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #000;
          background: inherit;
          color: inherit;
        }
        .tag-input-container {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        .tag-add-btn {
          padding: 8px 12px;
          border: 1px solid #000;
          background: #000;
          color: #fff;
          cursor: pointer;
        }
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tag-item {
          background: #000;
          color: #fff;
          padding: 5px 10px;
          display: flex;
          align-items: center;
        }
        .tag-delete-btn {
          margin-left: 5px;
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 16px;
        }
        .page-list {
          list-style: none;
          padding: 0;
        }
        .btn {
          transition: background-color 0.3s;
        }
      `}</style>
    </div>
  );
};

export default Track;
