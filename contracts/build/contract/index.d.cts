import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
}

export type PureCircuits = {
  verify_brca1(genome_data_0: bigint, mutation_threshold_0: bigint): bigint;
  verify_brca2(genome_data_0: bigint, mutation_threshold_0: bigint): bigint;
  verify_cyp2d6(genome_data_0: bigint, metabolizer_type_0: bigint): bigint;
}

export type Circuits<T> = {
  verify_brca1(context: __compactRuntime.CircuitContext<T>,
               genome_data_0: bigint,
               mutation_threshold_0: bigint): __compactRuntime.CircuitResults<T, bigint>;
  verify_brca2(context: __compactRuntime.CircuitContext<T>,
               genome_data_0: bigint,
               mutation_threshold_0: bigint): __compactRuntime.CircuitResults<T, bigint>;
  verify_cyp2d6(context: __compactRuntime.CircuitContext<T>,
                genome_data_0: bigint,
                metabolizer_type_0: bigint): __compactRuntime.CircuitResults<T, bigint>;
}

export type Ledger = {
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
