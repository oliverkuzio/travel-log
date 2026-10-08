/**
 * Scales an image down to at most maxWidth pixels wide and re-encodes it as a JPEG for upload.
 */
export default async function resizeImage(file: Blob, maxWidth = 1000) {
  const original = await createImageBitmap(file);
  const width = Math.min(maxWidth, original.width);
  const resized = await createImageBitmap(original, { resizeWidth: width });
  original.close();

  const canvas = new OffscreenCanvas(width, resized.height);
  canvas.getContext("bitmaprenderer")?.transferFromImageBitmap(resized);

  return canvas.convertToBlob({
    type: "image/jpeg",
    quality: 0.9,
  });
}
