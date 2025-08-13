import React from "react";
import styled from "styled-components";

const StrengthBar = styled.div<{ strength: number }>`
  height: 8px;
  border-radius: 6px;
  background: ${({ strength }) => {
    if (strength === 0) return "#eee";
    if (strength < 2) return "#ff4d4f";
    if (strength < 3) return "#faad14";
    if (strength < 4) return "#52c41a";
    return "#389e0d";
  }};
  width: ${({ strength }) => (strength * 25)}%;
  transition: width 0.3s, background 0.3s;
`;

const StrengthText = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #888;
  text-align: right;
`;

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
  return (
    <div>
      <StrengthBar strength={score} />
      {label && <StrengthText>{label}</StrengthText>}
    </div>
  );
};

export default PasswordStrengthMeter;
