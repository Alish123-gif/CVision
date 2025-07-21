import React from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTrophy,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  // Determine background gradient based on score
  const gradientClass =
    score > 69
      ? "from-green-100"
      : score > 49
      ? "from-yellow-100"
      : "from-red-100";

  // Determine icon based on score
  let icon;
  if (score > 69) icon = <FaTrophy className="w-12 h-12 text-green-500" />;
  else if (score > 49)
    icon = <FaExclamationCircle className="w-12 h-12 text-yellow-500" />;
  else icon = <FaTimesCircle className="w-12 h-12 text-red-500" />;

  // Determine subtitle based on score
  const subtitle =
    score > 69 ? "Great Job!" : score > 49 ? "Good Start" : "Needs Improvement";

  return (
    <div
      className={`bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-md w-full p-6`}
    >
      {/* Top section with icon and headline */}
      <div className="flex items-center gap-4 mb-6">
        {icon}
        <div>
          <h2 className="text-2xl font-bold">ATS Score - {score}/100</h2>
        </div>
      </div>

      {/* Description section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>
        <p className="text-gray-600 mb-4">
          This score represents how well your resume is likely to perform in
          Applicant Tracking Systems used by employers.
        </p>

        {/* Suggestions list */}
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3">
              {suggestion.type === "good" ? (
                <FaCheckCircle className="w-5 h-5 mt-1 text-green-700" />
              ) : (
                <FaExclamationTriangle className="w-5 h-5 mt-1 text-amber-700" />
              )}
              <p
                className={
                  suggestion.type === "good"
                    ? "text-green-700"
                    : "text-amber-700"
                }
              >
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing encouragement */}
      <p className="text-gray-700 italic">
        Keep refining your resume to improve your chances of getting past ATS
        filters and into the hands of recruiters.
      </p>
    </div>
  );
};

export default ATS;
