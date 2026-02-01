import * as accommodationService from "@/lib/services/accommodation.service";
import * as activityService from "@/lib/services/activity.service";
import * as locationService from "@/lib/services/location.service";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ActivityCandidate {
  id: string;
  travelPlanId: string;
  locationId: string;
  activityName: string;
  activityCoordinates: Coordinates;
  reason: string;
  priceEstimate: number;
}

export interface AccommodationCandidate {
  id: string;
  travelPlanId: string;
  locationId: string;
  accommodationName: string;
  accommodationType: string;
  accommodationCoordinates: Coordinates;
  reason: string;
  priceEstimatePerNight: number;
}

export interface Destination {
  id: string;
  planId: string;
  name: string;
  city?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  reason: string;
}

function nextId(): string {
  return crypto.randomUUID();
}

export const travelStore = {
  async listActivityCandidates(
    locationId: string
  ): Promise<ActivityCandidate[]> {
    return activityService.listActivitiesByLocation(locationId);
  },

  async addActivityCandidate(
    locationId: string,
    activityName: string,
    _activityCoordinates: Coordinates,
    reason: string,
    priceEstimate: number
  ): Promise<string> {
    return activityService.createActivity(
      locationId,
      activityName,
      reason,
      priceEstimate
    );
  },

  async listAccommodationCandidates(
    locationId: string
  ): Promise<AccommodationCandidate[]> {
    return accommodationService.listAccommodationsByLocation(locationId);
  },

  async addAccommodationCandidate(
    locationId: string,
    accommodationName: string,
    accommodationType: string,
    _accommodationCoordinates: Coordinates,
    reason: string,
    priceEstimatePerNight: number
  ): Promise<string> {
    return accommodationService.createAccommodation(
      locationId,
      accommodationName,
      accommodationType,
      reason,
      priceEstimatePerNight
    );
  },

  async addDestination(
    planId: string,
    name: string,
    country: string,
    city?: string,
    coordinates?: Coordinates,
    description?: string,
    reason: string
  ): Promise<string> {
    return locationService.createLocation({
      planId,
      name,
      country,
      city: city ?? null,
      coordinates: coordinates ?? null,
      description: description ?? null,
      reason: reason,
    });
  },
};
