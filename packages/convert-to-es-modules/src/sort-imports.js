"use strict";

const BLANK_LINE = /^\s*$/;
const IMPORT_LINE = /^\s*import.*from ['"](.*)['"];?/;

/**
 * Extract the module path from an ES `import` statement.
 */
function getImportPath(line) {
  const importMatch = line.match(IMPORT_LINE);
  return importMatch ? importMatch[1] : null;
}

/**
 * Sort and group a list of import lines.
 *
 * @param {string[]} - Lines that are either empty or contain import declarations.
 */
function sortAndGroupImports(lines) {
  // Group imports by location relative to calling package.
  const imports = {
    vendor: [],
    samePackage: [],
    sameDir: []
  };

  const getCategory = path => {
    if (path.startsWith("./")) {
      return "sameDir";
    } else if (path.startsWith("../")) {
      return "samePackage";
    } else {
      return "vendor";
    }
  };

  for (let line of lines) {
    const importPath = getImportPath(line);
    if (!importPath) {
      // Skip blank lines.
      continue;
    }

    const category = getCategory(importPath);
    imports[category].push(line);
  }

  const sortedLines = [];

  // Sort each section and add a blank line between sections.
  Object.keys(imports).forEach((section, index, sections) => {
    // console.log('imports in category', section, ':', imports[section]);
    const sorted = imports[section].sort((a, b) =>
      getImportPath(a).localeCompare(getImportPath(b))
    );

    if (sorted.length > 0) {
      if (sortedLines.length > 0) {
        sortedLines.push("");
      }
      sortedLines.push(...sorted);
    }
  });

  return sortedLines;
}

/**
 * Insert blank lines between local and third-party package imports.
 *
 * @param {string} code
 */
function groupImportsInFile(code) {
  const lines = code.split("\n");

  // Find groups of imports with optional blank lines before, after or in-between.
  const lineTypes = lines
    .map(line => {
      if (line.match(BLANK_LINE)) {
        return "B";
      } else if (line.match(IMPORT_LINE)) {
        return "I";
      } else {
        return "O";
      }
    })
    .join("");

  const importGroups = [];
  for (let match of lineTypes.matchAll(/B*I[BI]*/g)) {
    importGroups.push([match.index, match.index + match[0].length - 1]);
  }

  let output = [];
  let prevEnd = -1;

  for (let [start, end] of importGroups) {
    const linesBeforeGroup = lines.slice(prevEnd + 1, start);
    if (linesBeforeGroup.length > 0) {
      if (prevEnd !== -1) {
        output.push("");
      }
      output.push(...linesBeforeGroup);
      output.push("");
    }

    const importLines = lines.slice(start, end + 1);
    const sortedLines = sortAndGroupImports(importLines);
    output.push(...sortedLines);
    prevEnd = end;
  }

  // Add the non-import lines after the final import group.
  if (prevEnd !== -1) {
    output.push("");
  }
  output.push(...lines.slice(prevEnd + 1));

  return output.join("\n");
}

module.exports = { groupImportsInFile };
