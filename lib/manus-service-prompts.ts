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

  The user's name is ${user.name}.

  The user's preferences are...
  ${user.preferences}

  The user would like to travel from ${plan.startDate} to ${plan.endDate}.

  Please use your web search capabilities to find the best locations for the user to visit.

  When you've found the best locations, please use the Model Context Protocol tool you have access to to save it in our database.
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

  The user was suggested to and chose this location becuause...
  ${location.reason}

  Please use your web search capabilities to find the best accommodations (hotels, hostels, apartments, etc.) that match the user's budget and preferences.

  When you've found the best options, please use the Model Context Protocol tool you have access to to save them in our database.
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

  The user was suggested to and chose this location becuause...
  ${location.reason}

  Please use your web search capabilities to find the best activities (attractions, restaurants, tours, experiences, etc.) that match the user's interests and preferences.

  When you've found the best options, please use the Model Context Protocol tool you have access to to save them in our database.
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

  The user was suggested to and chose this location becuause...
  ${location.reason}

  Please use your web search capabilities to find the best transport options (flights, trains, buses, car hire, etc.) that match the user's budget, schedule and preferences.

  When you've found the best options, please use the Model Context Protocol tool you have access to to save them in our database.
  `;
}
