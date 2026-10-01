// Dibuat otomatis dari proses aset hero; ubah tata letak di sini. Koordinat dalam persen stage, ukuran dalam px untuk lebar stage 1440.
export type HeroAnim = 'bob' | 'squash' | 'twinkle' | 'coin' | 'sway';
export type HeroSprite = {
  id: string; w: number; h: number; x: number; y: number; s: number; d: number; a: HeroAnim; t: number; e: number;
  amp?: number; rot?: number; eager?: boolean;
  /** posisi di HP (kiri %, atas %, lebar px); tanpa ini sprite disembunyikan di HP */
  m?: [number, number, number];
  blink?: { t: number; e: number; left: number; top: number; width: number; w: number; h: number };
};

export const heroSprites: HeroSprite[] = [
  { id: 'moniy-utama', w: 502, h: 560, x: 5, y: 25, s: 270, d: 10, a: 'squash', t: 5.6, e: 0, eager: true, blink: { t: 5.2, e: 1.1, left: 32.89, top: 26.53, width: 42.59, w: 214, h: 110 }, m: [3, 75, 112] },
  { id: 'bag', w: 219, h: 260, x: 21.5, y: 3, s: 100, d: 16, a: 'bob', t: 5.8, e: 0.4, amp: 9 },
  { id: 'coin-front', w: 260, h: 260, x: 2.5, y: 9, s: 78, d: 18, a: 'coin', t: 4.8, e: 0.2 },
  { id: 'piggy', w: 260, h: 234, x: 19.5, y: 60, s: 124, d: 14, a: 'bob', t: 6.1, e: 1.2, m: [38, 78, 96] },
  { id: 'coin-stack', w: 233, h: 260, x: 2.5, y: 72, s: 86, d: 20, a: 'bob', t: 5.2, e: 0.8 },
  { id: 'heart-r', w: 200, h: 166, x: 25.5, y: 40, s: 54, d: 22, a: 'sway', t: 4.6, e: 0.9, rot: 8 },
  { id: 'star-y', w: 200, h: 187, x: 1.5, y: 52, s: 40, d: 26, a: 'sway', t: 5.2, e: 0.3, m: [2, 68, 26] },
  { id: 'star-o', w: 200, h: 190, x: 15, y: 6, s: 36, d: 26, a: 'sway', t: 4.4, e: 1.6 },
  { id: 'spark-b', w: 189, h: 191, x: 13, y: 24, s: 34, d: 30, a: 'twinkle', t: 2.6, e: 0.2, m: [34, 73, 22] },
  { id: 'spark-y', w: 193, h: 196, x: 28, y: 26, s: 30, d: 30, a: 'twinkle', t: 3.1, e: 1.0 },
  { id: 'spk3-y', w: 195, h: 186, x: 10, y: 66, s: 46, d: 30, a: 'twinkle', t: 2.9, e: 0.6 },
  { id: 'spark-big', w: 198, h: 200, x: 29, y: 80, s: 40, d: 30, a: 'twinkle', t: 2.4, e: 1.5, m: [90, 86, 26] },
  { id: 'coin-tilt', w: 245, h: 260, x: 28.5, y: 57, s: 52, d: 20, a: 'coin', t: 4.2, e: 1.1 },
  { id: 'moniy-roket', w: 451, h: 560, x: 73, y: 17, s: 280, d: 10, a: 'squash', t: 6.0, e: 0.5, eager: true, m: [54, 1, 118], blink: { t: 4.6, e: 2.3, left: 29.39, top: 16.98, width: 37.7, w: 170, h: 111 } },
  { id: 'chart', w: 242, h: 260, x: 87.5, y: 3, s: 104, d: 14, a: 'bob', t: 5.5, e: 0.8, m: [7, 2, 78] },
  { id: 'shield', w: 260, h: 208, x: 87.5, y: 55, s: 112, d: 14, a: 'bob', t: 6.0, e: 1.2, m: [70, 77, 92] },
  { id: 'magni', w: 260, h: 223, x: 70, y: 40, s: 66, d: 18, a: 'sway', t: 5.6, e: 0.6 },
  { id: 'plane', w: 240, h: 204, x: 70.5, y: 4, s: 62, d: 20, a: 'sway', t: 5.0, e: 0.1, m: [32, 2, 44] },
  { id: 'coin-front', w: 260, h: 260, x: 95, y: 34, s: 56, d: 20, a: 'coin', t: 4.5, e: 0.9, m: [86, 12, 32] },
  { id: 'coin-front', w: 260, h: 260, x: 92, y: 84, s: 46, d: 22, a: 'coin', t: 4.0, e: 0.3 },
  { id: 'star-y', w: 200, h: 187, x: 68, y: 24, s: 38, d: 26, a: 'sway', t: 4.8, e: 1.3, m: [26, 13, 22] },
  { id: 'star-o', w: 200, h: 190, x: 96, y: 74, s: 34, d: 26, a: 'sway', t: 4.2, e: 0.5 },
  { id: 'heart-b', w: 200, h: 162, x: 96, y: 50, s: 40, d: 22, a: 'sway', t: 4.9, e: 0.2, rot: 8 },
  { id: 'spark-y', w: 193, h: 196, x: 98, y: 18, s: 32, d: 30, a: 'twinkle', t: 3.0, e: 1.1 },
  { id: 'spark-b', w: 189, h: 191, x: 83, y: 90, s: 32, d: 30, a: 'twinkle', t: 2.5, e: 0.4 },
  { id: 'spk3-b', w: 195, h: 195, x: 94, y: 60, s: 44, d: 30, a: 'twinkle', t: 2.7, e: 0.9, m: [46, 4, 30] },
  { id: 'spark-c', w: 146, h: 149, x: 69, y: 52, s: 28, d: 30, a: 'twinkle', t: 3.3, e: 0.2 },
];
