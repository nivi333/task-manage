import React from "react";
import AppLayout from "../components/layout/AppLayout";
import { Card } from "antd";
import { HeaderTitle, TTButton } from "../components/common";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AppLayout title={<HeaderTitle level={3}>Terms & Conditions</HeaderTitle>} contentPadding={16}>
      <Card>
        <p>This is a temporary placeholder for the Terms & Conditions page.</p>
        <p>
          Replace this content with your real terms and privacy documents. Until then, this page
          prevents 404 errors when users click the “terms and conditions” link during registration.
        </p>
        <TTButton ttVariant="transparent" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Back
        </TTButton>
      </Card>
    </AppLayout>
  );
};

export default TermsPage;
