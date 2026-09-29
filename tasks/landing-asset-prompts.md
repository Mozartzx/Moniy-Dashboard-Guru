# Prompt aset landing page Moniy

Cara pakai: di GPT Plus dan Gemini, **selalu unggah dulu gambar maskot referensi** (monyet biru berhoodie yang melambai, versi 3D lembut) lalu tempel prompt. Isi prompt sengaja berbahasa Inggris karena model gambar paling patuh dengan itu.

Aturan latar (penting): minta **latar hijau polos `#00FF00`** supaya mudah saya hapus jadi transparan. Jangan minta "transparent background", hasilnya sering kotak-kotak palsu. Maskot tidak punya warna hijau, jadi aman.

Simpan file dengan nama persis seperti di tiap prompt, lalu letakkan di `public/landing/incoming/`. Sisanya saya yang pasang.

---

## 0. Blok gaya (tempel di AWAL setiap prompt)

```
Use the attached image as the strict character reference: Moniy, a cute blue monkey mascot.
Keep the character IDENTICAL in every image: same head shape, same blue fur color (#1768e5),
cream face and belly, coral-pink inner ears and cheeks, big glossy dark-blue eyes with white highlights,
small curly tail, same royal-blue zip hoodie with drawstrings and front pocket.
Style: soft 3D plush toy render, rounded shapes, gentle studio lighting, subtle soft shadows,
clean and friendly, for teenagers (high school). No text, no logos, no watermark.
Background: perfectly flat solid pure green #00FF00, no gradient, no floor, no cast shadow on the background.
Leave about 8 percent empty margin around the subject. Square 1:1 canvas, 2048x2048.
```

---

## A. GPT Plus (ilustrasi statis, 6 gambar)

Tempel blok gaya di atas, lalu satu adegan di bawah. Minta **satu gambar per permintaan**.

**A1. `hero-jump.png`** (hero, mengganti maskot melambai kalau mau lebih hidup)
```
Scene: Moniy jumping joyfully mid-air with both arms up, big open smile, looking at the viewer.
Around him float a few finance items, each clearly separated and not overlapping his body:
a gold coin, a small piggy bank, a phone showing a simple blue chart, a tiny shopping bag, and a blue shield.
Items are in the same soft 3D plush style and use only blue, cream, coral and gold colors.
```

**A2. `story-market.png`** (fitur "kamu yang menentukan ceritanya")
```
Scene: Moniy standing behind a small wooden market stall, scratching his chin while thinking,
comparing three cardboard boxes on the counter labeled only with the symbols A, B and C (no other text).
A small clipboard and a calculator on the counter. Warm, curious mood.
```

**A3. `ending-medal.png`** (fitur "dapat julukan di akhir cerita")
```
Scene: Moniy proudly holding up a big round gold medal with a happy deer face embossed on it,
with a few gold sparkles and soft confetti pieces around him. Proud, celebrating mood.
```

**A4. `shield-guard.png`** (band Perisai)
```
Scene: Moniy standing firm holding a big blue shield with a white checkmark in front of him,
in front of him a red round "blocked" sign with a diagonal slash over a generic slot-machine icon (do not show real casino brands).
Confident, protective mood, not aggressive. Nothing scary or violent, suitable for teenagers.
```

**A5. `teacher-clipboard.png`** (panel guru)
```
Scene: Moniy wearing small round glasses over his big eyes, holding a clipboard with a simple bar chart on it,
standing next to a floating laptop screen showing a plain blue dashboard with three cards and a bar chart (no readable text).
Calm, helpful mood.
```

**A6. `download-wave.png`** (penutup / unduh)
```
Scene: Moniy waving with one hand while holding a big smartphone in the other hand.
The phone screen shows a simple blue app icon with a monkey face. Welcoming, inviting mood.
```

---

## B. Gemini Nano Banana Pro (urutan frame untuk animasi)

Nano Banana menghasilkan gambar diam, bukan video. Jadi animasinya dibuat dari **urutan frame** yang saya rangkai jadi WebP animasi. Tips: satu percakapan untuk satu animasi, minta frame **satu per satu**, dan tulis "same camera, same size, same position as the previous frame".

Tempel blok gaya di atas, lalu tambahkan ini di awal percakapan:

```
I need a frame-by-frame animation of the same character. Every frame must use the exact same canvas size,
the exact same camera, and the character's feet/body anchor point at the exact same position. Only the pose changes slightly
between frames (small, smooth changes, like a hand-drawn animation loop). I will ask for one frame at a time.
```

Lalu minta frame demi frame:

**B1. `wave-01.png` sampai `wave-06.png`** (melambai, loop 6 frame, untuk hero)
```
Frame 1 of 6, loop "wave": neutral standing pose, right hand resting near the chest, slight smile.
Frame 2: right hand rises to shoulder height. Frame 3: hand fully raised, palm open, big smile.
Frame 4: hand tilts slightly to the left. Frame 5: hand tilts slightly to the right. Frame 6: hand lowers back, ready to loop to frame 1.
Body, feet and head stay in the same position, only the arm and a tiny head tilt move.
```

**B2. `bounce-01.png` sampai `bounce-06.png`** (melompat kecil, loop untuk idle hero)
```
Loop "bounce" in 6 frames: 1 standing, 2 crouch (knees bent, arms back), 3 push off (body stretches upward),
4 top of the jump (feet off the ground, arms up, happy), 5 falling (body slightly squashed), 6 landing (small squash) then back to standing.
Keep the same horizontal position in every frame. Only vertical position and squash/stretch change.
```

