import { useRef, useState } from "react";
import Webcam from "react-webcam";

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
  const [countdown, setCountdown] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [name, setName] = useState("");
  const [filter, setFilter] = useState("none");
const [selectedFilter, setSelectedFilter] = useState("none");

  const videoConstraints = {
    facingMode: facingMode,
    width: 640,
    height: 480,
  };

  const startCountdown = () => {
    if (captures.length >= 3 || countdown !== null) return;

    let timer = 3;
    setCountdown(timer);

    const interval = setInterval(() => {
      timer--;
      if (timer === 0) {
        clearInterval(interval);
        setCountdown(null);
        captureNow();
      } else {
        setCountdown(timer);
      }
    }, 1000);
  };

 const captureNow = () => {
  const shot = camRef.current.getScreenshot();
  const updated = [...captures, { shot }];
  setCaptures(updated);
  if (updated.length === 3) {
    renderStrip(updated, selectedFilter);  // ✅ pass filter here
  }
};


  const renderStrip = (images, selectedFilter) => {
  const canvas = canvasRef.current;
  const w = 500, h = 360, gap = 20, pad = 40;
  const footerHeight = 120;

  canvas.width = w + pad * 2;
  canvas.height = (h + gap) * 3 + pad * 2 + footerHeight;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  images.forEach((obj, i) => {
    const img = new Image();
    img.src = obj.shot;

    img.onload = () => {
      const y = pad + i * (h + gap);

      ctx.save();
      ctx.translate(canvas.width, 0); // flip horizontally
      ctx.scale(-1, 1);

      ctx.filter = selectedFilter || "none"; // ✅ Apply the selected filter
      ctx.drawImage(img, canvas.width - (pad + w), y, w, h);
      ctx.restore();

      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 6;
      ctx.strokeRect(pad - 4, y - 4, w + 8, h + 8);

      ctx.font = "32px serif";
      ctx.fillText("✨", pad + w - 50, y + 40);

      if (i === 2) {
        setTimeout(() => {
          drawFooter(ctx, canvas.width, canvas.height, pad, name);
          setStripImage(canvas.toDataURL("image/jpeg"));
        }, 200);
      }
    };
  });
};

  const getCanvasFilter = (filter) => {
    switch (filter) {
      case "grayscale":
        return "grayscale(1)";
      case "sepia":
        return "sepia(1)";
      case "contrast":
        return "contrast(1.4)";
      case "saturate":
        return "saturate(1.5)";
      default:
        return "none";
    }
  };

  const drawFooter = (ctx, canvasWidth, canvasHeight, pad, userName) => {
    ctx.font = "32px 'Great Vibes', cursive";
    ctx.fillStyle = "#d4af37";
    ctx.textAlign = "center";
    const footerY = canvasHeight - 60;

    ctx.fillText(
      `${userName || "Your Name"} & RetroBooth`,
      canvasWidth / 2,
      footerY - 20
    );
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
      {/* Background blobs */}
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),transparent)] z-0"></div>
      <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),transparent)] z-0"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <h1
          className="text-5xl font-extrabold mb-6 animate-pulse text-center"
          style={{ textShadow: "0 0 8px rgba(255,255,255,0.8)" }}
        >
          📸 RetroBooth Strip
        </h1>

        {!stripImage && (
          <>
            <div className="relative w-full max-w-[640px] aspect-[4/3] flex justify-center items-center overflow-hidden">
              <Webcam
  ref={camRef}
  audio={false}
  screenshotFormat="image/jpeg"
  videoConstraints={{ facingMode }}
  mirrored={false}
   className="w-full max-w-[500px] aspect-[4/3] object-contain transform scale-x-[-1]"
  style={{ filter: selectedFilter }}
/>

              {countdown !== null && (
  <div className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-white drop-shadow-lg z-20 pointer-events-none">
    {countdown}
  </div>
)}

            </div>

            {/* Filter selector + Input */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
              
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="px-4 py-2 rounded-md border border-white bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <select
  value={selectedFilter}
  onChange={(e) => setSelectedFilter(e.target.value)}
  className="mt-4 px-4 py-2 rounded-md border bg-gray-800 text-white border-pink-400"
>
  <option value="none">No Filter</option>
  <option value="grayscale(1)">Grayscale</option>
  <option value="sepia(1)">Sepia</option>
  <option value="contrast(1.5)">High Contrast</option>
  <option value="saturate(2)">Saturated</option>
  <option value="hue-rotate(90deg)">Hue Rotate</option>
</select>

              <button
                onClick={startCountdown}
                disabled={captures.length >= 3}
                className="px-6 py-3 text-lg font-semibold bg-pink-600 hover:bg-pink-700 text-white rounded-full border-2 border-white shadow-md hover:scale-105 transition-transform"
                style={{ boxShadow: "0 0 10px rgba(255,192,203,0.5)" }}
              >
                📸 {captures.length < 3 ? `Click ${captures.length + 1} of 3` : "Processing..."}
              </button>
              <button
                onClick={() =>
                  setFacingMode((prev) =>
                    prev === "user" ? "environment" : "user"
                  )
                }
                className="px-6 py-3 text-lg font-semibold bg-gray-700 hover:bg-gray-600 text-white rounded-full"
              >
                🔄 Switch Camera
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
              style={{ boxShadow: "0 0 15px rgba(0,0,0,0.4)",
  maxHeight: "95vh",
  maxWidth: "100%",
  height: "auto", }}
            />
            <div className="flex gap-4 flex-wrap justify-center">
              <button
                onClick={downloadStrip}
                className="px-6 py-2 text-lg bg-white text-pink-600 border-2 border-pink-600 rounded-full hover:bg-pink-100 shadow-md"
              >
                💾 Download Strip
              </button>
              <button
                onClick={resetStrip}
                className="px-6 py-2 text-lg bg-pink-600 text-white rounded-full hover:bg-pink-800 shadow-md"
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
