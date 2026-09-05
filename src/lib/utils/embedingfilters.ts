export function toBullets(text: string, max = 4): string[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 25 &&
        /conservative|therapy|weeks|x-ray|imaging|mri|neurolog|failure|documented|physical|nsaid|chiropractic/i.test(
          l,
        ),
    );

  const bullets: string[] = [];
  for (const line of lines) {
    if (bullets.length >= max) break;
    const b = line.startsWith("•") || line.startsWith("-") ? line : `• ${line}`;
    if (!bullets.some((x) => x.includes(line.slice(0, 40)))) {
      bullets.push(b.slice(0, 280));
    }
  }

  if (bullets.length === 0 && text.trim()) {
    bullets.push(`• ${text.trim().slice(0, 220)}…`);
  }
  return bullets.slice(0, max);
}
