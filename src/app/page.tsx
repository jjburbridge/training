"use client";

import HeartRate from "@/components/HeartRate";
import CyclingSpeedCadence from "@/components/cadence";
import { FormEvent, FormEventHandler, useState } from "react";

export default function Component() {
  const [video, setVideo] = useState("ewrf_rCHUdA");
  const [loaded, setLoaded] = useState("ewrf_rCHUdA");
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoaded(video);
    } catch (error) {
      console.error("Error searching for YouTube video:", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl w-full space-y-6">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search for a YouTube video"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </form>
        {loaded && (
          <>
            <div className="w-full aspect-video rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${loaded}`}
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <CyclingSpeedCadence />
            <HeartRate />
          </>
        )}
      </div>
    </div>
  );
}
