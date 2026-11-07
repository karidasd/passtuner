import { 
  passMatrix, 
  emergencyRescues, 
  tasteInteractions, 
  greekVarieties, 
  quizQuestions, 
  calculatorProfiles 
} from './src/data.js';

console.log('Testing PassTuner Comprehensive Data & Engine Logic...');

// Test 1: Pass Matrix
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

// Test 2: Emergency Rescues
if (!Array.isArray(emergencyRescues) || emergencyRescues.length < 5) {
  throw new Error('emergencyRescues is incomplete');
}
console.log(`✓ emergencyRescues contains ${emergencyRescues.length} emergency protocols.`);

// Test 3: Taste Interactions
if (!Array.isArray(tasteInteractions) || tasteInteractions.length < 5) {
  throw new Error('tasteInteractions is incomplete');
}
console.log(`✓ tasteInteractions contains ${tasteInteractions.length} biochemical taste profiles.`);

// Test 4: Grape Varieties Atlas (Greek & International)
if (!Array.isArray(greekVarieties) || greekVarieties.length < 16) {
  throw new Error(`wineVarieties contains only ${greekVarieties?.length || 0}, expected at least 16`);
}
const greekCount = greekVarieties.filter(v => v.origin === 'greek').length;
const intlCount = greekVarieties.filter(v => v.origin === 'international').length;
if (greekCount < 8 || intlCount < 8) {
  throw new Error(`Expected at least 8 Greek and 8 International varieties. Got ${greekCount} Greek and ${intlCount} International.`);
}
greekVarieties.forEach(v => {
  if (!v.id || !v.name || !v.region || !v.type || !v.bestPairings || !v.worstPairings || !v.origin) {
    throw new Error(`Wine variety ${v.name || 'unknown'} has missing properties`);
  }
  if (typeof v.acidity !== 'number' || typeof v.tannins !== 'number' || typeof v.body !== 'number') {
    throw new Error(`Wine variety ${v.name} has invalid sensory scores`);
  }
});
console.log(`✓ wineVarieties contains ${greekVarieties.length} flagship profiles (${greekCount} Greek, ${intlCount} International).`);

// Test 5: Sommelier Certification Quiz
if (!Array.isArray(quizQuestions) || quizQuestions.length < 50) {
  throw new Error(`quizQuestions is incomplete: expected at least 50 questions, found ${quizQuestions?.length}`);
}
quizQuestions.forEach((q, idx) => {
  if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
    throw new Error(`Quiz question ${idx + 1} has invalid options format`);
  }
  if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
    throw new Error(`Quiz question ${idx + 1} has invalid correctIndex`);
  }
  if (!q.explanation) {
    throw new Error(`Quiz question ${idx + 1} missing scientific explanation`);
  }
});
console.log(`✓ quizQuestions contains ${quizQuestions.length} multiple-choice exam questions.`);

// Test 6: Pairing Calculator Engine
if (!calculatorProfiles.proteins || !calculatorProfiles.techniques || !calculatorProfiles.sauces) {
  throw new Error('calculatorProfiles missing profile maps');
}
const pCount = Object.keys(calculatorProfiles.proteins).length;
const tCount = Object.keys(calculatorProfiles.techniques).length;
const sCount = Object.keys(calculatorProfiles.sauces).length;
console.log(`✓ calculatorProfiles loaded with ${pCount} proteins, ${tCount} techniques, and ${sCount} sauces.`);

console.log('\n🌟 ALL 6 PASSTUNER MODULE CHECKS PASSED WITH 100% SUCCESS!');
