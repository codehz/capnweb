// Copyright (c) 2025 Cloudflare, Inc.
// Licensed under the MIT license found in the LICENSE.txt file or at:
//     https://opensource.org/license/mit

// Type tests for Cap'n Web
// 
// This file tests the TypeScript type definitions for Cap'n Web, specifically:
// 1. The RpcCompatible<T> type is exported and works correctly
// 2. The Stubify<T> type correctly handles tuple types (empty, regular, readonly, nested)
// 3. The Unstubify<T> type correctly handles tuple types (tested through RpcStub method signatures)
//
// To run these tests:
//   npm run test:types
//
// These tests use Vitest's type testing functionality (https://vitest.dev/guide/testing-types)
// and validate that the type transformations work correctly at compile time.

import { expectTypeOf } from "vitest"
import type { RpcCompatible, RpcStub } from "../src/index.js"
import type { Stub, Stubify } from "../src/types.d.ts"
import { RpcTarget } from "../src/index.js"

// Test class for Stubable types
class TestRpcTarget extends RpcTarget {
  method(): string {
    return "test"
  }
}

// ============================================================================
// Test 1: RpcCompatible export and usage
// ============================================================================

// Test that RpcCompatible allows primitive types
expectTypeOf<number>().toMatchTypeOf<RpcCompatible<number>>()
expectTypeOf<string>().toMatchTypeOf<RpcCompatible<string>>()
expectTypeOf<boolean>().toMatchTypeOf<RpcCompatible<boolean>>()
expectTypeOf<null>().toMatchTypeOf<RpcCompatible<null>>()
expectTypeOf<undefined>().toMatchTypeOf<RpcCompatible<undefined>>()

// Test that RpcCompatible allows arrays
expectTypeOf<number[]>().toMatchTypeOf<RpcCompatible<number[]>>()

// ============================================================================
// Test 2: Stubify with empty tuples
// ============================================================================

// Test empty tuple
type EmptyTuple = []
type StubifiedEmptyTuple = Stubify<EmptyTuple>
expectTypeOf<StubifiedEmptyTuple>().toEqualTypeOf<[]>()

// Test readonly empty tuple
type ReadonlyEmptyTuple = readonly []
type StubifiedReadonlyEmptyTuple = Stubify<ReadonlyEmptyTuple>
expectTypeOf<StubifiedReadonlyEmptyTuple>().toEqualTypeOf<readonly []>()

// ============================================================================
// Test 3: Stubify with regular tuples
// ============================================================================

// Test simple tuple with primitives
type SimpleTuple = [number, string, boolean]
type StubifiedSimpleTuple = Stubify<SimpleTuple>
expectTypeOf<StubifiedSimpleTuple>().toEqualTypeOf<[number, string, boolean]>()

// Test tuple with object
type TupleWithObject = [number, { foo: string }]
type StubifiedTupleWithObject = Stubify<TupleWithObject>
expectTypeOf<StubifiedTupleWithObject>().toEqualTypeOf<[number, { foo: string }]>()

// Test tuple with Stubable (should convert to Stub)
type TupleWithStubable = [number, TestRpcTarget]
type StubifiedTupleWithStubable = Stubify<TupleWithStubable>
expectTypeOf<StubifiedTupleWithStubable>().toEqualTypeOf<[number, Stub<TestRpcTarget>]>()

// Test tuple with mixed types including Stubable
type MixedTuple = [string, TestRpcTarget, number, { bar: boolean }]
type StubifiedMixedTuple = Stubify<MixedTuple>
expectTypeOf<StubifiedMixedTuple>().toEqualTypeOf<[string, Stub<TestRpcTarget>, number, { bar: boolean }]>()

// ============================================================================
// Test 4: Stubify with readonly tuples
// ============================================================================

// Test readonly tuple with primitives
type ReadonlySimpleTuple = readonly [number, string]
type StubifiedReadonlySimpleTuple = Stubify<ReadonlySimpleTuple>
expectTypeOf<StubifiedReadonlySimpleTuple>().toEqualTypeOf<readonly [number, string]>()

// Test readonly tuple with Stubable
type ReadonlyTupleWithStubable = readonly [TestRpcTarget, string]
type StubifiedReadonlyTupleWithStubable = Stubify<ReadonlyTupleWithStubable>
expectTypeOf<StubifiedReadonlyTupleWithStubable>().toEqualTypeOf<readonly [Stub<TestRpcTarget>, string]>()

