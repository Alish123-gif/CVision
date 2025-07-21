import React from "react";
import type { Resume } from "../../types";

interface ResumeCardProps {
  resume: Resume;
}

const ResumeCard = ({ resume }: ResumeCardProps) => {
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
      <img src={resume.imagePath} alt={`${resume.companyName} Resume`} />

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

        <a
          href={resume.resumePath}
          className="primary-button block text-center"
        >
          View Details
        </a>
      </div>
    </div>
  );
};

export default ResumeCard;
