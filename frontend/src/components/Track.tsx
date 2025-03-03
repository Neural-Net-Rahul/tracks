import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

const Track = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const [trackName, setTrackName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [order, setOrder] = useState<Number[]>([]);
  const [pages, setPages] = useState([]);
  const [chapterCount, setChapterCount] = useState(0);
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    const getTrackData = async () => {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate("/");
        return;
      }
      try {
        setLoading(loading => !loading)
        const response = await axios.post(
          "http://localhost:3000/api/tracks/trackData",
          { trackId, token }
        );
        const track = response.data.track;
        console.log("track", track);

        if (track) {
          setLoading(loading => !loading);
          setTrackName(track.name || "");
          setTags(track.tags || []);
          setPages(track.pages || []);
          setOrder(track.order || []);
          setChapterCount(track.chaptersCount);
        }
      } catch (e) {
        const obj = jwtDecode<{ id: string }>(token);
        navigate(`/profile/${obj.id}`);
      }
    };
    getTrackData();
  }, []);


  const handleTagAdd = () => {
    if (tagInput.trim() !== "") {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagDelete = (index:any) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const movePageUp = async(index:any) => {
    if (index === 0) return;
    let newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    setOrder(() => newOrder);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
      }
      await axios.post("http://localhost:3000/api/tracks/saveTrack", {
        name: trackName,
        tags,
        order : newOrder,
        trackId,
        token,
      });
    } catch (e: any) {
      if (e.response.status === 413) {
        navigate("/");
      }
      alert("Some error occurred");
    }
  };

  const movePageDown = async (index:any) => {
    if (index === order.length - 1) return;
    let newOrder = [...order];
    [newOrder[index + 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index + 1],
    ];
    setOrder(() => newOrder);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
      }
      await axios.post("http://localhost:3000/api/tracks/saveTrack", {
        name: trackName,
        tags,
        order : newOrder,
        trackId,
        token,
      });
    } catch (e: any) {
      if (e.response.status === 413) {
        navigate("/");
      }
      alert("Some error occurred");
    }
  };

  const handleCreateFirstPage = async() => {
    try{
        const token = localStorage.getItem('token');
        if (!token) {
          navigate("/");
        }
        toast.success("Creating first page...");
        const response = await axios.post('http://localhost:3000/api/tracks/createPage',{onPage:false, order, p_t_Id:trackId, trackId : Number(trackId), token});
        const pageId = response.data.id;
        navigate(`/page/${pageId}`);
    }catch(e:any){
        if(e.response.status === 413){
            navigate('/')
        }
        alert('Error in creating page');
    }
  };

  const handleSave = async() => {
    try{
        const token = localStorage.getItem('token');
        if(!token){
            navigate('/');
        }
        toast.success("Details Saved...");
        await axios.post('http://localhost:3000/api/tracks/saveTrack',{
            name:trackName, tags, order, trackId, token
        })
    }
    catch(e:any){
        if (e.response.status === 413) {
          navigate("/");
        }
        alert('Some error occurred');
    }
  };

  const handleNext = async() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
      }
      toast.success("Searching for next page...");
      const response = await axios.post("http://localhost:3000/api/tracks/nextPage", {
        order, onPage: false, p_t_id:Number(trackId), token
      });
      if(response.status === 202){
        const id = response.data.id;
        navigate(`/page/${id}`);
      }
    } catch (e: any) {
      if (e.response.status === 413) {
        navigate("/");
      }
      alert("Some error occurred");
    }
  };

  const handleDelete = async () => {
    try{
        const token = localStorage.getItem('token') || '';
        if (!token) {
          navigate("/");
        }
        toast.success("Deleting Track...");
        await axios.post("http://localhost:3000/api/tracks/deleteTrack",{trackId:Number(trackId), token});
        const obj = jwtDecode<{ id: string }>(token);
        navigate(`/profile/${obj.id}`);
    }
    catch(e:any){
        if (e.response.status === 413) {
          navigate("/");
        }
        alert('Error while deleting Track');
    }
  };

  const  handlePageDelete = async (id:Number) => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate("/");
      }
      toast.success("Deleting Page...");
      const response = await axios.post("http://localhost:3000/api/tracks/deletePage", {
        trackId: Number(trackId),
        pageId : id, order,
        token,
      });
      console.log(response.data);
      setOrder(response.data.newOrder);
    } catch (e: any) {
      if (e.response.status === 413) {
        navigate("/");
      }
      alert("Error while deleting Page");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="track-container" style={{ fontFamily: "outfit" }}>
      <h1 style={{ fontSize: "35px" }}>Track </h1>

      {/* Track Name Section */}
      <div className="track-section">
        <label htmlFor="trackName" className="track-label">
          Track Name
        </label>
        <input
          type="text"
          id="trackName"
          value={trackName}
          onChange={(e) => {
            setTrackName(e.target.value);
          }}
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

      {/* Page Section */}
      <div className="page-section">
        <h2 style={{ fontSize: "20px" }}>Pages ({chapterCount})</h2>
        {pages.length === 0 ? (
          <p>
            No pages available. Please create the first page. You can change the
            order of pages from here.
          </p>
        ) : (
          <ul className="page-list">
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
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    backgroundColor: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                      {ithPage.chapterName}
                    </span>
                    <div style={{ fontSize: "12px", color: "#666" }}>
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
                      onClick={() => 
                          navigate(`/page/${ithPage.id}`)
                      }
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.backgroundColor =
                          "#dddd")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.backgroundColor =
                          "#eeee")
                      }
                      style={{
                        backgroundColor: "#eee",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "background-color 0.2s ease-in-out",
                      }}
                    >
                      Go to page
                    </button>
                    <button
                      onClick={() => movePageUp(index)}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.backgroundColor =
                          "#dddd")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.backgroundColor =
                          "#eeee")
                      }
                      style={{
                        backgroundColor: "#eee",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "background-color 0.2s ease-in-out",
                      }}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => movePageDown(index)}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.backgroundColor =
                          "#dddd")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.backgroundColor =
                          "#eeee")
                      }
                      style={{
                        backgroundColor: "#eee",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "background-color 0.2s ease-in-out",
                      }}
                    >
                      ↓
                    </button>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Trash2
                        size={18}
                        color="red"
                        onClick={() => {
                          handlePageDelete(ithPage.id);
                        }}
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
      <div className="button-section">
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="btn save-btn"
          style={{ background: "red" }}
        >
          Save
        </button>
        <button onClick={handleNext} className="btn next-btn">
          Next
        </button>
        <button onClick={handleCreateFirstPage} className="btn create-btn">
          Create First Page
        </button>
        <button onClick={()=>{
            const token = localStorage.getItem('token') || '';
            if(!token){
                navigate('/');
            }
            const { id } = jwtDecode(token) as {id : Number};
            toast.success("Going to Profile Page...");
            navigate(`/profile/${id}`)
        }} className="btn create-btn">
          Profile Page
        </button>
        <button onClick={handleDelete} className="btn delete-btn">
          Delete
        </button>
      </div>

      <style>{`
        .track-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #fff;
          color: #000;
          font-family: Arial, sans-serif;
        }
        h1,
        h2 {
          text-align: center;
        }
        .track-section,
        .tag-section,
        .page-section,
        .button-section {
          margin-bottom: 30px;
        }
        .track-label {
          font-weight: bold;
          margin-bottom: 5px;
          display: block;
        }
        .track-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #000;
          background: #fff;
          color: #000;
        }
        .tag-input-container {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        .tag-input {
          flex: 1;
          padding: 8px;
          border: 1px solid #000;
          background: #fff;
          color: #000;
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
        .page-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid #000;
          margin-bottom: 8px;
          background: #fff;
        }
        .page-controls {
          display: flex;
          gap: 5px;
        }
        .page-control-btn {
          padding: 5px 10px;
          border: 1px solid #000;
          background: #000;
          color: #fff;
          cursor: pointer;
        }
        .button-section {
          text-align: center;
        }
        .button-section .btn {
          padding: 10px 20px;
          margin: 0 10px 10px 0;
          border: 1px solid #000;
          background: #000;
          color: #fff;
          cursor: pointer;
        }
        .button-section .delete-btn {
          background: #fff;
          color: #000;
        }
      `}</style>
    </div>
  );
};

export default Track;
