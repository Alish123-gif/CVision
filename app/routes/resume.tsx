import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import type { Feedback } from "types";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => [
  { title: "Resumind | Review " },
  { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading, auth.isAuthenticated, id, navigate]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      if (!resume) {
        setLoadError("Resume not found.");
        return;
      }

      const data = JSON.parse(resume);
      let pdfOk = false;
      let imgOk = false;

      // Load PDF for download/view
      try {
        const resumeBlob = await fs.read(data.resumePath);
        if (resumeBlob) {
          const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
          setResumeUrl(URL.createObjectURL(pdfBlob));
          pdfOk = true;
        }
      } catch (e) {
        setResumeUrl("");
      }

      // Load image for preview
      try {
        if (data.resumeImage) {
          const imageBlob = await fs.read(data.resumeImage);
          if (imageBlob) {
            setImageUrl(URL.createObjectURL(imageBlob));
            imgOk = true;
          }
        }
      } catch (e) {
        setImageUrl("");
      }

      setFeedback(data.feedback);
      if (!pdfOk || !imgOk) {
        setLoadError(
          "Some files could not be loaded, but analysis is available."
        );
      }
    };

    loadResume();
  }, [id, fs, kv]);

  return (
    <main className="!pt-0">
      <nav className="flex items-center gap-3 py-6 px-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow hover:bg-gray-50 transition group"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-100 group-hover:bg-violet-200 transition">
            <img src="/icons/back.svg" alt="Back" className="w-3 h-3" />
          </span>
          <span className="text-base font-semibold text-gray-800 group-hover:text-violet-700 transition">
            Back to Homepage
          </span>
        </Link>
      </nav>
      <div className="flex justify-center w-full px-4">
        <div className="flex flex-row w-full max-w-[90%] max-lg:flex-col-reverse">
          {/* Left: Resume Image Preview */}
          <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
            {imageUrl ? (
              <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                {resumeUrl ? (
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={imageUrl}
                      className="w-full h-full object-contain rounded-2xl"
                      title="resume"
                    />
                  </a>
                ) : (
                  <img
                    src={imageUrl}
                    className="w-full h-full object-contain rounded-2xl"
                    title="resume"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <img
                  src="/images/pdf.png"
                  className="w-32 h-32 opacity-40"
                  alt="No preview available"
                />
                <span className="text-gray-400 mt-2">No preview available</span>
              </div>
            )}
          </section>
          {/* Right: Feedback/Analysis */}
          <section className="feedback-section">
            <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
            {loadError && <div className="text-red-500 mb-4">{loadError}</div>}
            {feedback ? (
              <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                <Summary feedback={feedback} />
                <ATS
                  score={feedback.ATS.score || 0}
                  suggestions={feedback.ATS.tips || []}
                />
                <Details feedback={feedback} />
              </div>
            ) : (
              <img src="/images/resume-scan-2.gif" className="w-full" />
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Resume;
