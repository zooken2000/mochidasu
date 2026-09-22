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

/** HEIC / HEIF（iPhone の標準形式）かどうか。ブラウザによって type が空のことがあるので拡張子も見る */
export const isHeic = (file: Pick<File, 'name' | 'type'>): boolean =>
  /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

/** HEIC を JPEG に変換する（Chrome などは HEIC を表示できないため）。変換ライブラリは必要なときだけ読み込む */
const heicToJpeg = async (file: File): Promise<File> => {
  const { default: heic2any } = await import('heic2any');
  const out = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.9,
  });
  const blob = Array.isArray(out) ? out[0] : out;
  return new File([blob], file.name.replace(/\.hei[cf]$/i, '.jpg'), {
    type: 'image/jpeg',
  });
};

/** File を <img> で読み込む（Safari の HEIC なども、ブラウザが表示できる形式なら読める） */
const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          `「${file.name}」を読み込めませんでした。JPEG か PNG で保存し直して試してください。`,
        ),
      );
    };
    img.src = url;
  });

/** スマホで撮った写真を縮小・JPEG 化してエージェントに渡せる形にする */
export const toImageInput = async (file: File): Promise<ImageInput> => {
  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch (e) {
    // Safari は HEIC をそのまま読めるので、読めなかったときだけ変換する
    if (!isHeic(file)) throw e;
    img = await loadImage(await heicToJpeg(file));
  }
  const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('画像を処理できませんでした');
  ctx.drawImage(img, 0, 0, width, height);
  return {
    format: 'jpeg',
    data: stripDataUrl(canvas.toDataURL('image/jpeg', JPEG_QUALITY)),
  };
};
