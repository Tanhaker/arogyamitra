/** "gemma-4-26b-a4b-it" -> "26B", for the subtle "Explained by Gemma 4 · 26B" label. */
export function modelLabelClient(model: string): string {
  const m = /gemma-4-(\w+?)(?:-a\d+b)?-it/i.exec(model);
  return m ? m[1].toUpperCase() : model;
}
