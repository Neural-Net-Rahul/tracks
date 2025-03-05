import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const WatchTrack = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();

  const [trackName, setTrackName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [order, setOrder] = useState<Number[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [chapterCount, setChapterCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const getTrackData = async () => {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        try {
          setLoading(true);
          const response = await axios.post(
            "https://tracks-2qce.onrender.com/api/tracks/noTokenWatchTrack",
            { trackId: Number(trackId) }
          );
          const track = response.data.track;
          setTrackName(track.name);
          setTags(track.tags);
          setOrder(track.order);
          setPages(track.pages);
          setChapterCount(track.chaptersCount);
          setLoading(false);
        } catch (e: any) {
          setLoading(false);
          navigate("/");
        }
      } else {
        try {
          setLoading(true);
          const response = await axios.post(
            "https://tracks-2qce.onrender.com/api/tracks/tokenWatchTrack",
            {
              trackId: Number(trackId),
              token,
            }
          );
          const track = response.data.track;
          console.log("track", track);
          setTrackName(track.name);
          setTags(track.tags);
          setOrder(track.order);
          setPages(track.pages);
          setChapterCount(track.chaptersCount);
          setLoading(false);
        } catch (e) {
          setLoading(false);
          const obj = jwtDecode(localStorage.getItem("token")!) as {
            id: number;
          };
          navigate(`/profile/${obj.id}`);
        }
      }
    };
    getTrackData();
  }, [navigate, trackId]);

  // Handler for Next button
  const handleNext = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) navigate("/");
      toast.success("Searching for next page...");
      const response = await axios.post(
        "https://tracks-2qce.onrender.com/api/tracks/nextPage",
        {
          order,
          onPage: false,
          p_t_id: Number(trackId),
          token,
        }
      );
      if (response.status === 202) {
        const id = response.data.id;
        navigate(`/watch/page/${id}`);
      }
    } catch (e: any) {
      if (e.response && e.response.status === 413) navigate("/");
      alert("Some error occurred");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`max-w-3xl mx-auto min-h-screen p-5 transition-colors duration-300 ${
        darkMode ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-900"
      } font-outfit`}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold">Track</h1>
        <button
          onClick={toggleDarkMode}
          className={`px-3 py-2 rounded cursor-pointer transition-colors duration-300 ${
            darkMode
              ? "bg-yellow-500 hover:bg-yellow-400"
              : "bg-blue-500 hover:bg-blue-400"
          } text-white`}
        >
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </header>

      {/* Track Name Section */}
      <div className="mb-8">
        <label className="block font-bold mb-1">Track Name:</label>
        <div className="text-lg">{trackName}</div>
      </div>

      {/* Tag Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div key={index} className="bg-black text-white px-3 py-1 rounded">
              <span>{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pages Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Pages ({chapterCount})</h2>
        {pages.length === 0 ? (
          <p>No pages available.</p>
        ) : (
          <ul className="list-none p-0">
            {order.map((pageId) => {
              const ithPage: any = pages.find(
                (pageObj: any) => pageObj.id === pageId
              );
              if (!ithPage) return null;
              return (
                <li
                  key={ithPage.id}
                  className={`p-3 rounded-md mb-2 transition-colors duration-300 ${
                    darkMode
                      ? "border border-gray-600 bg-gray-800"
                      : "border border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-base">
                        {ithPage.chapterName}
                      </span>
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <span>
                          Created:{" "}
                          {new Date(ithPage.createdAt).toLocaleString()}
                        </span>
                        <br />
                        <span>
                          Updated:{" "}
                          {new Date(ithPage.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/watch/page/${ithPage.id}`)}
                      className={`rounded px-2 py-1 text-sm transition-colors duration-200 ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-black"
                      }`}
                    >
                      Go to page
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Button Section */}
      <div className="text-center">
        <button
          onClick={handleNext}
          className="px-4 py-2 mr-2 border border-black bg-black text-white rounded hover:bg-gray-800 transition duration-200"
        >
          Next
        </button>
        <button
          onClick={() => {
            navigate("/");
          }}
          className="px-4 py-2 mr-2 border border-black bg-black text-white rounded hover:bg-gray-800 transition duration-200"
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
          className="px-4 py-2 border border-black bg-black text-white rounded hover:bg-gray-800 transition duration-200"
        >
          Profile Page
        </button>
      </div>
    </div>
  );
};

export default WatchTrack;
