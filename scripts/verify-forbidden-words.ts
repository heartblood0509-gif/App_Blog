#!/usr/bin/env node
/**
 * forbidden-words 필터 수동 검증 스크립트.
 *
 * 실행: npx tsx scripts/verify-forbidden-words.ts
 *
 * 테스트 프레임워크 없이 node:assert만 사용.
 */

import assert from "node:assert/strict";
import { applyForbiddenWordFilter } from "@/lib/forbidden-words";

let passed = 0;
let failed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`✗ ${name}`);
    console.error(`  ${msg}`);
    failed++;
  }
}

// tier1 auto-replace
check("tier1: '약 5만원' → '대략 5만원'", () => {
  const { text, replaced } = applyForbiddenWordFilter("이 제품은 약 5만원입니다.");
  assert.equal(text, "이 제품은 대략 5만원입니다.");
  assert.equal(replaced.length, 1);
  assert.equal(replaced[0].to, "대략");
});

check("tier1: '총 3명' → '전체 3명'", () => {
  const { text } = applyForbiddenWordFilter("총 3명의 고객이 방문했다.");
  assert.equal(text, "전체 3명의 고객이 방문했다.");
});

check("tier1: '총 금액' → '전체 금액'", () => {
  const { text } = applyForbiddenWordFilter("총 금액은 나중에 알려드립니다.");
  assert.equal(text, "전체 금액은 나중에 알려드립니다.");
});

check("tier1: '폭발적' → '대대적'", () => {
  const { text } = applyForbiddenWordFilter("폭발적인 반응이 있었다.");
  assert.equal(text, "대대적인 반응이 있었다.");
});

check("tier1: '대박 할인' → '엄청난 할인'", () => {
  const { text } = applyForbiddenWordFilter("오늘 대박 할인 행사!");
  assert.equal(text, "오늘 엄청난 할인 행사!");
});

// 단어 경계 오탐 방지
check("word boundary: '총무팀' 건드리지 않음", () => {
  const { text, replaced } = applyForbiddenWordFilter("총무팀에 문의하세요.");
  assert.equal(text, "총무팀에 문의하세요.");
  assert.equal(replaced.length, 0);
});

check("word boundary: '약국' 건드리지 않음", () => {
  const { text } = applyForbiddenWordFilter("약국에서 샀어요.");
  assert.equal(text, "약국에서 샀어요.");
});

check("word boundary: '약속'·'약간' 보호", () => {
  const { text } = applyForbiddenWordFilter("약속이 있어서 약간 늦어요.");
  assert.equal(text, "약속이 있어서 약간 늦어요.");
});

check("word boundary: '총리' 건드리지 않음", () => {
  const { text } = applyForbiddenWordFilter("국무총리가 발표했다.");
  assert.equal(text, "국무총리가 발표했다.");
});

// tier1 flag (auto-replace 안됨, 경고만)
check("tier1 flag: '폭발' 단독은 경고만", () => {
  const { text, warnings } = applyForbiddenWordFilter("인기 폭발이었다.");
  assert.equal(text, "인기 폭발이었다."); // 변화 없음
  assert.ok(warnings.some((w) => w.word === "폭발"));
});

check("tier1 flag: '대박이다' 서술형은 경고만", () => {
  const { text, warnings } = applyForbiddenWordFilter("이거 진짜 대박이다.");
  assert.equal(text, "이거 진짜 대박이다.");
  assert.ok(warnings.some((w) => w.word === "대박"));
});

check("tier1 flag: '중독' 경고", () => {
  const { warnings } = applyForbiddenWordFilter("맛에 중독될 정도예요.");
  assert.ok(warnings.some((w) => w.word === "중독"));
});

// tier2 medical (flag only)
check("tier2 medical: '치료 후기' 변화 없음 + 경고", () => {
  const { text, replaced, warnings } = applyForbiddenWordFilter("피부과 치료 후기입니다.");
  assert.equal(text, "피부과 치료 후기입니다."); // 의미 보존
  assert.equal(replaced.length, 0);
  const w = warnings.find((w) => w.word === "치료");
  assert.ok(w);
  assert.equal(w.tier, 2);
});

check("tier2 medical: '완치·처방·부작용' 모두 경고", () => {
  const { warnings } = applyForbiddenWordFilter("완치된 뒤에 처방받은 약의 부작용은 없었다.");
  const words = warnings.map((w) => w.word);
  assert.ok(words.includes("완치"));
  assert.ok(words.includes("처방"));
  assert.ok(words.includes("부작용"));
});

// tier3 critical
check("tier3: '무료 체험' 경고", () => {
  const { warnings } = applyForbiddenWordFilter("무료 체험 이벤트 진행 중.");
  const w = warnings.find((w) => w.word === "무료");
  assert.ok(w);
  assert.equal(w.tier, 3);
});

check("tier3: '100%' 경고", () => {
  const { warnings } = applyForbiddenWordFilter("100% 만족 보장.");
  assert.ok(warnings.some((w) => /100\s*%/.test(w.word)));
});

check("tier3: '최저가' 경고", () => {
  const { warnings } = applyForbiddenWordFilter("업계 최저가 도전!");
  assert.ok(warnings.some((w) => w.word === "최저가"));
});

// 복합 시나리오
check("복합: 자동치환 + 경고 동시 발생", () => {
  const input = "총 3종의 제품을 약 5만원에 무료로 치료받은 경험담.";
  const { text, replaced, warnings } = applyForbiddenWordFilter(input);
  // 총 3종 → 전체 3종, 약 5만원 → 대략 5만원
  assert.ok(text.includes("전체 3종"));
  assert.ok(text.includes("대략 5만원"));
  // 무료, 치료는 경고
  assert.ok(warnings.some((w) => w.word === "무료"));
  assert.ok(warnings.some((w) => w.word === "치료"));
  assert.ok(replaced.length >= 2);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
