import { Link, useNavigate, useParams } from "react-router";
import { useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import type { Feedback } from "types";
import Summary from "../components/Summary";
import ATS from "../components/ATS";
import Details from "../components/Details";
import { FaArrowLeft, FaFileAlt } from "react-icons/fa";
import {
  useResumeDetailsQuery,
  useResumeImageQuery,
  useFSRead,
} from "~/lib/queries";

export const meta = () => [
  { title: "Resumind | Review " },
  { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
  console.log("Resume");
  const { auth, isLoading } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();

  console.log("[Resume Page] id param:", id);

  // Fetch resume details
  const {
    data: resume,
    isLoading: resumeLoading,
    error: resumeError,
  } = useResumeDetailsQuery(id);
  console.log(
    "[Resume Page] useResumeDetailsQuery result:",
    resume,
    resumeLoading,
    resumeError
  );
  // Fetch image blob URL
  const { data: imageUrl = "", isLoading: imageLoading } = useResumeImageQuery(
    resume &&
      resume.resumeImage &&
      (resume.resumeImage.startsWith("/") || resume.resumeImage.startsWith("~"))
      ? resume.resumeImage
      : undefined,
    !!resume
  );
  // Fetch PDF blob for download
  const { data: resumeBlob, isLoading: pdfLoading } = useFSRead(
    resume && resume.resumePath,
    !!resume
  );
  const resumeUrl = resumeBlob
    ? URL.createObjectURL(new Blob([resumeBlob], { type: "application/pdf" }))
    : "";

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading, auth.isAuthenticated, id, navigate]);

  if (resumeLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  if (resumeError || !resume) {
    console.log("[Resume Page] Resume not found for id:", id);
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Resume not found.
      </div>
    );
  }

  return (
    <main className="!pt-0">
      <nav className="flex items-center gap-3 py-6 px-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow hover:bg-gray-50 transition group"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-100 group-hover:bg-violet-200 transition">
            <FaArrowLeft className="w-3 h-3" />
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
            {imageLoading ? (
              <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                <span className="animate-spin">Loading...</span>
              </div>
            ) : imageUrl ? (
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
                <FaFileAlt className="w-32 h-32 opacity-40" />
                <span className="text-gray-400 mt-2">No preview available</span>
              </div>
            )}
          </section>
          {/* Right: Feedback/Analysis */}
          <section className="feedback-section">
            <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
            {resume.feedback ? (
              <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                <Summary feedback={resume.feedback} />
                <ATS
                  score={resume.feedback.ATS.score || 0}
                  suggestions={resume.feedback.ATS.tips || []}
                />
                <Details feedback={resume.feedback} />
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
