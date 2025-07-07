import { useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  facingMode: "user",
};


function getTimestamp() {
  const date = new Date();
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PhotoBoothStrip() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  const [captures, setCaptures] = useState([]);
  const [stripImage, setStripImage] = useState(null);

  const handleCapture = () => {
    if (captures.length >= 3) return;
    const shot = camRef.current.getScreenshot();
    const updated = [...captures, { shot }];
    setCaptures(updated);
    if (updated.length === 3) renderStrip(updated);
  };

  const renderStrip = (images) => {
    const canvas = canvasRef.current;
    const w = 500, h = 360, gap = 20, pad = 40;
    const footerHeight = 120;

    canvas.width = w + pad * 2;
    canvas.height = (h + gap) * 3 + pad * 2 + footerHeight;

    const ctx = canvas.getContext("2d");

    // Background strip
    ctx.fillStyle = "#111827"; // dark navy
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#d4af37";

    images.forEach((obj, i) => {
      const img = new Image();
      img.src = obj.shot;
      img.onload = () => {
        const y = pad + i * (h + gap);
        ctx.strokeStyle = "#d4af37"; // gold border
        ctx.lineWidth = 6;
        ctx.strokeRect(pad - 4, y - 4, w + 8, h + 8);
        ctx.filter = "contrast(1.1)";
        // ctx.scale(-1, 1);
        ctx.drawImage(img, pad, y, w, h);
        ctx.filter = "none";

        if (i === 2) {
          setTimeout(() => {
            drawFooter(ctx, canvas.width, canvas.height, pad);
            setStripImage(canvas.toDataURL("image/jpeg"));
          }, 200);
        }
      };
    });
  };

  const drawFooter = (ctx, canvasWidth, canvasHeight, pad) => {
    ctx.font = "32px 'Great Vibes', cursive";
    ctx.fillStyle = "#d4af37";
    ctx.textAlign = "center";

    const footerY = canvasHeight - 60;

    ctx.fillText("Ankita & RetroBooth", canvasWidth / 2, footerY - 20);
    ctx.font = "18px monospace";
    ctx.fillText(getTimestamp(), canvasWidth / 2, footerY + 10);
    ctx.fillText("#MemoryMode", canvasWidth / 2, footerY + 30);
  };

  const resetStrip = () => {
    setCaptures([]);
    setStripImage(null);
  };

  const downloadStrip = () => {
    const a = document.createElement("a");
    a.download = "photo-strip.jpg";
    a.href = stripImage;
    a.click();
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center py-12 px-4 font-mono overflow-hidden">
      {/* Radial gradient backgrounds */}
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),transparent)] z-0"></div>
      <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),transparent)] z-0"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <h1
          className="text-5xl font-extrabold mb-8 animate-pulse text-center"
          style={{ textShadow: "0 0 8px rgba(255,255,255,0.8)" }}
        >
          📸 RetroBooth Strip
        </h1>

        {!stripImage && (
          <>
            <div className="w-full max-w-[600px] aspect-[4/3] md:aspect-[16/9] flex justify-center items-center mx-auto">
              <Webcam
                ref={camRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                 mirrored={false}
                className="w-full h-full object-cover rounded-lg transform scale-x-[-1]"
              />
            </div>

            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={handleCapture}
                disabled={captures.length >= 3}
                className="px-6 py-3 text-lg font-semibold bg-pink-600 hover:bg-pink-700 text-white rounded-full border-2 border-white shadow-md hover:scale-105 transition-transform"
                style={{ boxShadow: "0 0 10px rgba(255,192,203,0.5)" }}
              >
                📸 {captures.length < 3 ? `Click ${captures.length + 1} of 3` : "Processing..."}
              </button>
            </div>
          </>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {stripImage && (
          <div className="mt-10 flex flex-col items-center gap-6">
            <img
              src={stripImage}
              alt="Photo Strip"
              className="rounded-lg border border-white shadow-2xl bg-white"
              style={{ boxShadow: "0 0 15px rgba(0,0,0,0.4)", maxHeight: "95vh" }}
            />
            <div className="flex gap-4">
              <button
                onClick={downloadStrip}
                className="px-6 py-2 text-lg bg-white text-pink-600 border-2 border-pink-600 rounded-full hover:bg-pink-100 shadow-md"
                style={{ boxShadow: "0 0 10px rgba(255,192,203,0.6)" }}
              >
                💾 Download Strip
              </button>
              <button
                onClick={resetStrip}
                className="px-6 py-2 text-lg bg-pink-600 text-white rounded-full hover:bg-pink-800 shadow-md"
                style={{ boxShadow: "0 0 10px rgba(255,192,203,0.6)" }}
              >
                🔄 Retake
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
