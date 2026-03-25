// File: src/services/youtube.js

import Constants from "expo-constants";
import { extractYouTubeVideoId } from "../utils/youtube";

function getYoutubeApiKey() {
  return (
    process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ||
    Constants?.expoConfig?.extra?.youtubeApiKey ||
    Constants?.manifest2?.extra?.expoClient?.extra?.youtubeApiKey ||
    ""
  );
}

export async function fetchYouTubeLiveStatus(value = "") {
  const videoId = extractYouTubeVideoId(value);
  const apiKey = getYoutubeApiKey();

  if (!videoId) {
    return {
      ok: false,
      status: "invalid",
      reason: "No valid YouTube video ID was found.",
      videoId: "",
      title: "",
    };
  }

  if (!apiKey) {
    return {
      ok: false,
      status: "unknown",
      reason: "Add EXPO_PUBLIC_YOUTUBE_API_KEY to enable live-status detection.",
      videoId,
      title: "",
    };
  }

  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${encodeURIComponent(
    videoId
  )}&key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `YouTube API error ${response.status}`);
  }

  const data = await response.json();
  const item = data?.items?.[0];

  if (!item) {
    return {
      ok: false,
      status: "not_found",
      reason: "The YouTube video could not be found.",
      videoId,
      title: "",
    };
  }

  const liveDetails = item?.liveStreamingDetails || null;
  const title = item?.snippet?.title || "";
  const activeLiveChatId = liveDetails?.activeLiveChatId || "";
  const actualStartTime = liveDetails?.actualStartTime || "";
  const actualEndTime = liveDetails?.actualEndTime || "";
  const scheduledStartTime = liveDetails?.scheduledStartTime || "";

  let status = "recorded";
  if (activeLiveChatId || (actualStartTime && !actualEndTime)) {
    status = "live";
  } else if (scheduledStartTime && !actualStartTime) {
    status = "scheduled";
  }

  return {
    ok: true,
    status,
    reason: "",
    videoId,
    title,
    scheduledStartTime,
    actualStartTime,
    actualEndTime,
    activeLiveChatId,
  };
}
