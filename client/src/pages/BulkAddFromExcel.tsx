import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import useWebSocket, { ReadyState } from 'react-use-websocket'

const BulkAddFromExcel = () => {
  const [stage, setStage] = useState(1);
  const totalStages = 4;
  const labels = ['Upload', 'Select Labs', 'Processing Data', 'Finish'];

  const socketUrl = `${window.location.origin.replace(/^http/, 'ws')}/api/inventory/excel`
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl)

  useEffect(() => {
    if (lastMessage !== null) {
      console.log(lastMessage)
    }
  }, [lastMessage])

  const handleClickSendMessage = useCallback(() => sendMessage('Hello'), [])

  // Calculate progress fill (from stage 1 to stage 4)
  const progressPercent = ((stage - 1) / (totalStages - 1)) * 100;

  // const handleNextStage = () => {
  //   setStage((prevStage) => Math.min(prevStage + 1, totalStages));
  // };

  useEffect(() => {
    handleClickSendMessage()
  },[])

  return (
    <div className="relative flex flex-col p-5">
      <span className="flex justify-center items-center mt-2 mb-10 w-full text-3xl text-primary text-center">
        Bulk Add Items from Excel
      </span>
      
      <Link to="/add-item">
        <Button className="absolute m-5 top-2 right-0">Add Single Item</Button>
      </Link>

      <div className="flex flex-col space-y-6 px-5">
        {/* Progress bar container */}
        <div className="relative w-full pt-8">
          {/* Track */}
          <div className="relative h-2 bg-secondary rounded-full" />
          {/* Animated fill */}
          <div
            className="absolute h-2 bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Stage circles with labels on top */}
          {Array.from({ length: totalStages }, (_, index) => {
            const step = index + 1;
            const leftPercent = (index / (totalStages - 1)) * 100;
            return (
              <div
                key={step}
                className="absolute flex flex-col items-center"
                style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)', top: 0 }}
              >
                {/* Label above the circle */}
                <div className="mb-2 text-gray-500 text-center">
                  {labels[index]}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    step <= stage ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <span className="text-white">{step}</span>
                </div>
              </div>
            );
          })}
        </div>
        <Button disabled={readyState !== ReadyState.OPEN} onClick={handleClickSendMessage} className="self-end">
          Next
        </Button>
      </div>
    </div>
  );
};

export default BulkAddFromExcel;