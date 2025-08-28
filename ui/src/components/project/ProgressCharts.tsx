import React, { useMemo } from 'react';
import { Card, Col, Row, Typography, Progress } from 'antd';
import { Line } from '@ant-design/plots';
import { BurndownPoint, ProjectMetrics } from '../../types/project';

const { Text } = Typography;

interface Props {
  burndown: BurndownPoint[];
  metrics: ProjectMetrics;
}

const ProgressCharts: React.FC<Props> = ({ burndown, metrics }) => {
  const lineData = useMemo(() => burndown.map(p => ({ date: p.date, remaining: p.remaining })), [burndown]);

  return (
    <Row className="tt-progress-section" gutter={[12, 12]}>
      <Col xs={24} lg={16}>
        <Card className="tt-card-compact" title={<Text strong>Burndown</Text>}>
          <Line
            data={lineData}
            xField="date"
            yField="remaining"
            axis={{ x: { labelAutoRotate: true }, y: { nice: true } }}
            smooth
            emptyContent={{ text: 'No burndown data' }}
          />
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card className="tt-card-compact" title={<Text strong>Completion</Text>}>
          <div className="tt-centerpad">
            <Progress type="dashboard" percent={Math.round(metrics.completionPercent || 0)} strokeColor="#52c41a" />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ProgressCharts;