// ============================================================================
// Test 5: Stubify with nested tuples
// ============================================================================

// Test nested tuple
type NestedTuple = [number, [string, boolean]]
type StubifiedNestedTuple = Stubify<NestedTuple>
expectTypeOf<StubifiedNestedTuple>().toEqualTypeOf<[number, [string, boolean]]>()

// Test deeply nested tuple with Stubable
type DeeplyNestedTuple = [TestRpcTarget, [number, [TestRpcTarget, string]]]
type StubifiedDeeplyNestedTuple = Stubify<DeeplyNestedTuple>
expectTypeOf<StubifiedDeeplyNestedTuple>().toEqualTypeOf<[Stub<TestRpcTarget>, [number, [Stub<TestRpcTarget>, string]]]>()

// Test readonly nested tuple
type ReadonlyNestedTuple = readonly [number, readonly [string, boolean]]
type StubifiedReadonlyNestedTuple = Stubify<ReadonlyNestedTuple>
expectTypeOf<StubifiedReadonlyNestedTuple>().toEqualTypeOf<readonly [number, readonly [string, boolean]]>()

// ============================================================================
// Test 6: Stubify with longer tuples (more than 2 elements)
// ============================================================================

// Test tuple with multiple elements
type LongTuple = [string, number, boolean, TestRpcTarget, { x: number }]
type StubifiedLongTuple = Stubify<LongTuple>
expectTypeOf<StubifiedLongTuple>().toEqualTypeOf<[string, number, boolean, Stub<TestRpcTarget>, { x: number }]>()

// ============================================================================
// Test 7: Stubify with Promises in tuples (should be resolved)
// ============================================================================

// Test tuple with Promise element
type TupleWithPromise = [Promise<number>, string]
type StubifiedTupleWithPromise = Stubify<TupleWithPromise>
// Promises should be resolved by Stubify
expectTypeOf<StubifiedTupleWithPromise>().toEqualTypeOf<[number, string]>()

// Test tuple with Promise of Stubable
type TupleWithPromiseStubable = [Promise<TestRpcTarget>, number]
type StubifiedTupleWithPromiseStubable = Stubify<TupleWithPromiseStubable>
expectTypeOf<StubifiedTupleWithPromiseStubable>().toEqualTypeOf<[Stub<TestRpcTarget>, number]>()

// ============================================================================
// Test 8: Arrays should not be treated as tuples
// ============================================================================

// Ensure arrays are still handled differently from tuples
type TestArray = number[]
type StubifiedArray = Stubify<TestArray>
expectTypeOf<StubifiedArray>().toEqualTypeOf<number[]>()

type ArrayWithStubable = TestRpcTarget[]
type StubifiedArrayWithStubable = Stubify<ArrayWithStubable>
expectTypeOf<StubifiedArrayWithStubable>().toEqualTypeOf<Stub<TestRpcTarget>[]>()

// ============================================================================
// Test 9: RpcStub method parameters - testing Unstubify through public API
// ============================================================================

// Testing that methods can accept tuples with Stubs or original types
// This tests the Unstubify behavior through the public RpcStub API
interface ApiWithTuples {
  // Method that takes a tuple
  processTuple(data: [string, TestRpcTarget]): string
  
  // Method that returns a tuple
  getTuple(): [number, TestRpcTarget]
  
  // Method with nested tuples
  handleNested(input: [string, [number, TestRpcTarget]]): boolean
}

type ApiStub = RpcStub<ApiWithTuples>

// Test that the stub's method parameters correctly Unstubify tuples
// The stub should accept both the original type and stubbed versions
declare const apiStub: ApiStub

// Test method parameters accept tuples - we can pass either stubs or original types
// This is testing that Unstubify works correctly for tuples in method parameters
type ProcessTupleParam = Parameters<typeof apiStub.processTuple>[0]
// Should accept [string, TestRpcTarget | Stub<TestRpcTarget>] or Promise of it
expectTypeOf<[string, TestRpcTarget]>().toMatchTypeOf<Awaited<ProcessTupleParam>>()
expectTypeOf<[string, Stub<TestRpcTarget>]>().toMatchTypeOf<Awaited<ProcessTupleParam>>()

