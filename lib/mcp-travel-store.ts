/**
 * In-memory store for MCP travel tools. Replace with DB later.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ActivityCandidate {
  id: string;
  travelPlanId: string;
  activityName: string;
  activityCoordinates: Coordinates;
  reason: string;
  priceEstimate: number;
}

export interface AccommodationCandidate {
  id: string;
  travelPlanId: string;
  accommodationName: string;
  accommodationType: string;
  accommodationCoordinates: Coordinates;
  reason: string;
  priceEstimatePerNight: number;
}

export interface ClarifyingQuestion {
  id: string;
  travelPlanId: string;
  question: string;
}

const activityCandidates: ActivityCandidate[] = [];
const accommodationCandidates: AccommodationCandidate[] = [];
const clarifyingQuestions: ClarifyingQuestion[] = [];

function nextId(): string {
  return crypto.randomUUID();
}

export const travelStore = {
  listActivityCandidates(travelPlanId: string): ActivityCandidate[] {
    return activityCandidates.filter((a) => a.travelPlanId === travelPlanId);
  },

  addActivityCandidate(
    travelPlanId: string,
    activityName: string,
    activityCoordinates: Coordinates,
    reason: string,
    priceEstimate: number
  ): string {
    const id = nextId();
    activityCandidates.push({
      id,
      travelPlanId,
      activityName,
      activityCoordinates,
      reason,
      priceEstimate,
    });
    return id;
  },

  listAccommodationCandidates(travelPlanId: string): AccommodationCandidate[] {
    return accommodationCandidates.filter(
      (a) => a.travelPlanId === travelPlanId
    );
  },

  addAccommodationCandidate(
    travelPlanId: string,
    accommodationName: string,
    accommodationType: string,
    accommodationCoordinates: Coordinates,
    reason: string,
    priceEstimatePerNight: number
  ): string {
    const id = nextId();
    accommodationCandidates.push({
      id,
      travelPlanId,
      accommodationName,
      accommodationType,
      accommodationCoordinates,
      reason,
      priceEstimatePerNight,
    });
    return id;
  },

  addClarifyingQuestion(travelPlanId: string, question: string): string {
    const id = nextId();
    clarifyingQuestions.push({ id, travelPlanId, question });
    return id;
  },
};
