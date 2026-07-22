/* eslint-disable no-restricted-globals */
import jsPDF from 'jspdf';

/**
 * Intelligent PDF pagination worker (ported from React pdfWorker.ts).
 * Expects: { imgData, pdfWidth, pdfHeight, marginY, isPaginated, fileName }
 */
self.onmessage = async (e) => {
  const { imgData, pdfWidth, pdfHeight, marginY, isPaginated, fileName } = e.data;

  try {
    let pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const response = await fetch(imgData);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    const canvasWidth = bitmap.width;
    const canvasHeight = bitmap.height;
    const scale = canvasWidth / pdfWidth;
    const pageHeightInCanvas = (pdfHeight - marginY * 2) * scale;

    if (!isPaginated) {
      const pdfTotalImgHeight = canvasHeight / scale;
      pdf = new jsPDF({
        orientation: pdfTotalImgHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, Math.max(pdfTotalImgHeight, 297)],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfTotalImgHeight, '', 'FAST');
    } else {
      const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Failed to get canvas context');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(bitmap, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const data = imageData.data;

      const getPixel = (x, y) => {
        const i = (y * canvasWidth + x) * 4;
        return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
      };

      const isSafeRow = (y) => {
        const leftBg = getPixel(10, y);
        const centerBg = getPixel(Math.floor(canvasWidth / 2), y);
        const rightBg = getPixel(canvasWidth - 10, y);
        let contentPixels = 0;
        const tolerance = 20;
        const contrastThreshold = 30;

        for (let x = 0; x < canvasWidth; x++) {
          const p = getPixel(x, y);
          if (p.a < 10) continue;

          const diffL =
            Math.abs(p.r - leftBg.r) +
            Math.abs(p.g - leftBg.g) +
            Math.abs(p.b - leftBg.b);
          const diffC =
            Math.abs(p.r - centerBg.r) +
            Math.abs(p.g - centerBg.g) +
            Math.abs(p.b - centerBg.b);
          const diffR =
            Math.abs(p.r - rightBg.r) +
            Math.abs(p.g - rightBg.g) +
            Math.abs(p.b - rightBg.b);
          const minDiff = Math.min(diffL, diffC, diffR);

          if (minDiff > contrastThreshold) {
            let isVerticalLine = true;
            const checkRange = 10;
            for (let dy = -checkRange; dy <= checkRange; dy++) {
              if (dy === 0) continue;
              const ny = y + dy;
              if (ny < 0 || ny >= canvasHeight) continue;
              const np = getPixel(x, ny);
              const nDiff =
                Math.abs(p.r - np.r) +
                Math.abs(p.g - np.g) +
                Math.abs(p.b - np.b);
              if (nDiff > 15) {
                isVerticalLine = false;
                break;
              }
            }
            if (!isVerticalLine) contentPixels++;
          }
          if (contentPixels > tolerance) return false;
        }
        return true;
      };

      const countContentPixels = (y) => {
        const leftBg = getPixel(10, y);
        const centerBg = getPixel(Math.floor(canvasWidth / 2), y);
        const rightBg = getPixel(canvasWidth - 10, y);
        let contentPixels = 0;
        for (let x = 0; x < canvasWidth; x++) {
          const p = getPixel(x, y);
          if (p.a < 10) continue;
          const diffL =
            Math.abs(p.r - leftBg.r) +
            Math.abs(p.g - leftBg.g) +
            Math.abs(p.b - leftBg.b);
          const diffC =
            Math.abs(p.r - centerBg.r) +
            Math.abs(p.g - centerBg.g) +
            Math.abs(p.b - centerBg.b);
          const diffR =
            Math.abs(p.r - rightBg.r) +
            Math.abs(p.g - rightBg.g) +
            Math.abs(p.b - rightBg.b);
          if (Math.min(diffL, diffC, diffR) > 30) {
            let isVerticalLine = true;
            for (let dy = -10; dy <= 10; dy++) {
              if (dy === 0) continue;
              const ny = y + dy;
              if (ny < 0 || ny >= canvasHeight) continue;
              const np = getPixel(x, ny);
              if (
                Math.abs(p.r - np.r) +
                  Math.abs(p.g - np.g) +
                  Math.abs(p.b - np.b) >
                15
              ) {
                isVerticalLine = false;
                break;
              }
            }
            if (!isVerticalLine) contentPixels++;
          }
        }
        return contentPixels;
      };

      let currentY = 0;
      let pageIndex = 0;

      while (currentY < canvasHeight) {
        if (pageIndex > 0) pdf.addPage();

        let idealY = Math.floor(currentY + pageHeightInCanvas);
        let safeY = idealY;

        if (idealY < canvasHeight) {
          let foundSafe = false;
          const range1 = Math.floor(pageHeightInCanvas * 0.02);
          for (let y = idealY; y > idealY - range1 && y > currentY; y--) {
            if (
              isSafeRow(y) &&
              isSafeRow(y - 1) &&
              isSafeRow(y - 2) &&
              isSafeRow(y - 3)
            ) {
              safeY = y - 1;
              foundSafe = true;
              break;
            }
          }

          if (!foundSafe) {
            const range2 = Math.floor(pageHeightInCanvas * 0.04);
            for (let y = idealY; y > idealY - range2 && y > currentY; y--) {
              if (isSafeRow(y) && isSafeRow(y - 1)) {
                safeY = y - 1;
                foundSafe = true;
                break;
              }
            }
          }

          if (!foundSafe) {
            const range3 = Math.floor(pageHeightInCanvas * 0.06);
            for (let y = idealY; y > idealY - range3 && y > currentY; y--) {
              if (isSafeRow(y)) {
                safeY = y;
                foundSafe = true;
                break;
              }
            }
          }

          if (!foundSafe) {
            let minPixels = Infinity;
            let bestY = idealY;
            const searchRange = Math.floor(pageHeightInCanvas * 0.08);
            for (let y = idealY; y > idealY - searchRange && y > currentY; y--) {
              const pixels = countContentPixels(y);
              if (pixels < minPixels) {
                minPixels = pixels;
                bestY = y;
              }
            }
            safeY = bestY;
          }
        } else {
          safeY = canvasHeight;
        }

        const sliceHeight = safeY - currentY;
        const sliceCanvas = new OffscreenCanvas(canvasWidth, sliceHeight);
        const sliceCtx = sliceCanvas.getContext('2d');

        if (sliceCtx) {
          sliceCtx.fillStyle = '#ffffff';
          sliceCtx.fillRect(0, 0, canvasWidth, sliceHeight);
          sliceCtx.drawImage(
            bitmap,
            0,
            currentY,
            canvasWidth,
            sliceHeight,
            0,
            0,
            canvasWidth,
            sliceHeight
          );

          const sliceBlob = await sliceCanvas.convertToBlob({ type: 'image/png' });
          const sliceDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(sliceBlob);
          });

          const pdfSliceHeight = sliceHeight / scale;

          if (currentY > 0 || marginY > 0) {
            const topRowCanvas = new OffscreenCanvas(canvasWidth, 1);
            const topRowCtx = topRowCanvas.getContext('2d');
            if (topRowCtx) {
              topRowCtx.drawImage(
                bitmap,
                0,
                currentY,
                canvasWidth,
                1,
                0,
                0,
                canvasWidth,
                1
              );
              const topRowBlob = await topRowCanvas.convertToBlob({
                type: 'image/png',
              });
              const topRowDataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(topRowBlob);
              });
              pdf.addImage(topRowDataUrl, 'PNG', 0, 0, pdfWidth, marginY, '', 'FAST');
            }
          }

          if (safeY < canvasHeight || marginY > 0) {
            const bottomRowCanvas = new OffscreenCanvas(canvasWidth, 1);
            const bottomRowCtx = bottomRowCanvas.getContext('2d');
            if (bottomRowCtx) {
              bottomRowCtx.drawImage(
                bitmap,
                0,
                safeY - 1,
                canvasWidth,
                1,
                0,
                0,
                canvasWidth,
                1
              );
              const bottomRowBlob = await bottomRowCanvas.convertToBlob({
                type: 'image/png',
              });
              const bottomRowDataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(bottomRowBlob);
              });
              const remainingHeight = pdfHeight - (marginY + pdfSliceHeight);
              if (remainingHeight > 0) {
                pdf.addImage(
                  bottomRowDataUrl,
                  'PNG',
                  0,
                  marginY + pdfSliceHeight,
                  pdfWidth,
                  remainingHeight,
                  '',
                  'FAST'
                );
              }
            }
          }

          pdf.addImage(
            sliceDataUrl,
            'PNG',
            0,
            marginY,
            pdfWidth,
            pdfSliceHeight,
            '',
            'FAST'
          );
        }

        currentY = safeY;
        pageIndex++;
      }
    }

    const pdfBlob = pdf.output('blob');
    self.postMessage({ status: 'success', blob: pdfBlob, fileName });
  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error && error.message ? error.message : String(error),
    });
  }
};
