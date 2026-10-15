# Meridian - QA Developer Assessment

This repository contains my submission for the QA Developer Technical Assessment. 

## Project Structure
Please note that all the source code, backend API, and my specific changes are located inside the `meridian-repo` directory.

My detailed assessment report covering the test strategy, prioritized tasks, and defect investigation is available here:
[View SUBMISSION.md](./meridian-repo/meridian/SUBMISSION.md)

## Automated CI/CD
A GitHub Actions pipeline is configured at the root level (`.github/workflows/`). On every push, it automatically:
1. Navigates into the codebase.
2. Spins up the PostgreSQL, Redis, and API containers using Docker Compose.
3. Runs an integration health check against the live API.

## How to Run Locally

If you wish to run the environment on your local machine, ensure Docker is installed and execute the following commands:

1. Navigate into the main codebase folder:
   ```bash
   cd meridian-repo
