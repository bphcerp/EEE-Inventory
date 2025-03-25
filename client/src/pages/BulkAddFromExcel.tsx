import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import useWebSocket, { resetGlobalState } from 'react-use-websocket'
import { UploadStage } from "./UploadStage";
import { toast } from "sonner";
import api from "@/axiosInterceptor";
import { Laboratory, SheetInfo } from "@/types/types";
import ProcessingStage from "./ProcessingStage";
import { AlertCircle, Check } from "lucide-react";

const BulkAddFromExcel = () => {
  const [stage, setStage] = useState(1);
  const totalStages = 3;
  const labels = ['Upload', 'Processing Data', 'Finish'];

  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null)

  const [accessToken, setAccessToken] = useState('')

  const socketUrl = `${import.meta.env.VITE_PUBLIC_API_URL.replace(/^http/, 'ws')}/api/inventory/excel`
  const { sendJsonMessage, lastJsonMessage, sendMessage } = useWebSocket(socketUrl, {
    queryParams: {
      access_token: accessToken
    }
  })

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if ((lastJsonMessage as { error: string }).error) {
        setStage(1)
        setSelectedLab(null)
        toast.error((lastJsonMessage as { error: string }).error)
        return
      }
      else if ((lastJsonMessage as { stage: number }).stage === 2) {
        toast.success('Upload successful')
        sendJsonMessage({ stage: 2, selectedLabId: selectedLab!.id, sheetInfo: (lastJsonMessage as { sheetInfo: SheetInfo }).sheetInfo })
      }
      handleNextStage((lastJsonMessage as { stage: number }).stage)
    }
  }, [lastJsonMessage])

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data } = await api(`/inventory/token`);
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

  const handleNextStage = (stageToGoTo: number) => {
    setStage(Math.min(stageToGoTo, totalStages));
  };

  return (
    <div className="relative flex flex-col p-5 space-y-10">
      <div className="grid grid-cols-3">
        <div className="flex space-x-2 text-red-600">
          <AlertCircle size={20} />
          <span className="text-xs">Vendor Id and Category Code Columns must be present in the excel and match with entries in the Settings page.</span>
        </div>
        <span className="text-3xl text-primary text-center">
          Bulk Add Items from Excel
        </span>

        <Link className="flex justify-end" to="/add-item">
          <Button>Add Single Item</Button>
        </Link>
      </div>

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

        {stage === 1 ? <UploadStage onSubmit={async (file, selectedLab) => {
          // Stage 1 -> 2 Sending the file uploaded to the websocket for processing
          setSelectedLab(selectedLab)
          toast.info("Uploading...")
          sendMessage(await file.arrayBuffer())
        }} /> : stage === 2 ? <ProcessingStage /> : (
          <div className="flex flex-col items-center space-y-4">
            <Check className="w-16 h-16 text-green-500" />
            <span className="text-xl font-semibold text-center text-primary">
              Data has been successfully uploaded!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkAddFromExcel;