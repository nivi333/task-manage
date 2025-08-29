import React from "react";
import { Collapse, Typography } from "antd";

const { Paragraph, Text } = Typography;

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export interface FAQSectionProps {
  items: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ items }) => {
  const collapseItems = items.map((it, idx) => ({
    key: String(idx),
    label: it.question,
    children: <div role="region" aria-label={`Answer: ${it.question}`}>{it.answer}</div>,
  }));

  return (
    <div>
      <Paragraph>
        <Text type="secondary">Frequently asked questions</Text>
      </Paragraph>
      <Collapse items={collapseItems} accordion bordered={false} />
    </div>
  );
};

export default FAQSection;
