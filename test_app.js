import { passMatrix, emergencyRescues, tasteInteractions } from './src/data.js';

console.log('Testing PassTuner Data & Logic...');

// Test 1: Check passMatrix count and required fields
if (!Array.isArray(passMatrix) || passMatrix.length === 0) {
  throw new Error('passMatrix is empty or not an array');
}
console.log(`✓ passMatrix contains ${passMatrix.length} dishes.`);

passMatrix.forEach((item, index) => {
  const fields = ['id', 'category', 'dish', 'challenge', 'enemy', 'calibration', 'winningWine', 'chemistry'];
  for (const field of fields) {
    if (!item[field] || typeof item[field] !== 'string') {
      throw new Error(`Item index ${index} (${item.dish || 'unknown'}) missing field ${field}`);
    }
  }
});
console.log('✓ All dishes have complete data including Chef calibration and chemistry rationale.');

// Test 2: Check emergency rescues
if (!Array.isArray(emergencyRescues) || emergencyRescues.length < 5) {
  throw new Error('emergencyRescues is incomplete');
}
console.log(`✓ emergencyRescues contains ${emergencyRescues.length} emergency protocols.`);

// Test 3: Check taste interactions
if (!Array.isArray(tasteInteractions) || tasteInteractions.length < 5) {
  throw new Error('tasteInteractions is incomplete');
}
console.log(`✓ tasteInteractions contains ${tasteInteractions.length} biochemical taste profiles.`);

// Test 4: Check categories
const categories = new Set(passMatrix.map(p => p.category));
console.log(`✓ Verified categories: ${Array.from(categories).join(', ')}`);

console.log('\nAll PassTuner automated checks passed successfully!');
