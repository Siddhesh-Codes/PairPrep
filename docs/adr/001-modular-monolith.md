# ADR-001: Modular Monolith Architecture

**Date:** 2026-05-21
**Status:** Accepted

## Context

PairPrep V1 needs a backend architecture that supports rapid development by 1-2 engineers, deploys to a single Oracle Free VM, and provides clean module boundaries for future extraction.

## Decision

Use a modular monolith with Spring Boot 3.x. Each domain (auth, user, discovery, matching, session, feedback, notification) lives in its own Java package with clear interfaces. Cross-module communication uses Spring's ApplicationEventPublisher for async side effects and direct service calls for synchronous dependencies.

## Consequences

**Positive:**
- Single deployable artifact — simple ops
- Local transactions — no distributed consistency issues
- Fast development — easy refactoring across modules
- Clean migration path — extract modules to services if needed

**Negative:**
- All modules share a process — one module's crash takes down everything
- No independent scaling — scale the whole monolith
- Convention-enforced boundaries — no process-level isolation

**Migration trigger:** When module traffic patterns diverge 10x+ or team size exceeds 5 engineers.
