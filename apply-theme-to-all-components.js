#!/usr/bin/env node

/**
 * Automated Theme Migration Script
 * This script applies the enhanced theme system to all components automatically
 */

const fs = require('fs');
const path = require('path');

// Common hardcoded color patterns and their theme replacements
const colorMappings = {
  // Background colors
  'bg-white': '${bg.card}',
  'bg-gray-50': '${bg.secondary}',
  'bg-gray-100': '${bg.tertiary}',
  'bg-gray-200': '${bg.tertiary}',
  'bg-gray-800': '${bg.card}',
  'bg-gray-900': '${bg.primary}',
  
  // Text colors
  'text-gray-900': '${text.primary}',
  'text-gray-800': '${text.primary}',
  'text-gray-700': '${text.secondary}',
  'text-gray-600': '${text.secondary}',
  'text-gray-500': '${text.tertiary}',
  'text-gray-400': '${text.tertiary}',
  
  // Border colors
  'border-gray-200': '${border.primary}',
  'border-gray-300': '${border.primary}',
  'border-gray-100': '${border.secondary}',
  
  // Common patterns
  'bg-white border border-gray-200 rounded-lg': '${styles.card()}',
  'bg-white border border-gray-200 rounded-xl': '${styles.card("elevated")}',
  'bg-white border-2 border-teal-200 rounded-lg': '${styles.card("highlighted")}',
  'bg-green-600 text-white': '${styles.button("success")}',
  'bg-blue-600 text-white': '${styles.button("primary")}',
  'border border-gray-300 text-gray-700': '${styles.button("outline")}',
};

// Files to process (add more as needed)
const filesToProcess = [
  'src/components/FeaturePreviews.js',
  'src/components/UnifiedDashboard.js',
  'src/TaxBreakdown.js',
  'src/MonthComparison.js',
  'src/RiskProfiler.js',
  'src/FirebaseTest.js',
  'src/App_Enhanced.js',
  'src/components/TaxFilingDashboard.js',
  'src/components/TaxFormDiscoveryNew.js',
  'src/components/TaxLoginPage.js',
  'src/components/ComprehensiveTaxFiling.js',
  'src/components/TaxDocumentManager.js',
  'src/components/TaxGlossaryHelp.js',
  'src/components/TaxFilingWizard.js',
  'src/components/TaxFormDiscovery.js',
  'src/components/TaxFilingForm.js'
];

// Theme import to add to files
const themeImport = `import { useTheme, useThemeStyles, ThemedButton, ThemedCard, ThemedAlert, ThemedStatus } from '../contexts/ThemeContext';\n`;

function addThemeImportToFile(filePath, content) {
  // Check if theme import already exists
  if (content.includes('useTheme')) {
    return content;
  }
  
  // Find the last import statement
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
  if (importLines.length === 0) {
    return content;
  }
  
  // Find position to insert theme import
  const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
  const insertPosition = content.indexOf('\n', lastImportIndex) + 1;
  
  return content.slice(0, insertPosition) + themeImport + content.slice(insertPosition);
}

function addThemeHookToComponent(content) {
  // Check if useTheme hook already exists
  if (content.includes('useTheme()')) {
    return content;
  }
  
  // Find component function declaration
  const componentMatch = content.match(/(export\s+(?:default\s+)?function\s+\w+[^{]*{|\w+\s*=.*?=>\s*{)/);
  if (!componentMatch) {
    return content;
  }
  
  const insertPosition = content.indexOf('{', componentMatch.index) + 1;
  const themeHook = '\n  const { bg, text, border, button, accent, components } = useTheme();\n  const styles = useThemeStyles();\n';
  
  return content.slice(0, insertPosition) + themeHook + content.slice(insertPosition);
}

function replaceHardcodedColors(content) {
  let result = content;
  
  // Replace individual color classes
  for (const [hardcoded, themed] of Object.entries(colorMappings)) {
    const regex = new RegExp(`\\b${hardcoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    result = result.replace(regex, themed);
  }
  
  return result;
}

function processFile(filePath) {
  const fullPath = path.join(__dirname, 'frontend', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  console.log(`🔧 Processing: ${filePath}`);
  
  // Add theme import
  content = addThemeImportToFile(filePath, content);
  
  // Add theme hook to component
  content = addThemeHookToComponent(content);
  
  // Replace hardcoded colors with theme variables
  content = replaceHardcodedColors(content);
  
  // Check if any changes were made
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

function main() {
  console.log('🎨 Starting automated theme migration...\n');
  
  filesToProcess.forEach(processFile);
  
  console.log('\n✨ Theme migration completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Check for any syntax errors in the modified files');
  console.log('2. Test theme switching functionality');
  console.log('3. Manual review for complex components');
  console.log('4. Run npm start to verify everything works');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, colorMappings };
