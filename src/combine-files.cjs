const fs = require('fs');
const path = require('path');

const outputFileName = 'all.tsx';
const outputFilePath = path.join(process.cwd(), outputFileName);


//RUN USING 
// node combine-files.cjs 
// this will combine all files in the current directory and subdirectories into a single file named all.tsx


// Remove existing output file if any
if (fs.existsSync(outputFilePath)) {
  fs.unlinkSync(outputFilePath);
}

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files = files.concat(collectFiles(fullPath));
    } else {
      // Skip the output file itself if it exists in this directory
      if (entry.name === outputFileName) continue;
      files.push(fullPath);
    }
  }

  return files;
}

// Collect all files relative to the current directory
const allFiles = collectFiles(process.cwd());

// Write files into all.tsx
for (const file of allFiles) {
  // Print file path as a comment
  fs.appendFileSync(outputFilePath, `\n\n// FILE: ${path.relative(process.cwd(), file)}\n`);
  
  // Append file contents
  const contents = fs.readFileSync(file, 'utf-8');
  fs.appendFileSync(outputFilePath, contents);
}

console.log(`All files combined into ${outputFileName}`);
