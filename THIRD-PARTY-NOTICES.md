# Third-party notices and scope of the MIT licence

The MIT licence above covers the material authored for this repository:
the scripts, the result sets and their summaries, the raw tool outputs we
produced, the benchmark and dataset documentation, the ground-truth label
files written for the vulnerable applications (datasets/*/expectedresults.csv
where the README marks them as ours), and the synthetic test-case sources
(datasets/*-synthetic/testcode, datasets/cwe-bench-rust/testcode,
datasets/nodejs-synthetic/testcode).

It does not cover third-party material that is redistributed or referenced
here, which keeps its own terms:

- datasets/owasp-benchmark-java/expectedresults-1.2.csv — OWASP Benchmark
  ground truth, GPL-2.0, (c) OWASP Foundation; redistributed unchanged.
- NIST Juliet Test Suites (Java, C#) — public domain (NIST); not copied here.
- OWASP WebGoat, DVJA, NodeGoat, Juice Shop, PyGoat, DVPWA,
  Vulnerability-goapp, Google Firing Range, SecuriBench Micro, CWE-Bench-Java
  and the GitHub repositories in datasets/top-*-github — each under its own
  licence; only metadata and our labels are stored here.
- Tool outputs under raw/ were produced by the named tools (cognium-dev,
  CodeQL, Semgrep and others) on the material above; the tools' own licences
  govern the tools, not these result files.
