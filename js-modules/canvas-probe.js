// ------------------------------------------------------------------------
// Canvas dimensions probe
// ------------------------------------------------------------------------
import { CANVAS_LIMITS } from './utilities.js';

const TEST_SIZES = [4096, 8192, 16384, 24576, 32768];

const SAFETY_RATIO = 0.95;
const AREA_DIMENSION_RATIO = 0.975;

const canvasWorks = (size) => {

  try {
    const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.fillStyle = '#fff';
    ctx.fillRect(size - 1, size - 1, 1, 1);

    return ctx.getImageData(size - 1, size - 1, 1, 1).data[3] === 255;
  }
  catch {
    return false;
  }
};

export const detectCanvasLimits = () => {

  let detectedDimension = 0;

  for (const size of TEST_SIZES) {

    if (canvasWorks(size)) detectedDimension = size;
    else break;
  }

  // Conservative fallback
  if (!detectedDimension) detectedDimension = 4096;

  const maxDimension = Math.floor(detectedDimension * SAFETY_RATIO);
  const maxAreaDimension = Math.floor(detectedDimension * AREA_DIMENSION_RATIO);

  CANVAS_LIMITS.maxDimension = maxDimension;
  CANVAS_LIMITS.maxArea = maxAreaDimension * maxAreaDimension;
};