**B3. `celebrate-01.png` sampai `celebrate-06.png`** (merayakan pencapaian, untuk bagian ending)
```
Loop "celebrate" in 6 frames: Moniy raises both arms, cheers with open mouth, gold confetti pieces fall progressively lower in each frame,
a gold sparkle appears at frame 3 and fades by frame 6. Same position of the character in all frames.
```

**B4. `think-01.png` sampai `think-04.png`** (berpikir, untuk bagian cerita)
```
Loop "think" in 4 frames: Moniy taps his chin with one finger, eyes look up to the left (frame 1), blink (frame 2),
eyes look up to the right (frame 3), a small light bulb icon appears above his head (frame 4). Same position in all frames.
```

**B5. `shield-pulse-01.png` sampai `shield-pulse-03.png`** (perisai menyala, untuk band Perisai)
```
3 frames: Moniy holds the blue shield. Frame 1: shield plain. Frame 2: soft light-blue glow ring around the shield.
Frame 3: glow ring larger and fainter. Character identical and static in all three frames.
```

---

## C. Veo (video animasi, cara utama kalau Gemini kamu punya Veo)

**Alur terbaik:** buat gambar diamnya dulu di GPT (bagian A), lalu jadikan **frame pertama** di Veo (mode "image to video" atau "frames to video" di Flow/Gemini). Dengan begitu wajah maskot konsisten dan Veo hanya menggerakkan.

**Pengaturan yang disarankan**
- Rasio **16:9**, maskot di tengah dan mengisi sekitar 60% tinggi frame. Nanti saya potong.
- Durasi terpendek yang ada (4 atau 6 detik). Semakin pendek, semakin ringan filenya di landing page. Kalau hanya ada 8 detik, tidak masalah, saya potong bagian terbaiknya.
- Audio boleh diabaikan atau dimatikan, landing page tanpa suara.
- Supaya bisa **berulang mulus (loop)**: kalau ada fitur "first and last frame", isi frame awal dan frame akhir dengan **gambar yang sama**. Kalau tidak ada, tidak apa, saya buat loop dengan cross-fade di ujung klip.
- Latar tetap **hijau polos `#00FF00`**, supaya saya bisa hapus jadi transparan dengan chroma key. Kalau Veo menambah bayangan atau gradasi di latar, minta ulang dengan menambah kalimat "absolutely flat uniform green background, no shadows, no vignette".

**Blok wajib di setiap prompt video (tempel di akhir prompt)**
```
Locked-off static camera, no zoom, no pan, no cuts, no camera shake. The character design must stay exactly identical to the first frame
(same blue fur, cream face, coral ears, blue hoodie) in every frame. Flat uniform pure green #00FF00 background, no shadows on the background,
no vignette, no text, no logos, no watermark, no extra characters. Smooth natural motion with soft 3D plush-toy feel, like a high quality 3D animated mascot.
```

**V1. `hero-loop.mp4`** (hero, frame awal: `hero-jump.png` atau maskot melambai)
```
Moniy the blue monkey mascot stands centered and cheerfully waves with his right hand, blinks once, gives a small friendly head tilt,
and bobs gently up and down on his feet as if he is happy. The motion ends in exactly the same pose as it started so it loops seamlessly.
```

**V2. `celebrate.mp4`** (bagian pencapaian/ending, frame awal: `ending-medal.png`)
```
Moniy lifts a big gold medal up with both hands, gives a proud happy jump, and gold confetti and small gold sparkles rain down softly around him,
then he settles back into the starting pose. Confetti stays in front of the green background and fades out before the end so the loop is clean.
```

**V3. `think.mp4`** (bagian cerita, frame awal: `story-market.png`)
```
Moniy scratches his chin with one finger while looking thoughtfully from one cardboard box to the next, then his eyes light up,
a small glowing light bulb pops above his head for a moment and fades, and he gives a confident nod.
```

**V4. `shield-guard.mp4`** (pita Perisai, frame awal: `shield-guard.png`)
```
Moniy holds the big blue shield steadily in front of him. A soft light-blue glow ring pulses outward from the shield twice, gently.
Moniy gives one firm, confident nod and stays calm and protective. Nothing scary, nothing violent. Ends in the starting pose for a loop.
```

**V5. `download-wave.mp4`** (penutup, frame awal: `download-wave.png`)
```
Moniy waves welcomingly with one hand while holding a big smartphone with the other. The phone screen glows softly with a blue light
that pulses once, and Moniy points a finger toward the phone with a big inviting smile, then returns to the starting pose.
```

**Yang saya lakukan setelah kamu kirim**
Klip dipotong, latar hijau dihapus (chroma key dan despill), lalu diubah jadi WebP animasi transparan yang ringan (target di bawah 500 KB per klip, 480 px, 12 fps) dan dipasang di slot yang ada. Simpan file sebagai `hero-loop.mp4`, `celebrate.mp4`, `think.mp4`, `shield-guard.mp4`, `download-wave.mp4` di `public/landing/incoming/`.

---

## Checklist sebelum kirim ke saya
- Semua gambar 2048x2048 (atau 1024x1024 minimum), latar hijau rata, tanpa teks.
- Wajah dan warna maskot sama persis di semua gambar. Kalau ada yang melenceng, minta ulang dengan kalimat "keep the character identical to the reference image".
- Tidak ada logo merek nyata, tidak ada elemen kasino asli, tidak ada kekerasan.
- Penamaan file persis seperti di daftar, urutan frame dua digit (`wave-01.png`).