// Test return types are properly stubified (including tuples)
type GetTupleReturn = Awaited<ReturnType<typeof apiStub.getTuple>>
// Return should have Stubified tuple: [number, Stub<TestRpcTarget>]
expectTypeOf<GetTupleReturn>().toMatchTypeOf<[number, Stub<TestRpcTarget>]>()

// Test nested tuples in parameters
type HandleNestedParam = Parameters<typeof apiStub.handleNested>[0]
// Should accept nested tuples with original or stub types
expectTypeOf<[string, [number, TestRpcTarget]]>().toMatchTypeOf<Awaited<HandleNestedParam>>()
expectTypeOf<[string, [number, Stub<TestRpcTarget>]]>().toMatchTypeOf<Awaited<HandleNestedParam>>()

// ============================================================================
// Test 10: Complex real-world scenario with batch operations
// ============================================================================

interface BatchApi {
  // Batch process that takes an array of tuples
  batchProcess(items: [string, number, TestRpcTarget][]): Promise<[boolean, string]>
  
  // Method returning multiple tuples
  getMultipleTuples(): [TestRpcTarget, TestRpcTarget, number][]
  
  // Readonly tuple parameters
  processReadonly(data: readonly [string, TestRpcTarget]): void
}

type BatchApiStub = RpcStub<BatchApi>
declare const batchStub: BatchApiStub

// Test array of tuples in parameters
type BatchProcessParam = Parameters<typeof batchStub.batchProcess>[0]
// Should accept array of tuples with either stubs or original types
expectTypeOf<[string, number, TestRpcTarget][]>().toMatchTypeOf<Awaited<BatchProcessParam>>()
expectTypeOf<[string, number, Stub<TestRpcTarget>][]>().toMatchTypeOf<Awaited<BatchProcessParam>>()

// Test return type for method returning array of tuples
type GetMultipleTuplesReturn = Awaited<ReturnType<typeof batchStub.getMultipleTuples>>
// Should return array of stubified tuples
expectTypeOf<GetMultipleTuplesReturn>().toMatchTypeOf<[Stub<TestRpcTarget>, Stub<TestRpcTarget>, number][]>()

// Test readonly tuples in parameters
type ProcessReadonlyParam = Parameters<typeof batchStub.processReadonly>[0]
expectTypeOf<readonly [string, TestRpcTarget]>().toMatchTypeOf<Awaited<ProcessReadonlyParam>>()
expectTypeOf<readonly [string, Stub<TestRpcTarget>]>().toMatchTypeOf<Awaited<ProcessReadonlyParam>>()

// ============================================================================
// Test 11: Edge cases
// ============================================================================

// Test single-element tuples
type SingleTuple = [number]
type StubifiedSingleTuple = Stubify<SingleTuple>
expectTypeOf<StubifiedSingleTuple>().toEqualTypeOf<[number]>()

type SingleTupleWithStubable = [TestRpcTarget]
type StubifiedSingleTupleWithStubable = Stubify<SingleTupleWithStubable>
expectTypeOf<StubifiedSingleTupleWithStubable>().toEqualTypeOf<[Stub<TestRpcTarget>]>()

// Test mixed readonly and mutable nested tuples
type MixedReadonlyTuple = [readonly [number, string], [boolean, TestRpcTarget]]
type StubifiedMixedReadonlyTuple = Stubify<MixedReadonlyTuple>
expectTypeOf<StubifiedMixedReadonlyTuple>().toEqualTypeOf<
  [readonly [number, string], [boolean, Stub<TestRpcTarget>]]
>()

// ============================================================================
// Test 12: Verify tuples are distinct from arrays
// ============================================================================

// This test ensures the tuple-specific handling doesn't break array handling
interface MixedApi {
  takeArray(arr: number[]): void
  takeTuple(tuple: [number, number]): void
}

type MixedApiStub = RpcStub<MixedApi>
declare const mixedStub: MixedApiStub

type TakeArrayParam = Parameters<typeof mixedStub.takeArray>[0]
type TakeTupleParam = Parameters<typeof mixedStub.takeTuple>[0]

// Arrays should remain arrays (variable length)
expectTypeOf<number[]>().toMatchTypeOf<Awaited<TakeArrayParam>>()

// Tuples should remain tuples (fixed length)
expectTypeOf<[number, number]>().toMatchTypeOf<Awaited<TakeTupleParam>>()

// Arrays and tuples should not be interchangeable
expectTypeOf<number[]>().not.toEqualTypeOf<[number, number]>()

