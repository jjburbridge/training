"use client";

import HeartRate from "@/components/HeartRate";
import CyclingSpeedCadence from "@/components/cadence";
import Power from "@/components/power";
import { FormEvent, FormEventHandler, useState } from "react";

export default function Component() {
  const [video, setVideo] = useState("-fCSeOHLhz4");
  const [loaded, setLoaded] = useState("-fCSeOHLhz4");
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoaded(video);
    } catch (error) {
      console.error("Error searching for YouTube video:", error);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen h-full bg-gray-100 dark:bg-gray-900">
      <div className="md:max-w-xl max-w-5xl w-full">
        <form onSubmit={handleSubmit} className="flex flex-col flex-wrap">
          <div className="flex-col items-start">
            <label className="text-white text-left flex-none">Enter a youtube Video id</label>
            <input
              type="text"
              placeholder="YouTube video id"
              value={video}
              onChange={(e) => setVideo(e.target.value)}
              className="flex-1 w-full bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex-col items-end">
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 dark:text-primary dark:bg-primary-foreground dark:hover:bg-primary-foreground/90 "
            >
              Load video
            </button>
          </div>
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
            <div className="w-full flex m-auto flex-row flex-wrap">
              <CyclingSpeedCadence />
              <HeartRate />
              <Power />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
