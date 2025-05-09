export interface MNISTData {
  imageUrl: string;
  label: number;
  latentVector: number[];
}

export async function loadMNISTData(): Promise<MNISTData[]> {
  const metaRes = await fetch('/mnist-sample/meta.json');
  const meta = await metaRes.json();
  const coordsRes = await fetch('/mnist-sample/coords.json');
  const coords = await coordsRes.json();
  return meta.map((item: { file: string; label: number }, i: number) => ({
    imageUrl: `/mnist-sample/${item.file}`,
    label: item.label,
    latentVector: coords[i] as [number, number, number],
  }));
}

export function processImage(image: number[]): number[] {
  // Normalize pixel values to [0, 1]
  return image.map(pixel => pixel / 255);
}

export function getDigitColor(digit: number): string {
  const colors = [
    '#FF6B6B', // 0
    '#4ECDC4', // 1
    '#45B7D1', // 2
    '#96CEB4', // 3
    '#FFEEAD', // 4
    '#D4A5A5', // 5
    '#9B59B6', // 6
    '#3498DB', // 7
    '#E67E22', // 8
    '#2ECC71'  // 9
  ];
  return colors[digit];
} 