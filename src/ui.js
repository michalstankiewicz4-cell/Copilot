// Proste funkcje UI do aktualizacji panelu statystyk
export function createStatsPanel(containerEl) {
  return {
    update: (gears) => {
      const total = gears.length;
      let html = `<div class="stat-item"><strong>Ilość kół:</strong> ${total}</div>`;
      for (let i = 0; i < gears.length; i++) {
        const g = gears[i];
        const deg = (g.getRotation() * 180 / Math.PI).toFixed(1);
        html += `<div class="stat-item"><strong>Koło ${i+1}</strong><br/>Zęby: ${g.teeth} — Promień: ${g.getRadius().toFixed(2)} — Kąt: ${deg}°</div>`;
      }
      containerEl.innerHTML = html;
    }
  };
}
