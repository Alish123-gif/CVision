import React from "react";
import type { Resume } from "../../types";
import { Link } from "react-router";
import { useResumeImageQuery } from "~/lib/queries";
import { FaFileAlt } from "react-icons/fa";

interface ResumeCardProps {
  resume: Resume;
}

const ResumeCard = ({ resume }: ResumeCardProps) => {
  console.log("ResumeCard", resume);
  const { data: imageUrl = <FaFileAlt />, isLoading } = useResumeImageQuery(
    resume.resumeImage &&
      (resume.resumeImage.startsWith("/") || resume.resumeImage.startsWith("~"))
      ? resume.resumeImage
      : undefined
  );

  const getScoreClass = (score: number) => {
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    if (score >= 40) return "score-average";
    return "score-poor";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🎯";
    if (score >= 60) return "👍";
    if (score >= 40) return "⚠️";
    return "❌";
  };

  return (
    <div className="resume-card fade-in">
      {isLoading ? (
        <div className="w-full h-32 flex items-center justify-center bg-gray-100">
          <span className="animate-spin">Loading...</span>
        </div>
      ) : typeof imageUrl == "string" ? (
        <img src={imageUrl} alt={`${resume.companyName} Resume`} />
      ) : (
        imageUrl
      )}

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {resume.jobTitle} at {resume.companyName}
        </h3>

        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-600 font-medium">
            Overall Score
          </span>
          <span
            className={`score-badge ${getScoreClass(
              resume.feedback.overallScore
            )}`}
          >
            {getScoreEmoji(resume.feedback.overallScore)}{" "}
            {resume.feedback.overallScore}%
          </span>
        </div>

        <Link
          to={`/resume/${resume.id}`}
          className="primary-button block text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ResumeCard;
