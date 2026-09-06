
# 🏥 AutoPA — Autonomous Prior Authorization Agent
### ReAct • State Machine • RAG • Healthcare AI

![GitHub stars](https://img.shields.io/github/stars/your-repo?style=flat&color=yellow)
![GitHub forks](https://img.shields.io/github/forks/your-repo?style=flat&color=orange)
![GitHub issues](https://img.shields.io/github/issues/your-repo?style=flat&color=red)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-green)
![License](https://img.shields.io/badge/license-MIT-blue)

An enterprise-grade **AI orchestration system** designed to automate the medical chart review process. 
AutoPA focuses on **deterministic execution, safety, auditable reasoning, and Human-in-the-Loop (HITL) handoffs** to solve the $35 Billion prior authorization bottleneck in modern healthcare.

---

## 🚀 Overview

**AutoPA** is a full-stack **State-Machine Agent application** that acts as a digital clinical investigator. Instead of a human nurse manually digging through hundreds of pages of unstructured medical records, this agent reads complex insurance policies, intelligently queries Electronic Health Records (EHR) to gather clinical evidence, and prepares a comprehensive briefing for human Medical Directors.

It acts as an intelligent pipeline for:
* Parsing dynamic insurance policies via RAG.
* Querying EHR notes, pharmacy logs, and imaging histories.
* Synthesizing and verifying clinical criteria.
* Compiling deep-linked evidence packets for fast human approval.

Built with a modern, cyclical ReAct architecture featuring **LangGraph.js**, structured tool-calling, and strict infinite-loop prevention.

---

## 🚀 Features

* **ReAct Agent Loop (Observe, Think, Act, Reflect)** → The agent dynamically adjusts its search strategy (e.g., if "Physical Therapy" fails, it searches for "NSAIDs" or "Chiropractor").
* **Strict Loop Bounding** → Hard limits on iterations prevent runaway compute costs and infinite loops.
* **Adversarial Resilience** → Built to handle conflicting medical evidence (e.g., conflicting doctor notes) by gracefully degrading and requesting human review instead of guessing.
* **Medical Director Dashboard** → A clean, Next.js UI for the Human-in-the-Loop to review, approve, deny, or request more info.
* **Reasoning Trace Viewer** → Complete transparency into the agent's internal monologue, tool arguments, and raw results.
* **Dynamic Policy Retrieval (RAG)** → Automatically loads the exact payer rules based on the patient's insurance and requested procedure code.
* **State Checkpointing** → Long-running graphs can be paused, persisted to a database, and resumed.

---

## 🧩 Tech Stack

* ⚛️ **React + Next.js (App Router)** → Full-stack framework + TypeScript
* 🎨 **TailwindCSS** → Utility-first modern styling
* 🤖 **LangGraph.js** → Core orchestration, cyclic state machines, and hitl control flow
* 🧠 **AzureOpenAI GPT-5** → LLM reasoning and structured tool calling
* 🛡️ **Zod** → Strict schema validation for all agent inputs/outputs
* 🛢️ **PostgreSQL / MemorySaver** → Agent state persistence and checkpointing
* 🔍 **Vector DB (pgvector)** → RAG for dynamic medical policy retrieval
* 🚀 **Vercel** → Production deployment

---

## 📸 Screenshots

<img width="1898" height="865" alt="Medical Director Dashboard" src="image_1adbde.png" />
<img width="1707" height="838" alt="Evidence Deep Links" src="image_1ad81e.png" />

---

## 📂 Project Structure

**Feature Categories → Directories**

* `/src/lib/agent/` → LangGraph state, nodes, conditional edges, and tools
* `/src/lib/mocks/` → Fake patient data, FHIR simulators, and policy rules
* `/src/app/api/prior-auth/` → Next.js Route Handlers invoking the agent
* `/src/components/` → Dashboard UI, Reasoning Trace Viewer, Evidence Cards

### Core Flow

* `1. Request` → Payload containing Patient ID and Procedure Code.
* `2. Pre-fetch` → Backend pulls relevant policy via RAG.
* `3. Graph Run` → LangGraph executes the *Reason → Act → Reflect* loop.
* `4. Handoff` → Graph pauses; structured output is sent to UI for human review.

---

## 🏗️ What I Learned

* Designing **Cyclic State Machines (Directed Cyclic Graphs)** using LangGraph.js instead of fragile, linear LangChain pipelines.
* Forcing LLMs to return strict JSON data structures using **Zod** and native structured tool calling.
* Implementing **Human-in-the-Loop (HITL)** architecture and state checkpointing for high-stakes AI applications.
* **Adversarial Prompt Engineering:** Training an agent to recognize conflicting data and gracefully degrade rather than hallucinate.
* Bridging complex, backend AI orchestration with a clean, transparent React frontend.
* Translating messy, real-world business logic (healthcare rules) into deterministic code boundaries.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=
OPENAI_ENDPOINT=""
OPENAI_API_VERSION=""
OPENAI_DEPLOYEMENTNAME=""
OPENAI_EMBEDDING_DEPLOYEMENTNAME="text-embedding-3-small"
OPENAI_INSTANCE_NAME=""

DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
JWT_ACCESS_SECRET="sushantsinghnegideveloper"
JWT_REFRESH_SECRET="sushantsinghnegideveloperpro"

GITHUB_SECRET=""
GITHUB_ID=""

NEXTAUTH_SECRET=your-long-random-secret
NEXTAUTH_URL=http://localhost:3000
