# building blocks

this document consolidates the essential concepts behind midnight transactions, the compact language, privacy mechanics, and supporting libraries. everything is fully lowercase and organized for quick reference.

## table of contents

- [overview](#overview)
- [midnight transactions](#midnight-transactions)
  - [transaction structure](#transaction-structure)
  - [contract deployments](#contract-deployments)
  - [contract calls](#contract-calls)
  - [transaction merging](#transaction-merging)
  - [transaction integrity](#transaction-integrity)
- [compact language fundamentals](#compact-language-fundamentals)
  - [language layout](#language-layout)
  - [type system](#type-system)
  - [circuit definitions](#circuit-definitions)
  - [statements](#statements)
  - [expressions](#expressions)
  - [modules and imports](#modules-and-imports)
- [privacy and disclosure guidelines](#privacy-and-disclosure-guidelines)
  - [witness protection model](#witness-protection-model)
  - [keeping data private](#keeping-data-private)
  - [commitment and nullifier pattern](#commitment-and-nullifier-pattern)
- [building contracts in compact](#building-contracts-in-compact)
  - [contract template](#contract-template)
  - [commitment helpers](#commitment-helpers)
- [ledger data types](#ledger-data-types)
  - [kernel](#kernel)
  - [cell](#cell)
  - [counter](#counter)
  - [set](#set)
  - [map](#map)
  - [list](#list)
  - [merkle structures](#merkle-structures)
- [opaque value handling](#opaque-value-handling)
- [compact standard library reference](#compact-standard-library-reference)
  - [core data structures](#core-data-structures)
  - [cryptographic primitives](#cryptographic-primitives)
  - [merkle helpers](#merkle-helpers)
  - [token utilities](#token-utilities)
  - [zswap utilities](#zswap-utilities)
  - [miscellaneous utilities](#miscellaneous-utilities)

---

## overview

midnight combines traditional ledger concepts with zero-knowledge systems and a custom language called compact. transactions are composed of both guaranteed and fallible segments, and contract execution links public ledger data with confidential proofs.

---

## midnight transactions

### transaction structure

midnight transactions contain three major parts:

- **guaranteed zswap offer** — always executes.
- **optional fallible zswap offer** — may fail without invalidating the whole transaction.
- **optional contract calls segment** — may include contract deployments or invocations and carries:
  - a sequence of contract calls or deployments.
  - a cryptographic binding commitment.
  - binding randomness for integrity guarantees.

### contract deployments

- deployment creates a new contract if it does not already exist; otherwise the transaction fails.
- the deployment sequence runs during the fallible execution step.
- each deploy part bundles contract state and nonce values.
- contract addresses are derived by hashing their deploy part, ensuring deterministic location.

### contract calls

- contract calls target a specific address and entry point key.
- entry points map to verifier keys that validate proofs for the call.
- each call provides:
  - guaranteed and fallible transcripts describing visible outcomes.
  - a communication commitment to support upcoming cross-contract messaging.
  - a zero-knowledge proof linking transcripts with the rest of the transaction.

> note: cross-contract interaction remains under active development.

### transaction merging

- zswap enables atomic swaps through transaction merging.
- contract call sections currently cannot be merged.
- two transactions merge successfully if at least one has no contract call segment.
- merged transactions form a composite with combined guaranteed effects.

### transaction integrity

midnight inherits integrity guarantees from zswap using pedersen commitments, which work homomorphically:

1. each input and output is committed individually.
2. commitments sum homomorphically before checking integrity.
3. only the creator of a component knows the associated randomness, preventing tampering.
4. the contract call segment contributes to the global commitment without carrying a value vector.
5. fiat-shamir transformed schnorr proofs ensure knowledge of the commitment generators.

---

## compact language fundamentals

### language layout

compact is strongly and statically typed, designed for contracts that span three layers:

1. replicated ledger components.
2. zero-knowledge circuit components proving correctness.
3. local off-chain components implemented in typescript.

contracts may include:

- type declarations.
- public ledger data declarations.
- witness functions fulfilled in typescript.
- circuit definitions that execute contract logic.

### type system

#### primitive types

- `boolean`
- `uint<m..n>` — bounded unsigned integers between zero and `n`.
- `uint<n>` — unsigned integers with up to `n` bits.
- `field` — elements of the proving system field.
- `[t, ...]` — tuple values.
- `vector<n, t>` — tuples with `n` entries of `t`.
- `bytes<n>` — fixed-length byte arrays.
- `opaque<s>` — tagged opaque payloads, e.g., `"string"`, `"uint8array"`.

#### user-defined types

structures:

```compact
struct thing {
    triple: vector<3, field>,
    flag: boolean,
}

struct number_and<t> {
    num: uint<32>;
    item: t
}
```

enumerations:

```compact
enum fruit { apple, pear, plum }
```

#### subtyping rules

- any type is a subtype of itself.
- `uint<0..n>` <: `uint<0..m>` when `n <= m`.
- `uint<0..n>` <: `field` for all `n`.
- tuples subtype element-wise when lengths match.

### circuit definitions

circuits compile directly to zero-knowledge circuits.

```compact
circuit c(a: a, b: b): r {
    ...
}

// generic circuit
circuit id<t>(value: t): t {
    return value;
}
```

pure circuits avoid ledger access; impure circuits may interact with ledger state or witnesses.

```compact
pure circuit c(a: field): field {
    ...
}
```

### statements

- `for` loops iterate over vectors or ranges.
- `if` statements support optional `else` branches.
- `return` works with or without an expression.
- `assert(expr, "message")` enforces constraints.
- `const` bindings optionally include type annotations.

### expressions

- literals: boolean, numeric, string, padded string via `pad(n, s)`.
- structure creation supports positional or named syntax and spread operations.
- tuples use bracket notation.
- circuit and witness calls appear like function invocations, supporting generics and anonymous circuits.
- arithmetic (`+`, `-`, `*`), comparisons, logical operators, ternary conditionals, casts, and accessors (`tuple[i]`, `struct.field`) are available.

### modules and imports

modules group related code:

```compact
module mod1 {
    export { g };
    export struct s { x: uint<16>, y: boolean }
    circuit f(s: s): boolean {
        return s.y;
    }
    circuit g(s: s): uint<16> {
        return f(s) ? s.x : 0;
    }
}
```

imports allow optional prefixes, generics, and file inclusion:

```compact
import runner;
import runner prefix someprefix_;
import identity<field>;
import compactstandardlibrary;
include "path/to/file";
```

---

## privacy and disclosure guidelines

### witness protection model

compact enforces privacy by requiring explicit disclosure via `disclose()` whenever witness-derived data may become public.

#### disclosure requirements

- storing witness data in public ledger fields.
- returning witness-derived values from exported circuits.
- passing witness data between contracts.

attempting these actions without `disclose()` yields compiler errors showing the data flow from witness to disclosure point.

#### recommended placement

- place `disclose()` as close as possible to the actual disclosure site.
- for structured values, wrap only the fields containing witness data.
- if a witness always returns public information, apply `disclose()` directly to the call.

#### indirect disclosure tracking

the compiler uses abstract interpretation to trace witness data through bindings, circuit calls, and expressions, preserving privacy even across complex flows.

### keeping data private

1. **hashes and commitments** — use `persistenthash` or `persistentcommit` with randomness to prevent guessing and correlation.
2. **authenticated hashes** — emulate signatures by hashing secret keys with domain separation.
3. **merkle trees** — store commitments privately while enabling membership proofs without revealing specific entries.
4. **randomness discipline** — prefer fresh randomness per commitment; if reusing, ensure uniqueness by including counters or domain-separated inputs.

#### merkle tree pattern

```compact
import compactstandardlibrary;

export ledger items: merkletree<10, field>;
witness find_item(item: field): merkletreepath<10, field>;

export circuit insert(item: field): [] {
    items.insert(item);
}

export circuit check(item: field): [] {
    const path = find_item(item);
    assert(items.checkroot(merkletreepathroot<10, field>(path.value)), "path must be valid");
}
```

### commitment and nullifier pattern

this pattern delivers single-use anonymous credentials using a merkletree and set pair.

```compact
import compactstandardlibrary;

witness find_auth_path(pk: bytes<32>): merkletreepath<10, bytes<32>>;
witness secret_key(): bytes<32>;

export ledger authorized_commitments: historicmerkletree<10, bytes<32>>;
export ledger authorized_nullifiers: set<bytes<32>>;
export ledger restricted_counter: counter;

export circuit add_authority(pk: bytes<32>): [] {
    authorized_commitments.insert(pk);
}

export circuit increment(): [] {
    const sk = secret_key();
    const auth_path = find_auth_path(public_key(sk));
    assert(authorized_commitments.checkroot(
        merkletreepathroot<10, bytes<32>>(auth_path)
    ), "not authorized");

    const nul = nullifier(sk);
    assert(!authorized_nullifiers.member(nul), "already incremented");
    authorized_nullifiers.insert(disclose(nul));

    restricted_counter.increment(1);
}

circuit public_key(sk: bytes<32>): bytes<32> {
    return persistenthash<vector<2, bytes<32>>>([
        pad(32, "commitment-domain"),
        sk
    ]);
}

circuit nullifier(sk: bytes<32>): bytes<32> {
    return persistenthash<vector<2, bytes<32>>>([
        pad(32, "nullifier-domain"),
        sk
    ]);
}
```

key requirements:

- use domain separation to distinguish commitments and nullifiers.
- ensure nullifier creation requires secret knowledge.
- enforce uniqueness so the same secret yields distinct commitment/nullifier pairs.

---

## building contracts in compact

### contract template

```compact
pragma language_version 0.16;
import compactstandardlibrary;

enum state {
    unset,
    set
}

struct user_data {
    public_key: bytes<32>;
    balance: uint<64>;
    is_active: boolean;
}

export ledger authority: bytes<32>;
export ledger value: uint<64>;
export ledger state: state;
export ledger round: counter;

constructor(sk: bytes<32>, v: uint<64>) {
    authority = disclose(public_key(round, sk));
    value = disclose(v);
    state = state.set;
}

export circuit get(): uint<64> {
    assert(state == state.set, "attempted to get uninitialized value");
    return value;
}

witness secret_key(): bytes<32>;

export circuit set(v: uint<64>): [] {
    assert(state == state.unset, "attempted to set initialized value");
    const sk = secret_key();
    const pk = public_key(round, sk);
    authority = disclose(pk);
    value = disclose(v);
    state = state.set;
}

export circuit clear(): [] {
    assert(state == state.set, "attempted to clear uninitialized value");
    const sk = secret_key();
    const pk = public_key(round, sk);
    assert(authority == pk, "attempted to clear without authorization");
    state = state.unset;
    round.increment(1);
}

circuit public_key(round: field, sk: bytes<32>): bytes<32> {
    return persistenthash<vector<3, bytes<32>>>(
        [pad(32, "midnight:examples:lock:pk"), round as bytes<32>, sk]
    );
}
```

### commitment helpers

compact provides commitment primitives for transient and persistent contexts:

```compact
// transient (temporary) operations
circuit transient_hash<t>(value: t): field;
circuit transient_commit<t>(value: t, rand: field): field;

// persistent (ledger-safe) operations
circuit persistent_hash<t>(value: t): bytes<32>;
circuit persistent_commit<t>(value: t, rand: bytes<32>): bytes<32>;
```

transient functions are ideal for temporary computations, while persistent variants produce outputs suitable for long-term ledger storage.

---

## ledger data types

### kernel

special operations exposed through the `kernel` type:

```compact
blocktimegreaterthan(time: uint<64>): boolean
blocktimelessthan(time: uint<64>): boolean
checkpoint(): []
claimcontractcall(addr: bytes<32>, entry_point: bytes<32>, comm: field): []
claimzswapcoinreceive(note: bytes<32>): []
claimzswapcoinspend(note: bytes<32>): []
claimzswapnullifier(nul: bytes<32>): []
mint(domain_sep: bytes<32>, amount: uint<64>): []
self(): contractaddress
```

### cell

`cell<value_type>` holds a single value:

```compact
read(): value_type
write(value: value_type): []
resettodefault(): []
writecoin(coin: coininfo, recipient: either<zswapcoinpublickey, contractaddress>): []
```

### counter

```compact
read(): uint<64>
increment(amount: uint<16>): []
decrement(amount: uint<16>): []
lessthan(threshold: uint<64>): boolean
resettodefault(): []
```

### set

```compact
insert(elem: value_type): []
member(elem: value_type): boolean
isempty(): boolean
remove(elem: value_type): []
size(): uint<64>
resettodefault(): []
insertcoin(coin: coininfo, recipient: either<zswapcoinpublickey, contractaddress>): []
```

### map

```compact
insert(key: key_type, value: value_type): []
lookup(key: key_type): value_type
member(key: key_type): boolean
isempty(): boolean
remove(key: key_type): []
size(): uint<64>
resettodefault(): []
insertdefault(key: key_type): []
insertcoin(key: key_type, coin: coininfo, recipient: either<zswapcoinpublickey, contractaddress>): []
```

### list

```compact
head(): maybe<value_type>
isempty(): boolean
length(): uint<64>
pushfront(value: value_type): []
popfront(): []
resettodefault(): []
pushfrontcoin(coin: coininfo, recipient: either<zswapcoinpublickey, contractaddress>): []
```

### merkle structures

`merkletree<n, t>` and `historicmerkletree<n, t>` provide privacy-preserving membership:

```compact
checkroot(rt: merkletreedigest): boolean
insert(item: value_type): []
insertindex(item: value_type, index: uint<64>): []
insertdefault(index: uint<64>): []
insert_hash(hash: bytes<32>): []
insert_hash_index(hash: bytes<32>, index: uint<64>): []
isfull(): boolean
resettodefault(): []
```

historic variants track previous roots, allowing proofs against past states. typescript helpers include `root()`, `firstfree()`, `findpathforleaf`, `pathforleaf`, and `history()` for iterating stored roots.

---

## opaque value handling

opaque values bridge compact and typescript for data the zk system does not inspect.

```compact
export circuit store_data(data: opaque<'string'>): [] {
    stored_data = data;
}

export circuit retrieve_data(): opaque<'string'> {
    return stored_data;
}
```

```typescript
const text_data = "hello, midnight!";
await contract.store_data(text_data);
const retrieved = await contract.retrieve_data();
console.log(retrieved);
```

supported opaque tags include `'string'` and `'uint8array'`.

---

## compact standard library reference

### core data structures

```compact
struct maybe<t> {
    is_some: boolean;
    value: t;
}

struct either<a, b> {
    is_left: boolean;
    left: a;
    right: b;
}

struct curve_point {
    x: field;
    y: field;
}

struct merkletree_digest {
    field: field;
}

struct contract_address {
    bytes: bytes<32>;
}

struct coin_info {
    nonce: bytes<32>;
    color: bytes<32>;
    value: uint<128>;
}

struct qualified_coin_info {
    nonce: bytes<32>;
    color: bytes<32>;
    value: uint<128>;
    mt_index: uint<64>;
}
```

constructors:

```compact
circuit some<t>(value: t): maybe<t>;
circuit none<t>(): maybe<t>;
circuit left<a, b>(value: a): either<a, b>;
circuit right<a, b>(value: b): either<a, b>;
```

### cryptographic primitives

```compact
circuit transient_hash<t>(value: t): field;
circuit persistent_hash<t>(value: t): bytes<32>;
circuit transient_commit<t>(value: t, rand: field): field;
circuit persistent_commit<t>(value: t, rand: bytes<32>): bytes<32>;
circuit ec_add(a: curve_point, b: curve_point): curve_point;
circuit ec_mul(a: curve_point, b: field): curve_point;
circuit ec_mul_generator(b: field): curve_point;
circuit hash_to_curve<t>(value: t): curve_point;
```

### merkle helpers

```compact
circuit merkletreepathroot<#n, t>(path: merkletreepath<n, t>): merkletree_digest;
circuit merkletreepathrootnoleafhash<#n>(path: merkletreepath<n, bytes<32>>): merkletree_digest;
```

### token utilities

```compact
circuit native_token(): bytes<32>;
circuit token_type(domain_sep: bytes<32>, contract: contract_address): bytes<32>;
circuit mint_token(
    domain_sep: bytes<32>,
    value: uint<128>,
    nonce: bytes<32>,
    recipient: either<zswapcoinpublickey, contractaddress>
): coin_info;

circuit evolve_nonce(index: uint<64>, nonce: bytes<32>): bytes<32>;
```

### zswap utilities

```compact
circuit send(
    input: qualified_coin_info,
    recipient: either<zswapcoinpublickey, contractaddress>,
    value: uint<128>
): sendresult;

circuit send_immediate(
    input: coin_info,
    target: either<zswapcoinpublickey, contractaddress>,
    value: uint<128>
): sendresult;

circuit receive(coin: coin_info): [];
circuit merge_coin(a: qualified_coin_info, b: qualified_coin_info): coin_info;
circuit merge_coin_immediate(a: qualified_coin_info, b: coin_info): coin_info;
```

### miscellaneous utilities

```compact
circuit burn_address(): either<zswapcoinpublickey, contractaddress>;
circuit own_public_key(): zswapcoinpublickey;
circuit block_time_lt(time: uint<64>): boolean;
circuit block_time_gte(time: uint<64>): boolean;
circuit block_time_gt(time: uint<64>): boolean;
circuit block_time_lte(time: uint<64>): boolean;
```

---

## best practices snapshot

1. use type annotations liberally for clarity and safety.
2. treat witness outputs as untrusted until validated.
3. pick ledger types (set, map, merkletree) that match privacy requirements.
4. declare circuits `pure` whenever possible to maximize optimization.
5. wrap optional values with `maybe` helpers and branch on `is_some`.
6. document modules with clear exports and use generics for reusable logic.
7. leverage domain-separated hashes and commitments to avoid collisions.
8. rely on merkletrees plus nullifiers for privacy-preserving single-use tokens.
9. maintain strict randomness hygiene when generating commitments.
10. test disclosure boundaries by intentionally omitting `disclose()` during development to observe compiler feedback.