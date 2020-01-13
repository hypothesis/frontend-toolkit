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

  // Sort and sub-group each group of imports.
  let output = [];
  let prevGroupEndLine = null;

  for (let [start, end] of importGroups) {
    if (prevGroupEndLine !== null) {
      // Add the non-import lines between the two import groups.
      output.push("");
      output.push(...lines.slice(prevGroupEndLine + 1, start));
      output.push("");
    }
    const importLines = lines.slice(start, end + 1);
    const sortedLines = sortAndGroupImports(importLines);
    output.push(...sortedLines);
    prevGroupEndLine = end;
  }

  // Add the non-import lines after the final import group.
  if (prevGroupEndLine !== null) {
    output.push("");
  } else {
    prevGroupEndLine = -1;
  }
  output.push(...lines.slice(prevGroupEndLine + 1));

  return output.join("\n");
}

module.exports = { groupImportsInFile };
