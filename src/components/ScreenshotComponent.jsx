import React, { useRef } from "react";
import html2canvas from "html2canvas";

const ScreenshotComponent = () => {
  const takeScreenshot = async () => {
    const body = document.body; // Capture the entire page
    const canvas = await html2canvas(body);
    const image = canvas.toDataURL("image/png");

    // Create a download link
    const link = document.createElement("a");
    link.href = image;
    link.download = "screenshot.png";
    link.click();
  };

  return (
    <div>
      <h2>Take Screenshot</h2>
      <button onClick={takeScreenshot}>Capture Screenshot</button>
    </div>
  );
};

export default ScreenshotComponent;
