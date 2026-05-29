# Upstream Disclosure Policy for cognium-ai Findings

This repository may discover potential issues while benchmarking public open
source projects. Those findings need a stricter workflow than normal benchmark
publication.

## Default Rule

Do not open public upstream issues for security-sensitive findings until the
finding has been validated and the project's security policy has been checked.

## Workflow

1. Run `cognium-ai` and store raw output in a private local run directory.
2. Normalize only aggregate metrics into this public benchmark repository.
3. Create a private triage note for each high-confidence finding.
4. Reproduce the finding manually from a clean checkout and pinned commit.
5. Check `SECURITY.md`, GitHub Security Advisories, or maintainer disclosure
   instructions for the target project.
6. If the issue is security-sensitive, use the private disclosure channel.
7. If the issue is non-sensitive quality or tooling feedback, a public GitHub
   issue can be opened after the evidence is project-specific and minimal.
8. Record the upstream issue or disclosure link only after it is public or safe
   to reference.

## Public Issue Minimum Bar

A public upstream issue draft must include:

- repository and exact commit scanned
- command and `cognium-ai` version
- model and provider used
- concise finding summary
- minimal reproduction steps
- why the finding is believed valid
- no raw secrets, private paths, full source dumps, or unnecessary LLM reasoning

## Suggested Issue Title

`Potential issue found by cognium-ai benchmark scan: <short finding type>`

Use neutral wording. Avoid claiming a vulnerability until it has been confirmed.

