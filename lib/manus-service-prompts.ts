/**
 * Prompt builders for the Manus API (destination suggestions).
 * Data passed in is from the database (user, plan) and is not validated here.
 */

/**
 * Builds a prompt string for the Manus agent from user and plan data.
 * Input shapes match Prisma models; no validation (data comes from DB).
 */
export function buildDestinationPrompt(
  user: { name: string; email: string },
  plan: {
    title: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    locations: Array<{ name: string; city: string | null; country: string }>;
    accommodations: Array<{ name: string; type: string | null }>;
    activities: Array<{ name: string; type: string | null }>;
    transports: Array<{ type: string; from: string | null; to: string | null }>;
  }
): string {
  const lines: string[] = [
    "You are a travel destination expert. Based on the following user and trip plan, suggest exactly 3 travel destinations that would fit their trip.",
    "",
    "## User",
    `- Name: ${user.name}`,
    `- Email: ${user.email}`,
    "",
    "## Trip plan",
    `- Title: ${plan.title}`,
    plan.description ? `- Description: ${plan.description}` : "",
    plan.startDate
      ? `- Start date: ${plan.startDate.toISOString().slice(0, 10)}`
      : "",
    plan.endDate
      ? `- End date: ${plan.endDate.toISOString().slice(0, 10)}`
      : "",
  ].filter(Boolean);

  if (plan.locations.length > 0) {
    lines.push("", "### Locations in plan");
    plan.locations.forEach((loc) => {
      lines.push(
        `- ${loc.name}${loc.city ? `, ${loc.city}` : ""}, ${loc.country}`
      );
    });
  }
  if (plan.accommodations.length > 0) {
    lines.push("", "### Accommodations");
    plan.accommodations.forEach((a) => {
      lines.push(`- ${a.name}${a.type ? ` (${a.type})` : ""}`);
    });
  }
  if (plan.activities.length > 0) {
    lines.push("", "### Activities");
    plan.activities.forEach((a) => {
      lines.push(`- ${a.name}${a.type ? ` (${a.type})` : ""}`);
    });
  }
  if (plan.transports.length > 0) {
    lines.push("", "### Transport");
    plan.transports.forEach((t) => {
      const fromTo = [t.from, t.to].filter(Boolean).join(" → ");
      lines.push(`- ${t.type}${fromTo ? `: ${fromTo}` : ""}`);
    });
  }

  lines.push(
    "",
    "## Your task",
    "Suggest exactly 3 travel destinations. For each destination provide: name (e.g. city or region name), country, optional city, and a short reason why it fits this plan.",
    "Return your answer as a valid JSON array of exactly 3 objects with keys: name, country, city (optional), reason (optional). Example:",
    '[{"name":"Kyoto","country":"Japan","city":"Kyoto","reason":"..."},{"name":"..."},{"name":"..."}]',
    "Reply with only the JSON array, no other text before or after."
  );

  return lines.join("\n");
}
