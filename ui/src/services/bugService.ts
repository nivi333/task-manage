import { notification } from "antd";

export interface BugReportPayload {
  title: string;
  description: string;
  steps?: string;
  severity?: "low" | "medium" | "high";
  contactEmail?: string;
}

const SUPPORT_EMAIL = "support@example.com";

export const bugService = {
  async submit(payload: BugReportPayload): Promise<boolean> {
    const { title, description, steps, severity, contactEmail } = payload;
    // Basic required fields validation
    if (!title?.trim() || !description?.trim()) {
      notification.error({ message: "Bug report requires a title and description" });
      return false;
    }

    // Mailto fallback (no backend dependency)
    try {
      const subject = encodeURIComponent(`[Bug] ${title}${severity ? ` (${severity})` : ""}`);
      const bodyLines = [
        description.trim(),
        "",
        steps ? `Steps to Reproduce:\n${steps}` : undefined,
        contactEmail ? `Reporter: ${contactEmail}` : undefined,
      ].filter(Boolean);
      const body = encodeURIComponent(bodyLines.join("\n"));
      const href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
      window.open(href, "_blank");
      notification.success({ message: "Bug report draft opened in your email client" });
      return true;
    } catch (e) {
      console.error("Bug report mailto failed", e);
      notification.error({ message: "Failed to open email client for bug report" });
      return false;
    }
  },
};
