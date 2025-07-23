"use client";
import React, { useState } from "react";
import Navbar from "~/components/Navbar";
import { FaFileAlt } from "react-icons/fa";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { preparePrompt } from "~/../constants";

function Step({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
        active
          ? "bg-primary text-white border-primary shadow"
          : "bg-gray-100 text-gray-400 border-gray-200"
      }`}
    >
      {label}
    </span>
  );
}

const upload = () => {
  const { auth, isLoading, ai, kv, fs } = usePuterStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
  }) => {
    setIsProcessing(true);
    setStatus("Checking for duplicate resumes...");

    if (!resume || !auth.user) return;

    setStatus("Uploading your resume...");
    const uploadedFile = await fs.upload([resume]);
    if (!uploadedFile) return setStatus("Failed to upload resume");

    setStatus("Converting your resume to image...");
    const { convertPdfToImage } = await import("~/lib/pdf-image");
    const imageFile = await convertPdfToImage(resume);
    if (!imageFile) return setStatus("Failed to convert resume to image");

    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatus("Failed to upload resume image");

    setStatus("Saving your resume...");
    const { generateUUID } = await import("~/lib/utils");
    const UUID = generateUUID();

    const data = {
      id: UUID,
      companyName,
      jobTitle,
      jobDescription,
      resumePath: uploadedFile.path,
      resumeImage: uploadedImage.path,
      feedback: "",
    };

    await kv.set(`resume:${UUID}`, JSON.stringify(data));
    setStatus("Analyzing your resume...");

    const feedback = await ai.feedback(
      uploadedImage.path,
      preparePrompt({ jobTitle, jobDescription })
    );
    if (!feedback) return setStatus("Error: Failed to analyze resume");
    const feedbackText =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);

    await kv.set(`resume:${UUID}`, JSON.stringify(data));
    setStatus("Resume analyzed successfully");
    setIsProcessing(false);
    // Redirect to details page for this resume
    window.location.href = `/resume/${UUID}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!companyName || !jobTitle || !jobDescription || !resume) {
      return;
    }
    handleAnalyze({ companyName, jobTitle, jobDescription });
  };

  const handleFileSelect = (file: File | null) => {
    setResume(file);
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center mt-8">
              <div className="bg-white/80 rounded-2xl shadow-lg px-8 py-8 flex flex-col items-center w-full max-w-md border border-gray-200 animate-fade-in">
                <div className="mb-4 flex flex-col items-center">
                  {/* Animated spinner */}
                  <span className="relative flex h-16 w-16 mb-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-16 w-16 bg-primary/10 items-center justify-center">
                      <FaFileAlt className="w-10 h-10 text-primary" />
                    </span>
                  </span>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Processing your resume...
                  </h2>
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 my-2">
                    <Step
                      active={status.includes("Uploading")}
                      label="Upload"
                    />
                    <Step
                      active={status.includes("Converting")}
                      label="Convert"
                    />
                    <Step active={status.includes("Saving")} label="Save" />
                    <Step
                      active={status.includes("Analyzing")}
                      label="Analyze"
                    />
                  </div>
                  <div className="w-full text-center mt-2">
                    <span className="inline-block px-4 py-2 rounded bg-primary/10 text-primary font-medium animate-pulse">
                      {status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              className="flex flex-col gap-4 mt-8"
              onSubmit={handleSubmit}
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default upload;
