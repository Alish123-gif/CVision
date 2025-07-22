import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { useUserResumesQuery } from "~/lib/queries";

export function meta({}: any) {
  return [
    { title: "CVision" },
    { name: "description", content: "Welcome to CVision!" },
  ];
}

export default function Home() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const { data: resumes = [], isLoading: resumesLoading } = useUserResumesQuery(
    auth.isAuthenticated
  );

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated, isLoading, navigate]);

  return (
    <main className="bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>Track your Applications and Rate your resume</h1>
          <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>
      </section>
      <div className="resumes-section">
        {resumesLoading ? (
          <p className="text-gray-500 text-center w-full">Loading resumes...</p>
        ) : resumes.length === 0 ? (
          <p className="text-gray-500 text-center w-full">
            No resumes found. Upload your first resume!
          </p>
        ) : (
          resumes.map((resume: any) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))
        )}
      </div>
    </main>
  );
}
