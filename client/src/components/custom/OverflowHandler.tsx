import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function OverflowHandler({ text, maxWidth = 100 }: { text: string, maxWidth?: number }) {
    const textRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            if (textRef.current) {
                setIsOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
            }
        };

        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, []);

    return (
        <div className="w-full">
            {!isOverflowing ? (
                <div ref={textRef} className="truncate" style={{ maxWidth }}>
                    {text}
                </div>
            ) : (
                <Dialog>
                    <DialogTrigger asChild>

                        <Button className="truncate px-0" variant="link"><span className="truncate" style={{ maxWidth }}>
                            {text}
                        </span></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Full Content</DialogTitle>
                        </DialogHeader>
                        <div>{text}</div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}