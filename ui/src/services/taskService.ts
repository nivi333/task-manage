import apiClient from "./authService";
import { Task, TaskCreateDTO, TaskUpdateDTO } from "../types/task";
import { notificationService } from "./notificationService";
import { userService } from "./userService";

const API_URL = "/tasks";

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
  dueDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  tags?: string[];
}

// Fetch and merge user details for tasks whose assignedTo is missing name/username/avatar
async function enrichAssignees(tasks: Task[]): Promise<Task[]> {
  try {
    const ids = Array.from(
      new Set(
        tasks.map((t) => t.assignedTo?.id).filter((id): id is string => !!id)
      )
    );

    // Determine which assignees need enrichment
    const needIds = ids.filter((id) => {
      const t = tasks.find((x) => x.assignedTo?.id === id);
      const a = t?.assignedTo as any;
      const hasName =
        (a?.firstName && a.firstName.trim()) ||
        (a?.lastName && a.lastName.trim());
      const hasUsername = a?.username && String(a.username).trim();
      const hasAvatar = a?.profilePicture;
      return !hasName || !hasUsername || !hasAvatar;
    });

    if (needIds.length === 0) return tasks;

    // Prefer a bulk fetch that is known to work (for-teams). If it fails, skip enrichment to avoid API 405/500s
    let usersById = new Map<string, any>();
    try {
      const all = await userService.getUsersForTeams();
      usersById = new Map(all.map((u: any) => [u.id, u]));
    } catch (e) {
      // Bulk fetch failed; return tasks without enrichment to avoid unsupported GET-by-id calls
      return tasks;
    }

    if (usersById.size === 0) return tasks;

    return tasks.map((t) => {
      const id = t.assignedTo?.id;
      if (!id) return t;
      const u = usersById.get(id);
      if (!u) return t;
      const merged = {
        ...t.assignedTo,
        ...u,
        profilePicture:
          (u as any).avatarUrl ||
          u.profilePicture ||
          t.assignedTo?.profilePicture,
        avatarUrl:
          (u as any).avatarUrl ||
          u.profilePicture ||
          t.assignedTo?.avatarUrl,
      } as any;
      return { ...t, assignedTo: merged } as Task;
    });
  } catch {
    return tasks;
  }
}

const getTasks = async (filters: TaskFilters = {}): Promise<Task[]> => {
  try {
    const response = await apiClient.get<any>(API_URL, { params: filters });
    const data = response.data as any;
    // Normalize: support both pageable { content: [...] } and direct array responses
    let tasks: Task[] = [];
    if (Array.isArray(data)) tasks = (data as Task[]).map(normalizeTask);
    else if (data && Array.isArray(data.content))
      tasks = (data.content as Task[]).map(normalizeTask);
    else tasks = [] as Task[];

    // Enrich assignees with full user data when only UUID was provided
    tasks = await enrichAssignees(tasks);
    return tasks;
  } catch (error) {
    notificationService.error("Failed to fetch tasks.");
    throw error;
  }
};

const getTaskById = async (id: string): Promise<Task> => {
  try {
    const response = await apiClient.get<Task>(`${API_URL}/${id}`);
    const normalized = normalizeTask(response.data);
    const [enriched] = await enrichAssignees([normalized]);
    return enriched;
  } catch (error) {
    notificationService.error("Failed to fetch task details.");
    throw error;
  }
};

const createTask = async (taskData: TaskCreateDTO): Promise<Task> => {
  try {
    const response = await apiClient.post<Task>(API_URL, taskData);
    notificationService.success("Task created successfully!");
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateTask = async (
  id: string,
  taskData: TaskUpdateDTO
): Promise<Task> => {
  try {
    const response = await apiClient.put<Task>(`${API_URL}/${id}`, taskData);
    notificationService.success("Task updated successfully!");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Explicit status move helper for drag & drop to guarantee payload format
const moveTaskStatus = async (
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE"
): Promise<Task> => {
  try {
    const payload = { status };
    // Use PATCH to dedicated status endpoint to avoid full TaskCreateDTO validation
    const response = await apiClient.patch<Task>(
      `${API_URL}/${id}/status`,
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteTask = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${API_URL}/${id}`);
    notificationService.success("Task deleted successfully!");
  } catch (error) {
    throw error;
  }
};

const taskService = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  moveTaskStatus,
  deleteTask,
};

export default taskService;

// --- Normalization helpers ---
function normalizeTask(raw: any): Task {
  // Tags normalization
  const tags: string[] = Array.isArray(raw?.tags)
    ? raw.tags.map((x: any) => String(x)).filter(Boolean)
    : [];

  // Project mapping: extract projectId from nested object if present
  const projectId: string | undefined =
    raw?.project?.id || raw?.projectId || undefined;

  // Assignee mapping: backend may send a UUID string or a full object
  let assignedTo: any = undefined;
  const rawAssignee = raw?.assignedTo;
  if (typeof rawAssignee === "string") {
    const id = rawAssignee;
    // Leave username empty to avoid showing truncated UUIDs in UI; UI will fallback to 'Unassigned'
    assignedTo = {
      id,
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "USER",
      status: "ACTIVE",
      createdAt: raw?.createdAt || new Date().toISOString(),
      updatedAt: raw?.updatedAt || raw?.createdAt || new Date().toISOString(),
    };
  } else if (rawAssignee && typeof rawAssignee === "object") {
    const firstName = (rawAssignee.firstName || "").trim();
    const lastName = (rawAssignee.lastName || "").trim();
    const baseUser = (rawAssignee.username || "").trim();
    const emailUser = rawAssignee.email
      ? String(rawAssignee.email).split("@")[0]
      : "";
    const idFallback = rawAssignee.id ? String(rawAssignee.id).slice(0, 6) : "";
    const username = baseUser || emailUser || idFallback || "user";
    // Map avatarUrl -> profilePicture so UI picks up image immediately
    const profilePicture = rawAssignee.profilePicture || rawAssignee.avatarUrl;
    assignedTo = {
      ...rawAssignee,
      firstName,
      lastName,
      username,
      profilePicture,
    };
  }

  // Build Task in our UI shape
  const task: Task = {
    id: String(raw.id),
    title: String(raw.title || ""),
    description: raw.description || "",
    status: raw.status || "OPEN",
    priority: raw.priority || "LOW",
    dueDate: raw.dueDate || undefined,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
    assignedTo,
    projectId,
    tags,
    attachments: raw.attachments || undefined,
    dependencies: raw.dependencies || undefined,
    subtasks: raw.subtasks || undefined,
  };
  return task;
}
