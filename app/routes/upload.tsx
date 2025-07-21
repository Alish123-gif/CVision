"use client";
import React, { useState } from "react";
import Navbar from "~/components/Navbar";
import { FaFileAlt } from "react-icons/fa";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { preparePrompt } from "~/../constants";

// Helper to hash a file (SHA-256)
async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

    // Hash the file
    const fileHash = await hashFile(resume);
    const resumeKey = `resume:${auth.user.uuid}:${fileHash}`;

    // Check for existing resume with this hash
    const existing = await kv.get(resumeKey);
    if (existing) {
      setStatus("Resume already exists. Using existing analysis.");
      setIsProcessing(false);
      // Optionally, redirect to details page for this resume
      const existingData = JSON.parse(existing);
      window.location.href = `/resume/${existingData.id}`;
      return;
    }

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
      resumeImage: uploadedImage.path, // store the image path, not id
      fileHash,
      feedback: "",
    };

    await kv.set(resumeKey, JSON.stringify(data));
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

    await kv.set(resumeKey, JSON.stringify(data));
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
            <>
              <h2>Processing your resume...</h2>
              <div className="relative inline-block w-16 h-16 mb-2">
                <FaFileAlt className="w-16 h-16 rounded-lg text-secondary" />
                <div
                  className="absolute left-0 w-16 h-1 bg-primary opacity-80 scan-line-animate"
                  style={{ borderRadius: "2px" }}
                />
                {status}
              </div>
            </>
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
