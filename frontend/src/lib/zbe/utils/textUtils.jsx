/**
 * Утилиты для работы с текстом
 */

/**
 * Измеряет размер текста с учётом шрифта, переносов и letterSpacing
 */
export const measureTextSize = (
  text = "",
  fontSize = 24,
  fontWeight = "normal",
  lineHeight = 1.4,
  letterSpacing = 0,
  containerWidth = null
) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontWeight} ${fontSize}px Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
  const heightLine = Math.ceil(fontSize * lineHeight);

  // Конвертируем letterSpacing в пиксели
  const letterSpacingPx = typeof letterSpacing === 'string'
    ? parseFloat(letterSpacing)
    : letterSpacing || 0;

  if (containerWidth !== null && containerWidth > 0) {
    const paragraphs = text.split("\n");
    let totalLines = 0;

    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === "") {
        totalLines += 1;
        return;
      }

      const words = paragraph.split(/\s+/);
      let currentLineWidth = 0;
      let linesInParagraph = 1;

      words.forEach((word) => {
        const wordWidth = ctx.measureText(word).width;
        const wordWithSpacing = wordWidth + (word.length * letterSpacingPx);
        const spaceWidth = ctx.measureText(" ").width;
        const totalWordWidth = wordWithSpacing + spaceWidth;

        if (currentLineWidth + totalWordWidth > containerWidth) {
          linesInParagraph++;
          currentLineWidth = totalWordWidth;
        } else {
          currentLineWidth += totalWordWidth;
        }
      });

      totalLines += linesInParagraph;
    });

    const height = heightLine * totalLines;
    return { width: containerWidth, height };
  }

  const words = text.split(/\s+/);
  let maxWidth = 0;
  words.forEach((word) => {
    const metrics = ctx.measureText(word || "Текст");
    const width = Math.ceil(metrics.width);
    const widthWithSpacing = width + (word.length * letterSpacingPx);
    if (widthWithSpacing > maxWidth) maxWidth = widthWithSpacing;
  });

  const lines = text.split("\n").length;
  const height = heightLine * lines;

  return { width: maxWidth, height };
};

/**
 * Генерирует уникальное имя для элемента
 */
export const generateUniqueName = (base, typeName, elements) => {
  const existingNames = elements
    .filter(el => el.type_name === typeName)
    .map(el => {
      if (el.props?.content) return el.props.content;
      if (el.props?.buttonText) return el.props.buttonText;
      if (el.props?.label) return el.props.label;
      return null;
    })
    .filter(name => name && name.startsWith(base));

  if (existingNames.length === 0) return base;

  const numbers = existingNames
    .map(name => {
      const match = name.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(num => !isNaN(num));

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `${base} ${maxNum + 1}`;
};
