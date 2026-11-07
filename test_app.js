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

// Test 4: Greek Indigenous Varieties
if (!Array.isArray(greekVarieties) || greekVarieties.length < 8) {
  throw new Error('greekVarieties is incomplete');
}
greekVarieties.forEach(v => {
  if (!v.id || !v.name || !v.region || !v.type || !v.bestPairings || !v.worstPairings) {
    throw new Error(`Greek variety ${v.name || 'unknown'} has missing properties`);
  }
  if (typeof v.acidity !== 'number' || typeof v.tannins !== 'number' || typeof v.body !== 'number') {
    throw new Error(`Greek variety ${v.name} has invalid sensory scores`);
  }
});
console.log(`✓ greekVarieties contains ${greekVarieties.length} flagship Greek grape profiles.`);

// Test 5: Sommelier Certification Quiz
if (!Array.isArray(quizQuestions) || quizQuestions.length < 10) {
  throw new Error('quizQuestions is incomplete');
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
