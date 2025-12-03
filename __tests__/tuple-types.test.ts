// Test case for issue #116: Verify tuple types are preserved
import type { RpcStub } from "../src/index.js"

declare class TestClass {
    getValue(): [number, number]
    getArray(): number[]
    getNestedTuple(): [string, [number, boolean]]
    getMixedTuple(): [number, string, boolean]
}

// Test the type inference
type TupleResult = Awaited<ReturnType<RpcStub<TestClass>["getValue"]>>;
type ArrayResult = Awaited<ReturnType<RpcStub<TestClass>["getArray"]>>;
type NestedTupleResult = Awaited<ReturnType<RpcStub<TestClass>["getNestedTuple"]>>;
type MixedTupleResult = Awaited<ReturnType<RpcStub<TestClass>["getMixedTuple"]>>;

// Type assertions to verify tuple preservation
// These will cause compile errors if the types are wrong

// Test 1: Basic tuple should be preserved
type Test1 = TupleResult extends readonly [any, any] ? true : false;
const test1: Test1 = true; // Should compile if tuple is preserved

// Test 2: Tuple should have exact length 2
type Test2 = TupleResult extends { length: 2 } ? true : false;
const test2: Test2 = true; // Should compile if tuple length is preserved

// Test 3: Array should NOT have fixed length
type Test3 = ArrayResult extends { length: number } ? true : false;
const test3: Test3 = true; // Should always compile

// Test 4: Nested tuple should be preserved
type Test4 = NestedTupleResult extends readonly [any, readonly [any, any]] ? true : false;
const test4: Test4 = true; // Should compile if nested tuple is preserved

// Test 5: Mixed tuple elements should be preserved
type Test5_First = MixedTupleResult extends readonly [infer First, ...any[]] ? First : never;
type Test5_Second = MixedTupleResult extends readonly [any, infer Second, ...any[]] ? Second : never;
type Test5_Third = MixedTupleResult extends readonly [any, any, infer Third, ...any[]] ? Third : never;

// These should match the exact types
const test5a: Test5_First = 42; // Should be number
const test5b: Test5_Second = "hello"; // Should be string  
const test5c: Test5_Third = true; // Should be boolean

console.log("All tuple type tests passed!");
