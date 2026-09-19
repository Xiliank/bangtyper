/**
 * Quick accuracy model sanity check (no test runner required).
 * Run: node --experimental-strip-types scripts/check-accuracy.mjs
 * or plain logic below.
 */

function accuracy(correct, errors) {
  const t = correct + errors;
  return t <= 0 ? 100 : (correct / t) * 100;
}

let correct = 0;
let errors = 0;

// type 3 correct
correct += 3;
// mistype
errors += 1;
const afterError = accuracy(correct, errors);
// backspace (must NOT reduce errors)
const afterBackspace = accuracy(correct, errors);
// retype correct
correct += 1;
const afterFix = accuracy(correct, errors);

const ok =
  afterError < 100 &&
  afterBackspace === afterError &&
  afterFix > afterBackspace &&
  afterFix < 100 &&
  errors === 1;

console.log({ afterError, afterBackspace, afterFix, errors, ok });
if (!ok) process.exit(1);
console.log("accuracy model OK");
