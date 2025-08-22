import React, { useMemo } from "react";
import { Row, Col, Card, Statistic } from "antd";
import { Pie, Line } from "@ant-design/plots";
import { Task } from "../../types/task";

interface TaskStatsProps {
  tasks: Task[];
}

const Legend: React.FC<{ items: { label: string; color: string }[] }> = ({
  items,
}) => (
  <ul
    style={{
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    {items.map((it) => (
      <li
        key={it.label}
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            backgroundColor: it.color,
            display: "inline-block",
            borderRadius: 2,
          }}
        />
        <span style={{ fontSize: 12, color: "#444" }}>{it.label}</span>
      </li>
    ))}
  </ul>
);

const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const openTasks = tasks.filter((t) => t.status === "OPEN").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const testingTasks = tasks.filter((t) => t.status === "TESTING").length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;

  const highPriority = tasks.filter((t) => t.priority === "HIGH").length;
  const mediumPriority = tasks.filter((t) => t.priority === "MEDIUM").length;
  const lowPriority = tasks.filter((t) => t.priority === "LOW").length;

  const statusPieData = useMemo(
    () => [
      { type: "Open", value: openTasks },
      { type: "In Progress", value: inProgressTasks },
      { type: "Testing", value: testingTasks },
      { type: "Done", value: doneTasks },
    ],
    [openTasks, inProgressTasks, testingTasks, doneTasks]
  );

  const priorityPieData = useMemo(
    () => [
      { type: "High", value: highPriority },
      { type: "Medium", value: mediumPriority },
      { type: "Low", value: lowPriority },
    ],
    [highPriority, mediumPriority, lowPriority]
  );

  // Aggregate tasks by created date (YYYY-MM-DD)
  const lineData = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => {
      if (!t.createdAt) return;
      const d = new Date(t.createdAt);
      const key = isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
  }, [tasks]);

  return (
    <div>
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic title="Total Tasks" value={totalTasks} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic title="Open" value={openTasks} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic title="In Progress" value={inProgressTasks} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic title="Done" value={doneTasks} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} md={12}>
          <Card title="By Status" size="small" bodyStyle={{ padding: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: "1 1 auto" }}>
                <Pie
                  data={statusPieData}
                  angleField="value"
                  colorField="type"
                  radius={0.78}
                  innerRadius={0.52}
                  legend={false}
                  tooltip={{
                    fields: ["type", "value"],
                    formatter: (datum: { type: string; value: number }) => ({
                      name: datum.type,
                      value: datum.value,
                    }),
                  }}
                  height={225}
                  padding={[4, 4, 4, 4]}
                  label={false}
                  autoFit
                />
              </div>
              <div style={{ flex: "0 0 120px" }}>
                <Legend
                  items={[
                    { label: "Open", color: "#1677ff" },
                    { label: "In Progress", color: "#13c2c2" },
                    { label: "Testing", color: "#fa8c16" },
                    { label: "Done", color: "#b37feb" },
                  ]}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="By Priority" size="small" bodyStyle={{ padding: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: "1 1 auto" }}>
                <Pie
                  data={priorityPieData}
                  angleField="value"
                  colorField="type"
                  radius={0.78}
                  innerRadius={0.52}
                  legend={false}
                  tooltip={{
                    fields: ["type", "value"],
                    formatter: (datum: { type: string; value: number }) => ({
                      name: datum.type,
                      value: datum.value,
                    }),
                  }}
                  height={225}
                  padding={[4, 4, 4, 4]}
                  label={false}
                  autoFit
                />
              </div>
              <div style={{ flex: "0 0 120px" }}>
                <Legend
                  items={[
                    { label: "High", color: "#1677ff" },
                    { label: "Medium", color: "#13c2c2" },
                    { label: "Low", color: "#fa8c16" },
                  ]}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col span={24}>
          <Card
            title="Tasks Created Over Time"
            size="small"
            bodyStyle={{ padding: 4 }}
          >
            {lineData.length > 0 ? (
              <Line
                data={lineData}
                xField="date"
                yField="count"
                point={{ size: 4, shape: "diamond" }}
                smooth
                padding={[8, 16, 8, 8]}
                yAxis={{ nice: true }}
                xAxis={{ tickCount: 6 }}
                tooltip={{ fields: ["date", "count"] }}
                height={245}
              />
            ) : (
              <div
                style={{
                  height: 245,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                No data to display yet
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TaskStats;
