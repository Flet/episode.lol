// Normalised shapes the browser/islands consume. The /api/* endpoints map
// TheTVDB's raw payloads into these so the frontend stays decoupled from the API.

export interface ShowSummary {
  id: string;
  name: string;
  year?: string;
  network?: string;
  overview?: string;
  poster?: string | null;
  banner?: string | null; // optional spine art for mini tapes
}

export interface Person {
  name: string;
  role?: string;
  image?: string | null;
}

export interface SeriesDetail {
  id: string;
  name: string;
  overview?: string;
  poster?: string | null;
  posterAlt?: string | null;
  banner?: string | null;
  network?: string;
  year?: string;
  genres: string[];
  cast: Person[];
  episodeCount: number;
}

export interface EpisodeSummary {
  id: string;
  name?: string;
  season: number;
  number: number;
  aired?: string;
  image?: string | null;
}

export interface EpisodeDetail {
  id: string;
  seriesId: string;
  seriesName?: string;
  name?: string;
  season: number;
  number: number;
  aired?: string;
  runtime?: number;
  overview?: string;
  image?: string | null;
  network?: string;
  rating?: number | null;
  productionCode?: string;
  directors: string[];
  writers: string[];
  guests: Person[];
  genres: string[];
}

export interface SeriesResponse {
  detail: SeriesDetail;
  episodes: EpisodeSummary[];
}
