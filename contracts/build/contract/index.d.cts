import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
  verify_brca1(context: __compactRuntime.CircuitContext<T>,
               genome_hash_0: bigint): __compactRuntime.CircuitResults<T, boolean>;
  verify_brca2(context: __compactRuntime.CircuitContext<T>,
               genome_hash_0: bigint): __compactRuntime.CircuitResults<T, boolean>;
  verify_cyp2d6(context: __compactRuntime.CircuitContext<T>,
                genome_hash_0: bigint): __compactRuntime.CircuitResults<T, boolean>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  verify_brca1(context: __compactRuntime.CircuitContext<T>,
               genome_hash_0: bigint): __compactRuntime.CircuitResults<T, boolean>;
  verify_brca2(context: __compactRuntime.CircuitContext<T>,
               genome_hash_0: bigint): __compactRuntime.CircuitResults<T, boolean>;
  verify_cyp2d6(context: __compactRuntime.CircuitContext<T>,
                genome_hash_0: bigint): __compactRuntime.CircuitResults<T, boolean>;
}

export type Ledger = {
  readonly verifications: bigint;
  readonly brca1_results: bigint;
  readonly brca2_results: bigint;
  readonly cyp2d6_results: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
