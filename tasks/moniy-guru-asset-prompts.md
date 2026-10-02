# Prompt maskot Moniy jadi guru (untuk ChatGPT Plus)

Dipakai di kartu biru "Untuk guru" pada landing page. Gayanya harus sama dengan Moniy di hero: flat vector, bukan 3D.

## Cara pakai

1. Buka ChatGPT, mulai chat baru.
2. Unggah **dua gambar referensi**: `public/landing/hero/moniy-utama.webp` (gaya flat yang dipakai di hero) dan `Moniy_Mascot.jpeg` (karakter aslinya).
3. Tempel **Prompt 1** di bawah. Kalau hasilnya pas, lanjut minta **Prompt 2** di chat yang sama (supaya karakternya konsisten), lalu **Prompt 3** untuk mata terpejam.
4. Simpan file PNG dengan nama persis seperti di prompt, taruh di `public/landing/incoming/guru/`, lalu bilang ke Claude "sudah". Claude yang menghapus latar putih, mengompres ke WebP, dan memasangnya di kartu guru.

Prompt sengaja berbahasa Inggris karena model gambar paling patuh dengan itu.

---

## Prompt 1: `moniy-guru.png` (pose utama, dipakai di kartu guru)

```
Use the two attached images as the character reference. Moniy is a blue monkey (#1768E5) with a cream face mask, coral-pink inner ears, big round dark-navy eyes with a small white highlight, a tiny coral nose, a tuft of hair on top, a curled tail, a blue hoodie with a front pocket and two drawstrings, and cream hands and feet.

Redraw Moniy in the SAME flat vector style as the first attached image (flat colors, clean soft shapes, no 3D, no heavy gradients, very light shading only). Keep the same proportions (big head, small body) and the same friendly face.

Scene: Moniy dressed as a teacher. He wears small round glasses with thin dark-navy frames over his big eyes, and a tiny graduation-style teacher outfit built on top of his hoodie: a small tan blazer vest with two buttons over the hoodie, and a thin red-orange lanyard with a plain white ID card (no text). In one hand he holds a wooden pointer stick pointing up and to the right. In the other hand he holds a clipboard that shows a simple blue bar chart with four bars and one small blue shield with a check mark (no letters, no numbers).
Pose: standing, friendly three-quarter view turned slightly to the right, warm confident smile, full body visible from head to feet, tail visible.

Background: plain pure white #FFFFFF, no checkerboard, no floor, no cast shadow on the background.
Layout rule: Moniy is fully visible and completely inside the frame with at least 12 percent empty white margin on every side. Nothing is cropped. Nothing touches the image border.
No text, no letters, no numbers, no logos, no watermark anywhere. Square 1:1 canvas, 2048x2048.
```

## Prompt 2: `moniy-guru-papan.png` (cadangan, pose kedua)

Kirim di chat yang sama setelah Prompt 1.

```
Create a second pose of the exact same teacher Moniy, same flat vector style, same glasses, same vest, same lanyard.
Scene: Moniy stands beside a small classroom whiteboard on legs. On the whiteboard there is a simple drawing: a gold coin, an arrow going up, and a small blue shield. No letters, no numbers.
He holds a whiteboard marker in one hand and gives a thumbs up with the other hand. Big happy smile, slight head tilt.
Same rules: pure white #FFFFFF background, full body fully visible, at least 12 percent empty margin on every side, nothing cropped, no text, no letters, no numbers, no logos. Square 1:1 canvas, 2048x2048.
```

## Prompt 3: `moniy-guru-mata.png` (mata terpejam untuk animasi kedip)

Kirim setelah kamu puas dengan Prompt 1.

```
Edit the first teacher Moniy image (moniy-guru). Change ONLY the eyes: draw them closed as two happy upward arcs, keep the round glasses exactly as they are. Everything else must stay identical: same position, same size, same pose, same colors, same white background. Do not redraw or shift anything else.
```

---

## Cek cepat sebelum mengirim ke Claude

- Latar benar-benar putih polos, tidak ada kotak-kotak palsu.
- Moniy utuh, tidak terpotong, ada margin putih di semua sisi.
- Tidak ada huruf atau angka di papan, kartu, atau baju.
- Warna biru badan sama dengan Moniy di hero (#1768E5), bukan biru yang lebih tua atau lebih muda.
