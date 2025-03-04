import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";

const Page = () => {
  const { pageId } = useParams();
  const [loading, setLoading] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [content, setContent] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState("");
  const [order, setOrder] = useState("");
  const [apikey, setApiKey] = useState("");
  const [pageNo, setPageNo] = useState("");

  useEffect(() => {
    const getPageData = async () => {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate("/");
        return;
      }
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3000/api/tracks/pageData",
          {
            pageId: Number(pageId),
            token,
          }
        );
        const res = await axios.post(
          "http://localhost:3000/api/tracks/getEditorApiKey",
          { token }
        );
        setApiKey(res.data.api_key);
        const data = response.data;
        const page = response.data.page;
        if (page) {
          setLoading((prevLoading) => !prevLoading);
          setChapterName(page.chapterName);
          setContent(page.content);
          setTrackId(data.trackId);
          setOrder(data.order);
          setPageNo(data.pageNo);
          setDarkMode(true);
        }
      } catch (e) {
        const obj = jwtDecode<{ id: string }>(
          localStorage.getItem("token") || ""
        );
        navigate(`/profile/${obj.id}`);
      } finally {
        setLoading(false);
      }
    };
    getPageData();
  }, [pageId, navigate]);

  if (loading || !apikey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  const handlePrevious = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate("/");
        return;
      }
      toast.success("Prev Page...");
      const response = await axios.post(
        "http://localhost:3000/api/tracks/prevPage",
        {
          token,
          trackId,
          pageId: Number(pageId),
          order,
        }
      );
      const tId = response.data.trackId;
      const pPageId = response.data.prevPageId;
      if (pPageId) {
        navigate(`/page/${pPageId}`);
      } else {
        navigate(`/create/${tId}`);
      }
    } catch (e) {
      alert("Some error occurred");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate("/");
        return;
      }
      toast.success("Saving...");
      await axios.post("http://localhost:3000/api/tracks/savePage", {
        token,
        chapterName,
        pageId: Number(pageId),
        content,
      });
    } catch (e) {
      alert("Some error occurred");
    }
  };

  const handleNext = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate("/");
        return;
      }
      toast.success("Next Page...");
      const response = await axios.post(
        "http://localhost:3000/api/tracks/nextPage",
        {
          token,
          onPage: true,
          order,
          p_t_id: Number(pageId),
        }
      );
      console.log(response);
      if (response.status === 203) {
        toast.success("Next Page does not exist");
      } else if (response.status === 208) {
        navigate(`/page/${response.data.id}`);
      }
    } catch (e) {
      alert("Some error occurred");
    }
  };

  const handleDeletePage = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate("/");
        return;
      }
      toast.success("Deleting...");
      const response = await axios.post(
        "http://localhost:3000/api/tracks/deletePage",
        {
          token,
          pageId,
          order,
          trackId,
        }
      );
      if (response.data.trackId) {
        navigate(`/create/${response.data.trackId}`);
      } else {
        navigate(`/page/${response.data.pageId}`);
      }
    } catch (e) {
      alert("Some error occurred");
    }
  };

  const handleCreateNext = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate("/");
        return;
      }
      toast.success("Creating next Page...");
      const response = await axios.post(
        "http://localhost:3000/api/tracks/createPage",
        {
          token,
          onPage: true,
          order,
          p_t_Id: Number(pageId),
          trackId,
        }
      );
      navigate(`/page/${response.data.pId}`);
    } catch (e) {
      alert("Some error occurred");
    }
  };

  
  const handleGoToTrack = () => {
    navigate(`/track/${trackId}`);
  };

  return (
    <div
      className={`min-h-screen p-6 w-full ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Header Section with responsive layout */}
      <div className="flex flex-col md:flex-row justify-around items-center gap-4">
        <div>
          <div className="text-lg font-semibold">Page No. {pageNo}</div>
          <div className="text-sm text-yellow-600">
            For downloading PDF go to File then Export
          </div>
        </div>
        <div className="w-full md:w-auto">
          <label className="text-lg font-semibold block mb-1">
            Chapter Name :
          </label>
          <input
            type="text"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            className="border p-2 rounded w-full text-black border-black"
          />
        </div>
        <button
          className={`px-4 py-2 border rounded ${
            !darkMode
              ? "border-black bg-black text-white"
              : "border-white bg-orange-400 text-black"
          }`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Editor Section */}
      <div className="my-6 border rounded shadow-lg p-4 w-full">
        <Editor
          apiKey={apikey}
          value={content}
          onEditorChange={(newContent) => {
            console.log(typeof newContent); // string
            return setContent(newContent);
          }}
          init={{
            content_style: `
                body { 
                    background-color: ${darkMode ? "#1e1e1e" : "#ffffff"};
                    font-family: Arial, sans-serif; 
                    font-size: 14px;
                    background: ${darkMode ? "#1e1e1e" : "#ffffff"};
                    color: ${darkMode ? "#ffffff" : "#000000"};
                }
                `,
            skin: darkMode ? "oxide-dark" : "oxide",
            images_upload_handler: async (blobInfo:any, success:any, failure:any) => {
              try {
                const file = new File([blobInfo.blob()], blobInfo.filename());
                const formData = new FormData();
                formData.append("image", file);

                const response = await axios.post(
                  "http://localhost:3000/api/uploadImage",
                  formData,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );

                success(response.data.imageUrl);
              } catch (error) {
                failure("Image upload failed.");
              }
            },
            plugins: [
              "anchor",
              "autolink",
              "charmap",
              "codesample",
              "emoticons",
              "image",
              "link",
              "lists",
              "media",
              "searchreplace",
              "table",
              "visualblocks",
              "wordcount",
              "checklist",
              "mediaembed",
              "casechange",
              "export",
              "formatpainter",
              "pageembed",
              "a11ychecker",
              "tinymcespellchecker",
              "permanentpen",
              "powerpaste",
              "advtable",
              "advcode",
              "editimage",
              "advtemplate",
              "ai",
              "mentions",
              "tinycomments",
              "tableofcontents",
              "footnotes",
              "mergetags",
              "autocorrect",
              "typography",
              "inlinecss",
              "markdown",
              "importword",
              "exportword",
              "exportpdf",
              "media",
            ],
            toolbar:
              "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
            tinycomments_mode: "embedded",
            tinycomments_author: "Author name",
            mergetags_list: [
              { value: "First.Name", title: "First Name" },
              { value: "Email", title: "Email" },
            ],
            ai_request: (request:any, respondWith:any) =>
              respondWith.string(() =>
                Promise.reject("See docs to implement AI Assistant")
              ),
          }}
        />
      </div>

      {/* Buttons Section with wrapping for mobile */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <button
          className={`px-4 py-2 border rounded ${
            !darkMode ? "bg-black text-white" : "bg-white text-black"
          }`}
          onClick={handlePrevious}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 border rounded"
          onClick={handleSave}
          style={
            !darkMode
              ? { background: "red", color: "white" }
              : { background: "red" }
          }
        >
          Save
        </button>
        <button
          className={`px-4 py-2 border rounded ${
            !darkMode ? "bg-black text-white" : "bg-white text-black"
          }`}
          onClick={handleNext}
        >
          Next
        </button>
        <button
          className={`px-4 py-2 border rounded ${
            !darkMode ? "bg-black text-white" : "bg-white text-black"
          }`}
          onClick={handleCreateNext}
        >
          Create Next Page
        </button>
        <button
          className={`px-4 py-2 border rounded ${
            !darkMode ? "bg-black text-white" : "bg-white text-black"
          }`}
          onClick={handleGoToTrack}
        >
          Go to Track
        </button>
        <button
          className={`px-4 py-2 border rounded border-black text-red-500 ${
            !darkMode
              ? "bg-white text-black"
              : "bg-black text-red-500 border-white"
          }`}
          onClick={handleDeletePage}
        >
          Delete Page
        </button>
      </div>
    </div>
  );
};

export default Page;
