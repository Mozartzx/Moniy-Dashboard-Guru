const KEY = 'moniy.activeClass';

/** Kelas yang terakhir dibuka dari daftar kelas; dipakai dashboard untuk memilih kelas awal. */
export function getActiveClassId() {
  try {
    return window.localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function setActiveClassId(id: string) {
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    // Penyimpanan diblokir: dashboard tetap jalan dengan kelas pertama.
  }
}
