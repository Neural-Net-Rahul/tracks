import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const WatchPage = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [content, setContent] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [trackId, setTrackId] = useState("");
  const [order, setOrder] = useState("");
  const [pageNo, setPageNo] = useState("");

  useEffect(() => {
    const getPageData = async () => {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        try {
          setLoading(true);
          const response = await axios.post(
            "http://localhost:3000/api/tracks/noTokenWatch",
            { pageId }
          );
          setChapterName(response.data.page.chapterName);
          setContent(response.data.page.content);
          setTrackId(response.data.page.trackId);
          setOrder(response.data.order);
          setPageNo(response.data.pageNo);
          setLoading(false);
        } catch (e:any) {
          setLoading(false);
          if (e.response && e.response.status === 500) {
            alert("Please login to access this page");
          }
          navigate("/");
        }
      } else {
        try {
          setLoading(true);
          const response = await axios.post(
            "http://localhost:3000/api/tracks/tokenWatchPage",
            {
              pageId: Number(pageId),
              token,
            }
          );
          setChapterName(response.data.page.chapterName);
          setContent(response.data.page.content);
          setTrackId(response.data.page.trackId);
          setOrder(response.data.order);
          setPageNo(response.data.pageNo);
          setLoading(false);
        } catch (e) {
          setLoading(false);
          const obj = jwtDecode(localStorage.getItem("token")!) as {id:number};
          navigate(`/profile/${obj.id}`);
        }
      }
    };
    getPageData();
  }, [pageId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try {
      const pdfContent = document.getElementById("pdfContent");
      if (!pdfContent) {
        toast.error("Content not available for PDF generation.");
        return;
      }
      toast.success("Downloading pdf...");
      const images = pdfContent.getElementsByTagName("img");
      await Promise.all(
        [...images].map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve("");
              else img.onload = img.onerror = resolve;
            })
        )
      );

      const canvas = await html2canvas(pdfContent, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgPDFHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgPDFHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgPDFHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgPDFHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgPDFHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${chapterName || "document"}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Error generating PDF.");
    }
  };

  const handlePrevious = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate(`/watch/track/${trackId}`);
        return;
      }
      toast.success("Loading Previous Page...");
      const response = await axios.post(
        "http://localhost:3000/api/tracks/prevPage",
        { token, trackId, pageId: Number(pageId), order }
      );
      const tId = response.data.trackId;
      const pPageId = response.data.prevPageId;
      if (pPageId) {
        navigate(`/watch/page/${pPageId}`);
      } else {
        navigate(`/watch/track/${tId}`);
      }
    } catch (e) {
      toast.error("An error occurred while navigating to the previous page.");
    }
  };

  const handleNext = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        alert("Please login to access next page");
        return;
      }
      toast.success("Loading Next Page...");
      const response = await axios.post(
        "http://localhost:3000/api/tracks/nextPage",
        { token, onPage: true, order, p_t_id: Number(pageId) }
      );
      if (response.status === 203) {
        toast.info("Next Page does not exist");
      } else if (response.status === 208) {
        navigate(`/watch/page/${response.data.id}`);
      }
    } catch (e) {
      toast.error("An error occurred while navigating to the next page.");
    }
  };

  const handleGoToTrack = () => {
    navigate(`/watch/track/${trackId}`);
  };

  const navButtonClass = darkMode
    ? "px-6 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-300"
    : "px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300";

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <header className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Page No: {pageNo || "-"}</h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <button
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow transition-colors duration-300"
                onClick={handleDownloadPDF}
              >
                Download PDF
              </button>
              <span className="mt-1 text-sm italic">
                Videos may not available in pdf.
              </span>
            </div>
            <button
              className={`px-5 py-2 border rounded mb-6 ${
                darkMode
                  ? "bg-orange-400 text-black border-transparent hover:bg-orange-500"
                  : "bg-black text-white border-transparent hover:bg-gray-800"
              }`}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section
          id="pdfContent"
          className={`border rounded-lg shadow-xl p-8 mb-16 ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          <h1 className="text-3xl font-extrabold text-center mb-6">
            {chapterName}
          </h1>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-opacity-90 shadow-md">
        <div
          className={`flex justify-center gap-6 py-4 ${
            darkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <button onClick={handlePrevious} className={navButtonClass}>
            Previous
          </button>
          <button onClick={handleNext} className={navButtonClass}>
            Next
          </button>
          <button onClick={handleGoToTrack} className={navButtonClass}>
            Go to Track
          </button>
        </div>
      </footer>
    </div>
  );
};

export default WatchPage;
