# Cognium Tool Lane

Configuration, commands, and notes for Cognium / circle-ir benchmark runs.

## Current Published Reproduction Command

Source: `https://cognium.dev/benchmark/`

The live benchmark page currently publishes the following reproduction path for
the `circle-ir 3.19.4` static-analysis benchmark run dated April 22, 2026:

```sh
git clone https://github.com/cogniumhq/circle-ir
cd circle-ir/benchmarks
npm install
npm run benchmark
```

Prerequisites from the source page:

- Git
- Node.js 18+

Use this command as the baseline when reproducing imported `cognium.dev`
benchmark results. If a future run uses a different command, record the new
command in the dated result folder and update this file.

Verification note: during the 2026-05-03 repo review, the local
`/Users/asok/workspace/circle-ir/package.json` did not define a `benchmark`
script. Before publishing fresh reruns, restore or add a public benchmark
harness command in `cogniumhq/circle-ir` and update this file.

Each run should record:

- circle-ir version
- rule pack or analyzer configuration
- command
- runtime environment
- raw output path
