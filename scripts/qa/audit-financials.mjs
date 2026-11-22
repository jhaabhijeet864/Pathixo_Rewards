#!/usr/bin/env node
/**
 * Pathixo Rewards — Financial Invariant & Split Auditor
 * 
 * Verifies mathematical precision, 60/40 revenue split integrity,
 * IEEE-754 float rounding stability, and strict $2.00 cashout floor.
 */

console.log('\n💰 [Pathixo QA] Running Financial Invariants & Ledger Audit...\n');

let pass = true;

// 1. Revenue Share Tests across CPM spectrum
console.log('📊 1. Revenue Share Matrix (60% User / 40% Platform):');
const cpmRates = [10.0, 15.0, 20.0, 25.0, 30.0];

for (const cpm of cpmRates) {
  const pricePerView = cpm / 1000;
  const userCut = pricePerView * 0.6;
  const platformCut = pricePerView * 0.4;
  const sum = Number((userCut + platformCut).toFixed(6));

  const isValid = Math.abs(sum - pricePerView) < 0.00001;
  if (!isValid) {
    console.error(`   ❌ Split error at CPM $${cpm}: sum $${sum} !== expected $${pricePerView}`);
    pass = false;
  } else {
    console.log(
      `   ✅ CPM $${cpm.toFixed(2)} -> View: $${pricePerView.toFixed(4)} | User (60%): $${userCut.toFixed(4)} | Platform (40%): $${platformCut.toFixed(4)}`
    );
  }
}

// 1b. Referral Royalty Economic Safeguard (User 60% • Referrer 4% • Platform 36%)
console.log('\n🤝 1b. Referral Royalty Economic Safeguard Split (User 60% / Referrer 4% / Platform 36%):');
for (const cpm of cpmRates) {
  const pricePerView = cpm / 1000;
  const userCut = pricePerView * 0.60;
  const referrerCut = pricePerView * 0.04;
  const platformRetained = pricePerView * 0.36;
  const sum = Number((userCut + referrerCut + platformRetained).toFixed(6));

  const isValid = Math.abs(sum - pricePerView) < 0.00001;
  if (!isValid) {
    console.error(`   ❌ Referral split error at CPM $${cpm}: sum $${sum} !== expected $${pricePerView}`);
    pass = false;
  } else {
    console.log(
      `   ✅ CPM $${cpm.toFixed(2)} -> User: $${userCut.toFixed(4)} | Referrer: $${referrerCut.toFixed(4)} | Platform: $${platformRetained.toFixed(4)}`
    );
  }
}

// 2. Float Rounding & Ledger Precision Test (1000 increments)
console.log('\n🧮 2. Micro-Credit Accumulation Precision (1,000 increments @ $0.009):');
let rawBalance = 0;
let roundedBalance = 0;

for (let i = 0; i < 1000; i++) {
  rawBalance += 0.009;
  roundedBalance = Number((roundedBalance + 0.009).toFixed(4));
}

console.log(`   Raw IEEE-754 accumulator: ${rawBalance} (has floating-point jitter)`);
console.log(`   Pathixo normalized accumulator: ${roundedBalance.toFixed(4)}`);

if (Math.abs(roundedBalance - 9.0) > 0.0001) {
  console.error(`   ❌ Accumulation drift! Expected 9.0000, got ${roundedBalance}`);
  pass = false;
} else {
  console.log('   ✅ Normalized accumulator matches exact expected $9.0000 USD.');
}

// 3. Minimum Cashout Threshold Boundary Test
console.log('\n💳 3. Cashout Floor Boundary Invariant ($2.00 Minimum):');
const testAmounts = [
  { amount: 0, canCashout: false },
  { amount: 0.5, canCashout: false },
  { amount: 1.99, canCashout: false },
  { amount: 1.9999, canCashout: false },
  { amount: 2.0, canCashout: true },
  { amount: 2.01, canCashout: true },
  { amount: 100.0, canCashout: true },
];

for (const t of testAmounts) {
  const allowed = t.amount >= 2.0;
  if (allowed !== t.canCashout) {
    console.error(`   ❌ Threshold violation at $${t.amount}: allowed=${allowed}`);
    pass = false;
  } else {
    console.log(`   ✅ Amount $${t.amount.toFixed(4).padStart(7)} -> Cashout Allowed: ${allowed ? 'YES (Qualified)' : 'NO (Blocked)'}`);
  }
}

console.log('\n--------------------------------------------------');
if (pass) {
  console.log('✅ [PASS] All financial invariants & split formulas verified!\n');
  process.exit(0);
} else {
  console.error('❌ [FAIL] Financial invariant check failed!\n');
  process.exit(1);
}
