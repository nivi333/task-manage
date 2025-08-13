import React from "react";
import { Steps } from "antd";

interface RegistrationStepperProps {
  current: number;
}

const steps = [
  { title: "Personal Info" },
  { title: "Account Setup" },
  { title: "Verification" },
];

const RegistrationStepper: React.FC<RegistrationStepperProps> = ({ current }) => (
  <Steps current={current} items={steps} style={{ marginBottom: 32 }} />
);

export default RegistrationStepper;
