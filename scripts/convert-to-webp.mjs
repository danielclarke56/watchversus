import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync } from 'fs';
import { join, extname, basename } from 'path';

const dir = 'public/images/watches';
const files = readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

let totalBefore = 0, totalAfter = 0, count = 0;
console.log(`Converting ${files.length} images to WebP...`);
for (const file of files) {
  const inputPath = join(dir, file);
  const slug = basename(file, extname(file));
  const outputPath = join(dir, slug + '.webp');
  const before = statSync(inputPath).size;
  await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);
  const after = statSync(outputPath).size;
  totalBefore += before;
  totalAfter += after;
  count++;
  console.log(`✓ ${slug}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB`);
}
console.log(`\n${count} converted | Total: ${(totalBefore/1024/1024).toFixed(1)}MB → ${(totalAfter/1024/1024).toFixed(1)}MB (${Math.round((1-totalAfter/totalBefore)*100)}% reduction)`);
