import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import useWebSocket, { resetGlobalState } from 'react-use-websocket'
import { UploadStage } from "./UploadStage";
import { toast } from "sonner";
import api from "@/axiosInterceptor";
import SelectLabStage from "./SelectLabStage";
import { ValidSheet } from "@/types/types";
import ProcessingStage from "./ProcessingStage";
import { Check } from "lucide-react";

const BulkAddFromExcel = () => {
  const [stage, setStage] = useState(1);
  const totalStages = 4;
  const labels = ['Upload', 'Select Labs', 'Processing Data', 'Finish'];

  const [validSheets, setValidSheets] = useState<ValidSheet[]>([])

  const [accessToken, setAccessToken] = useState('')

  const navigate = useNavigate()

  const socketUrl = `${import.meta.env.VITE_PUBLIC_API_URL.replace(/^http/, 'ws')}/api/inventory/excel`
  const { sendJsonMessage, lastJsonMessage, sendMessage, getWebSocket } = useWebSocket(socketUrl, {
    queryParams: {
      access_token: accessToken
    }
  })

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if ((lastJsonMessage as {error : string}).error){
        setStage(1)
        if ((lastJsonMessage as {error : string}).error !== "No valid sheets found"){
          const ws = getWebSocket()
          if (ws) ws.close()
        }
        toast.error((lastJsonMessage as {error : string}).error)
        return
      }
      if ((lastJsonMessage as {stage : number, validSheets: ValidSheet[]}).stage === 2) setValidSheets((lastJsonMessage as {stage : number, validSheets: ValidSheet[]}).validSheets)
      handleNextStage((lastJsonMessage as {stage : number}).stage)
    }
  }, [lastJsonMessage])

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const {data} = await api(`/inventory/token`);
        setAccessToken(data.accessToken)
      } catch (error) {
        console.error('Error fetching token:', error);
        toast.error('Failed to fetch token');
      }
    };

    fetchToken();

    window.addEventListener('unload', () => {
      resetGlobalState(socketUrl);
    })
  }, []);

  // Calculate progress fill (from stage 1 to stage 4)
  const progressPercent = ((stage - 1) / (totalStages - 1)) * 100;

  const handleNextStage = (stageToGoTo : number) => {
    setStage(Math.min(stageToGoTo, totalStages));
  };

  return (
    <div className="relative flex flex-col p-5">
      <span className="flex justify-center items-center mt-2 mb-10 w-full text-3xl text-primary text-center">
        Bulk Add Items from Excel
      </span>

      <Link to="/add-item">
        <Button className="absolute m-5 top-2 right-0">Add Single Item</Button>
      </Link>

      <div className="flex flex-col space-y-14 px-5">
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
                style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)', top: -5 }}
              >
                {/* Label above the circle */}
                <div className="mb-2 text-gray-500 text-center">
                  {labels[index]}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${step <= stage ? 'bg-primary' : 'bg-secondary'
                    }`}
                >
                  <span className="text-white">{step}</span>
                </div>
              </div>
            );
          })}
        </div>

        {stage === 1 ? <UploadStage onSubmit={async (file) => {
          // Stage 1 -> 2 Sending the file uploaded to the websocket for processing
          toast.info("Uploading...")
          sendMessage(await file.arrayBuffer())
        }} /> : stage === 2 ? <SelectLabStage sheets={validSheets} onSubmit={(selectedSheets) => {
          sendJsonMessage({stage : 3, selectedSheets })
        }}  /> : stage === 3 ?  <ProcessingStage /> : (
          <div className="flex flex-col items-center space-y-4">
            <Check className="w-16 h-16 text-green-500" />
            <span className="text-xl font-semibold text-center text-primary">
              Data has been successfully uploaded!
            </span>
            <p className="text-sm text-gray-600 text-center">
              Note: New users created will not have emails set. If you want to edit their access, please go to the settings page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkAddFromExcel;