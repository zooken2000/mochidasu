import type { ImageInput } from '../generated/extractor/types.gen';

/** Bedrock に送る前に長辺をこのサイズまで縮める (文字が読める範囲で軽くする) */
export const MAX_EDGE = 2000;
export const JPEG_QUALITY = 0.85;

/** 長辺が maxEdge を超える場合だけ縮小した幅・高さを返す */
export const fitWithin = (
  width: number,
  height: number,
  maxEdge = MAX_EDGE,
): { width: number; height: number } => {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};

/** data URL から base64 部分だけを取り出す */
export const stripDataUrl = (dataUrl: string): string =>
  dataUrl.slice(dataUrl.indexOf(',') + 1);

/** スマホで撮った写真を縮小・JPEG 化してエージェントに渡せる形にする */
export const toImageInput = async (file: File): Promise<ImageInput> => {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  });
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('画像を読み込めませんでした');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return {
    format: 'jpeg',
    data: stripDataUrl(canvas.toDataURL('image/jpeg', JPEG_QUALITY)),
  };
};
