import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UrgencyBadge } from "../components/UrgencyBadge";
import type { UrgencyLevel } from "../types";

describe("UrgencyBadge", () => {
  const levels: UrgencyLevel[] = ["critical", "high", "medium", "low"];

  it.each(levels)("renders the correct label for %s", (level) => {
    render(<UrgencyBadge level={level} />);
    const expected = level.charAt(0).toUpperCase() + level.slice(1);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("renders an animated dot only for critical urgency", () => {
    const { container, rerender } = render(<UrgencyBadge level="critical" />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();

    rerender(<UrgencyBadge level="high" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();

    rerender(<UrgencyBadge level="medium" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();

    rerender(<UrgencyBadge level="low" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });

  it("applies red styling for critical", () => {
    const { container } = render(<UrgencyBadge level="critical" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/text-red/);
  });

  it("applies orange styling for high", () => {
    const { container } = render(<UrgencyBadge level="high" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/text-orange/);
  });

  it("applies blue styling for medium", () => {
    const { container } = render(<UrgencyBadge level="medium" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/text-blue/);
  });

  it("applies gray styling for low", () => {
    const { container } = render(<UrgencyBadge level="low" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/text-gray/);
  });
});
