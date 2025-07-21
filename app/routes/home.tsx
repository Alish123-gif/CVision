import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

export function meta({}: any) {
  return [
    { title: "CVision" },
    { name: "description", content: "Welcome to CVision!" },
  ];
}

export default function Home() {
  const { auth, isLoading, getUserResumes } = usePuterStore();
  const [resumes, setResumes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      getUserResumes().then(setResumes);
    }
  }, [auth.isAuthenticated, getUserResumes]);

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
        {resumes.length === 0 ? (
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
