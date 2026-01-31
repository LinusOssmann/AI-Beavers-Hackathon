import { Plan } from "@/generated/prisma/client";
import { prisma } from "@/prisma/prisma";

export async function getLocationPrompt(plan: Plan) {
  const user = await prisma.user.findUnique({
    where: { id: plan.userId },
  });
  if (!user) throw new Error("The user for this plan wasn't found.");

  return `
  You are a helpful assistant that helps users find the best location for their trip.

  The user is ${user.name} and the plan is ${plan.title}.

  The plan is described as...
  ${plan.description}

  The user's preferences are...
  ${user.preferences}

  The user would like to travel from ${plan.startDate} to ${plan.endDate}.

  Please use your web search capabilities to find the best locations for the user to visit.

  When you've found the best locations, please use the Model Context Protocol tool you have access to to save it in our database.

  Do a shallow research and suggest 8 - 16 travel destinations (preferably specific cities, use broader locations or areas only if a single city would be too small for a trip of their desired duration). You should add those with the 'add_destination' tool.

  The plan_id to use is ${plan.id}.

  DO NOT create files. It does not matter what you respond in the end as long as you called the tool an appropriate number of times.
  `;
}

export async function getAccommodationPrompt(plan: Plan) {
  const location = await prisma.location.findFirst({
    where: { planId: plan.id, isSelected: true },
  });
  if (!location) throw new Error("The location for this plan wasn't found.");

  const user = await prisma.user.findUnique({
    where: { id: plan.userId },
  });
  if (!user) throw new Error("The user for this plan wasn't found.");

  return `
  You are a helpful assistant that helps users find the best accommodations for their trip.

  The user is ${user.name} and the plan is ${plan.title}.

  The plan is described as...
  ${plan.description}

  The user's preferences are...
  ${user.preferences}

  The user would like to travel from ${plan.startDate} to ${plan.endDate}.

  The user is staying in ${location.name}, ${location.city}, ${location.country}.

  The user was suggested to and chose this location because...
  ${location.reason}

  Please use your web search capabilities to find the best accommodations (hotels, hostels, apartments, etc.) that match the user's budget and preferences.

  When you've found the best options, please use the Model Context Protocol tool you have access to to save them in our database.

  You should suggest at least 15 accommodation options. You may suggest more if appropriate, but always suggest fewer than 30 options. Try to add a URL to each candidate (hotel websites, etc.); this URL will be shown to the user so they can research in more detail and make an educated decision.

  DO NOT create any files. It does not matter what you respond in the end as long as you called the tools enough times with the appropriate inputs.

  The location_id to use for MCP tool calls is ${location.id}.
  `;
}

export async function getActivityPrompt(plan: Plan) {
  const location = await prisma.location.findFirst({
    where: { planId: plan.id, isSelected: true },
  });
  if (!location) throw new Error("The location for this plan wasn't found.");

  const user = await prisma.user.findUnique({
    where: { id: plan.userId },
  });
  if (!user) throw new Error("The user for this plan wasn't found.");

  return `
  You are a helpful assistant that helps users find the best activities and experiences for their trip.

  The user is ${user.name} and the plan is ${plan.title}.

  The plan is described as...
  ${plan.description}

  The user's preferences are...
  ${user.preferences}

  The user would like to travel from ${plan.startDate} to ${plan.endDate}.

  The user is staying in ${location.name}, ${location.city}, ${location.country}.

  The user was suggested to and chose this location because...
  ${location.reason}

  Please use your web search capabilities to find the best activities (attractions, restaurants, tours, experiences, etc.) that match the user's interests and preferences.

  When you've found the best options, please use the Model Context Protocol tool you have access to to save them in our database.

  You should suggest at least 40 activity options in the destination. You may suggest more if appropriate, but always suggest fewer than 80 activities. Activities may be guided tours, museums, sights, cafes, galleries, specific (!) sports events, districts in a city, restaurants, street food, specific (!) cultural events, etc. In both cases try to match the suggested things to what you believe the user would want to do while in the city. Keep a balance between "must not miss" activities and curated, highly tailored niche recommendations (similar to Lonely Planet). Try to add a URL to each candidate; for restaurants and cafes always prefer Google Maps links.

  DO NOT create any files. It does not matter what you respond in the end as long as you called the tools enough times with the appropriate inputs.

  The location_id to use for MCP tool calls is ${location.id}.
  `;
}

export async function getTransportPrompt(plan: Plan) {
  const location = await prisma.location.findFirst({
    where: { planId: plan.id, isSelected: true },
  });
  if (!location) throw new Error("The location for this plan wasn't found.");

  const user = await prisma.user.findUnique({
    where: { id: plan.userId },
  });
  if (!user) throw new Error("The user for this plan wasn't found.");

  return `
  You are a helpful assistant that helps users find the best transport options for their trip.

  The user is ${user.name} and the plan is ${plan.title}.

  The plan is described as...
  ${plan.description}

  The user's preferences are...
  ${user.preferences}

  The user would like to travel from ${plan.startDate} to ${plan.endDate}.

  The user is staying in ${location.name}, ${location.city}, ${location.country}.

  The user was suggested to and chose this location because...
  ${location.reason}

  Please use your web search capabilities to find the best transport options (flights, trains, buses, car hire, etc.) that match the user's budget, schedule and preferences.

  When you've found the best options, please use the Model Context Protocol tool you have access to to save them in our database.

  DO NOT create any files. It does not matter what you respond in the end as long as you called the tools enough times with the appropriate inputs.
  `;
}

export async function getPreferenceRefinerPrompt(preferences: string) {
  return `
  You should research the preferences of the user based on the following input:

  ${preferences}

  Please research in a shallow research the things the user has expressed interests in. Only research things that benefit from research, e.g. activities or locations you don't know much about. If the user expressed "liking the outdoors", this is highly unspecific and does not need further research.

  DO NOT create files. Simply respond in natural language with your final summary/assessment.
  `;
}
