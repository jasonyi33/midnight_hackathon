'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.8.1';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('-')[0].split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('-')[0].split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeField();

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      verify_brca1(context, ...args_1) {
        return { result: pureCircuits.verify_brca1(...args_1), context };
      },
      verify_brca2(context, ...args_1) {
        return { result: pureCircuits.verify_brca2(...args_1), context };
      },
      verify_cyp2d6(context, ...args_1) {
        return { result: pureCircuits.verify_cyp2d6(...args_1), context };
      }
    };
    this.impureCircuits = {};
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    state_0.data = stateValue_0;
    const context = {
      originalState: state_0,
      currentPrivateState: constructorContext_0.initialPrivateState,
      currentZswapLocalState: constructorContext_0.initialZswapLocalState,
      transactionContext: new __compactRuntime.QueryContext(state_0.data, __compactRuntime.dummyContractAddress())
    };
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    state_0.data = context.transactionContext.state;
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _verify_brca1_0(genome_data_0, mutation_threshold_0) {
    return __compactRuntime.addField(genome_data_0, mutation_threshold_0);
  }
  _verify_brca2_0(genome_data_0, mutation_threshold_0) {
    return __compactRuntime.addField(genome_data_0, mutation_threshold_0);
  }
  _verify_cyp2d6_0(genome_data_0, metabolizer_type_0) {
    return __compactRuntime.addField(genome_data_0, metabolizer_type_0);
  }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.transactionContext.query(prog, __compactRuntime.CostModel.dummyCostModel());
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.transactionContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
const pureCircuits = {
  verify_brca1: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`verify_brca1: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const genome_data_0 = args_0[0];
    const mutation_threshold_0 = args_0[1];
    if (!(typeof(genome_data_0) === 'bigint' && genome_data_0 >= 0 && genome_data_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.type_error('verify_brca1',
                                  'argument 1',
                                  'genomic_verifier.compact line 4 char 1',
                                  'Field',
                                  genome_data_0)
    }
    if (!(typeof(mutation_threshold_0) === 'bigint' && mutation_threshold_0 >= 0 && mutation_threshold_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.type_error('verify_brca1',
                                  'argument 2',
                                  'genomic_verifier.compact line 4 char 1',
                                  'Field',
                                  mutation_threshold_0)
    }
    return _dummyContract._verify_brca1_0(genome_data_0, mutation_threshold_0);
  },
  verify_brca2: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`verify_brca2: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const genome_data_0 = args_0[0];
    const mutation_threshold_0 = args_0[1];
    if (!(typeof(genome_data_0) === 'bigint' && genome_data_0 >= 0 && genome_data_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.type_error('verify_brca2',
                                  'argument 1',
                                  'genomic_verifier.compact line 16 char 1',
                                  'Field',
                                  genome_data_0)
    }
    if (!(typeof(mutation_threshold_0) === 'bigint' && mutation_threshold_0 >= 0 && mutation_threshold_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.type_error('verify_brca2',
                                  'argument 2',
                                  'genomic_verifier.compact line 16 char 1',
                                  'Field',
                                  mutation_threshold_0)
    }
    return _dummyContract._verify_brca2_0(genome_data_0, mutation_threshold_0);
  },
  verify_cyp2d6: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`verify_cyp2d6: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const genome_data_0 = args_0[0];
    const metabolizer_type_0 = args_0[1];
    if (!(typeof(genome_data_0) === 'bigint' && genome_data_0 >= 0 && genome_data_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.type_error('verify_cyp2d6',
                                  'argument 1',
                                  'genomic_verifier.compact line 27 char 1',
                                  'Field',
                                  genome_data_0)
    }
    if (!(typeof(metabolizer_type_0) === 'bigint' && metabolizer_type_0 >= 0 && metabolizer_type_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.type_error('verify_cyp2d6',
                                  'argument 2',
                                  'genomic_verifier.compact line 27 char 1',
                                  'Field',
                                  metabolizer_type_0)
    }
    return _dummyContract._verify_cyp2d6_0(genome_data_0, metabolizer_type_0);
  }
};
const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
exports.contractReferenceLocations = contractReferenceLocations;
//# sourceMappingURL=index.cjs.map
