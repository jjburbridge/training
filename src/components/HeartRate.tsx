import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Spinner } from "./loading";
import { heartRateLink } from "@/lib/bluetooth/bluetoothLink";

const HeartRateValue: FC<PropsWithChildren> = ({ children }) => (
  <span className="flex items-end min-w-10 text-5xl text-white font-extrabold">
    {children}
    <span className="relative -top-6-px mr-1 font-bold text-sm">BPM</span>
  </span>
);

const Toggle: FC<{
  toggleState: boolean;
  updateToggleState: () => void;
}> = ({ toggleState, updateToggleState }) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      value=""
      className="sr-only peer"
      checked={toggleState}
      onClick={updateToggleState}
    />
    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  </label>
);

const HeartRate: FC = () => {
  const [HRData, updateHRData] = useState(null);
  const [loadingState, setLoadingState] = useState(false);
  const [toggleState, updateToggleState] = useState(false);

  useEffect(() => {
    if (!toggleState) return setLoadingState(false);
    heartRateLink(updateHRData, updateToggleState, setLoadingState);
  }, [toggleState]);
  return (
    <div className="py-5 mx-auto flex-col">
      <div className="relative min-w-10 h-10 flex font-extrabold text-5xl">
        {loadingState && <Spinner />}

        {HRData && <HeartRateValue>{HRData}</HeartRateValue>}
      </div>
      <div className="text-white flex items-center content-center">
        <h6 className="text-left mb-0 pr-4">Heart Rate</h6>
        <Toggle
          toggleState={toggleState}
          updateToggleState={() => updateToggleState((prev) => !prev)}
        />
      </div>
    </div>
  );
};

export default HeartRate;
