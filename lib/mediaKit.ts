export interface PlatformEntry {
  platform: string;
  followers: string;
}

export interface MediaKit {
  niche: string;
  audience: string;
  platforms: PlatformEntry[];
  tone: string;
  dealsDone: string;
  rateFloor: string;
  onboardingCompleted: boolean;
  updatedAt?: string;
}

export const EMPTY_MEDIA_KIT: MediaKit = {
  niche: "",
  audience: "",
  platforms: [],
  tone: "",
  dealsDone: "",
  rateFloor: "",
  onboardingCompleted: false,
};
