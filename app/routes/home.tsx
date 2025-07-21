import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "../../constants";
import ResumeCard from "~/components/ResumeCard";
import type { Resume } from "../../types";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CVision" },
    { name: "description", content: "Welcome to CVision!" },
  ];
}

export default function Home() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();

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
        {resumes?.map((resume: Resume) => (
          <ResumeCard key={resume.id} resume={resume} />
        ))}
      </div>
    </main>
  );
}
