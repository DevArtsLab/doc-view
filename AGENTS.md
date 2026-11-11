# Agent Guide

train-docs - DevArts Lab project.

## Foundation

This repository is governed by the DevArts Lab foundation: `../foundation`
(remote: `DevArtsLab/foundation`). Adopted revision: 3a (2026-10-26).

## Conventions

- Skills resolve by name from `$AGENT_CONFIG_HOME/skills/`; do not vendor copies.
- Project-scope config and skills live in `.agents/`.
- Secrets resolve from the workspace store (root marker `.workspace.json`, D14). No secret values in the repo.
- Track work in the DevArts Lab Linear workspace.
