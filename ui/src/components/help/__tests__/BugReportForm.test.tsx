import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BugReportForm from "../BugReportForm";

jest.mock("../../../services/bugService", () => ({
  bugService: {
    submit: jest.fn(),
  },
}));

// Light-weight AntD mock to avoid rc-field-form/runtime deps in tests
jest.mock("antd", () => {
  const React = require("react");
  const notification = { success: jest.fn(), error: jest.fn() };
  const Form: any = ({ children, onFinish, form }: any) => (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new (global as any).FormData(e.currentTarget);
        const values: any = {};
        fd.forEach((v: any, k: string) => {
          values[k] = v;
        });
        onFinish?.(values);
        // mimic resetFields on provided form instance after finish in real AntD flow
        form?.resetFields?.();
      }}
    >
      {children}
    </form>
  );
  Form.useForm = () => [{
    resetFields: jest.fn(),
  }, () => {}];
  Form.Item = ({ name, label, children }: any) => {
    const child = React.cloneElement(children, {
      "aria-label": children.props["aria-label"] || label,
      name,
    });
    return <div>{child}</div>;
  };
  const Input: any = (p: any) => <input {...p} />;
  Input.TextArea = (p: any) => <textarea {...p} />;
  const Select: any = ({ name, onChange, children, ...rest }: any) => (
    <select name={name} onChange={(e: any) => onChange?.(e.target.value)} {...rest}>
      {children || (
        <>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </>
      )}
    </select>
  );
  const Button: any = ({ children, htmlType = "button", ...rest }: any) => (
    <button type={htmlType} {...rest}>
      {children}
    </button>
  );
  return { Form, Input, Select, Button, notification };
});

const { bugService } = jest.requireMock("../../../services/bugService");

describe("BugReportForm", () => {

  test("submits when required fields are provided", async () => {
    bugService.submit.mockResolvedValue(true);
    const onSubmitted = jest.fn();
    render(<BugReportForm onSubmitted={onSubmitted} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Crash on save" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "App crashes when saving a task" } });

    fireEvent.click(screen.getByRole("button", { name: /submit bug report/i }));

    await waitFor(() => expect(onSubmitted).toHaveBeenCalled());
    expect(bugService.submit).toHaveBeenCalled();
  });

  test("does not call onSubmitted when required fields missing", async () => {
    bugService.submit.mockResolvedValue(false);
    const onSubmitted = jest.fn();
    render(<BugReportForm onSubmitted={onSubmitted} />);
    fireEvent.click(screen.getByRole("button", { name: /submit bug report/i }));
    await waitFor(() => expect(onSubmitted).not.toHaveBeenCalled());
  });
});
