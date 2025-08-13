import React from "react";

function getStrength(password: string): {score: number, label: string} {
  let score = 0;
  if (!password) return {score, label: ""};
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  if (score === 0) return {score: 0, label: ""};
  if (score < 3) return {score, label: "Weak"};
  if (score < 5) return {score, label: "Medium"};
  return {score, label: "Strong"};
}

interface Props {
  password: string;
}

const PasswordStrengthMeter: React.FC<Props> = ({ password }) => {
  const { score, label } = getStrength(password);
  
  const getStrengthClass = () => {
    if (score === 0) return "";
    if (score < 3) return "weak";
    if (score < 5) return "fair";
    return "strong";
  };

  return (
    <div className="password-strength-meter">
      <div className="password-strength-bar">
        <div 
          className={`password-strength-fill ${getStrengthClass()}`}
          style={{ width: `${score * 20}%` }}
        />
      </div>
      {label && (
        <div className={`password-strength-text ${getStrengthClass()}`}>
          {label}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
