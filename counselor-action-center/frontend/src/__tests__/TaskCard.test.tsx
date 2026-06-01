import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCard } from "../components/TaskCard";
import type { Task } from "../types";

const baseTask: Task = {
  id: "tsk_001",
  studentId: "stu_001",
  title: "Submit FAFSA application",
  description: "Deadline is approaching. Student has not started the form.",
  status: "todo",
  priority: "urgent",
  dueDate: "2030-12-31",
  createdAt: "2026-05-13T14:00:00Z",
  updatedAt: "2026-05-13T14:00:00Z",
};

describe("TaskCard", () => {
  it("renders the task title and description", () => {
    render(
      <TaskCard task={baseTask} onStatusChange={vi.fn()} isUpdating={false} />
    );
    expect(screen.getByText("Submit FAFSA application")).toBeInTheDocument();
    expect(
      screen.getByText("Deadline is approaching. Student has not started the form.")
    ).toBeInTheDocument();
  });

  it("shows a Start button for todo tasks", () => {
    render(
      <TaskCard task={baseTask} onStatusChange={vi.fn()} isUpdating={false} />
    );
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("shows a Complete button for in_progress tasks", () => {
    render(
      <TaskCard
        task={{ ...baseTask, status: "in_progress" }}
        onStatusChange={vi.fn()}
        isUpdating={false}
      />
    );
    expect(screen.getByRole("button", { name: "Complete" })).toBeInTheDocument();
  });

  it("shows no action button for completed tasks", () => {
    render(
      <TaskCard
        task={{ ...baseTask, status: "completed" }}
        onStatusChange={vi.fn()}
        isUpdating={false}
      />
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("calls onStatusChange with taskId and in_progress when Start is clicked", async () => {
    const onStatusChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskCard task={baseTask} onStatusChange={onStatusChange} isUpdating={false} />
    );

    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(onStatusChange).toHaveBeenCalledOnce();
    expect(onStatusChange).toHaveBeenCalledWith("tsk_001", "in_progress");
  });

  it("disables the button and shows '...' while updating", () => {
    render(
      <TaskCard task={baseTask} onStatusChange={vi.fn()} isUpdating={true} />
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.textContent).toBe("...");
  });

  it("applies a red left border for urgent tasks that are not completed", () => {
    const { container } = render(
      <TaskCard task={baseTask} onStatusChange={vi.fn()} isUpdating={false} />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/border-l-red/);
  });

  it("does not apply urgency border for a completed urgent task", () => {
    const { container } = render(
      <TaskCard
        task={{ ...baseTask, status: "completed" }}
        onStatusChange={vi.fn()}
        isUpdating={false}
      />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toMatch(/border-l-red/);
  });

  it("shows an overdue warning for past due dates on non-completed tasks", () => {
    render(
      <TaskCard
        task={{ ...baseTask, dueDate: "2020-01-01" }}
        onStatusChange={vi.fn()}
        isUpdating={false}
      />
    );
    expect(screen.getByText(/Overdue/)).toBeInTheDocument();
  });

  it("does not show overdue for a completed task even if past due date", () => {
    render(
      <TaskCard
        task={{ ...baseTask, status: "completed", dueDate: "2020-01-01" }}
        onStatusChange={vi.fn()}
        isUpdating={false}
      />
    );
    expect(screen.queryByText(/Overdue/)).toBeNull();
  });
});
