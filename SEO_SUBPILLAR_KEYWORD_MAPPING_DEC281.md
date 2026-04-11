# SEO Sub-Pillar Keyword Mapping (DEC-281)

## Purpose
Finalize sub-pillar naming, keyword clusters, and index metadata for the AI, Crypto, and Automation route rollout defined in [DEC-280](/DEC/issues/DEC-280).

## Final Sub-Pillar Map

### AI

- `/topic/ai/llms` - Large Language Models
- `/topic/ai/agents` - AI Agents and Agentic Systems
- `/topic/ai/tooling` - AI Tooling and Stack Selection

### Crypto

- `/topic/crypto/defi` - DeFi Protocols and Yield Strategy
- `/topic/crypto/wallets` - Wallets, Security, and Custody
- `/topic/crypto/trading` - Trading, Market Structure, and Risk

### Automation

- `/topic/automation/workflows` - Workflow Automation Design
- `/topic/automation/infrastructure` - Automation Infrastructure and Operations
- `/topic/automation/tooling` - Automation Tools and Implementation Stack

## Keyword Cluster Assignment

### `/topic/ai/llms`

Primary cluster:
- large language models
- llm use cases
- llm benchmarks
- llm fine tuning
- open source llm

Supporting cluster:
- prompt engineering best practices
- retrieval augmented generation
- llm latency optimization
- context window comparison
- model selection framework

### `/topic/ai/agents`

Primary cluster:
- ai agents
- autonomous agents
- agentic workflows
- multi agent systems
- ai copilots

Supporting cluster:
- tool using agents
- memory architecture for agents
- planning and orchestration for agents
- human in the loop ai agent
- agent evaluation metrics

### `/topic/ai/tooling`

Primary cluster:
- ai tools for business
- ai stack
- ai platform comparison
- ai development tools
- ai deployment tools

Supporting cluster:
- vector database comparison
- ai observability tools
- mlops for generative ai
- ai cost optimization tools
- ai governance tools

### `/topic/crypto/defi`

Primary cluster:
- defi protocols
- defi yield farming
- liquidity pools
- decentralized exchanges
- staking vs lending

Supporting cluster:
- impermanent loss strategy
- on chain yield analysis
- tokenomics evaluation
- defi risk management
- smart contract risk

### `/topic/crypto/wallets`

Primary cluster:
- crypto wallets
- hot wallet vs cold wallet
- best crypto wallet security
- self custody crypto
- seed phrase security

Supporting cluster:
- multisig wallet setup
- hardware wallet comparison
- wallet recovery best practices
- custody risk framework
- wallet security checklist

### `/topic/crypto/trading`

Primary cluster:
- crypto trading strategies
- spot vs futures crypto
- technical analysis crypto
- crypto market cycles
- trading risk management

Supporting cluster:
- order book structure crypto
- slippage and liquidity in crypto
- leverage risk controls
- position sizing crypto
- trading journal framework

### `/topic/automation/workflows`

Primary cluster:
- workflow automation
- business process automation
- no code automation workflows
- automation use cases
- process mapping automation

Supporting cluster:
- workflow trigger design
- approvals in automation
- exception handling automation
- automation roi model
- workflow governance

### `/topic/automation/infrastructure`

Primary cluster:
- automation infrastructure
- event driven architecture automation
- automation reliability
- automation monitoring
- automation scalability

Supporting cluster:
- queue based automation patterns
- retries and idempotency automation
- workflow observability stack
- integration architecture automation
- secure automation architecture

### `/topic/automation/tooling`

Primary cluster:
- automation tools comparison
- workflow automation platforms
- rpa vs api automation
- integration tools automation
- automation implementation stack

Supporting cluster:
- make vs zapier vs n8n
- enterprise automation platform selection
- automation cost comparison
- connector coverage analysis
- build vs buy automation tooling

## Metadata Drafts (Title + Description)

- `/topic/ai/llms`
  - Title: Large Language Models: Benchmarks, Fine-Tuning, and Real-World Use Cases
  - Description: Compare top LLM approaches, benchmark trade-offs, and implementation patterns for production AI use cases.

- `/topic/ai/agents`
  - Title: AI Agents: Agentic Workflow Design, Orchestration, and Evaluation
  - Description: Learn how to design, deploy, and evaluate AI agents with practical orchestration, memory, and human oversight patterns.

- `/topic/ai/tooling`
  - Title: AI Tooling Stack: Platform Selection, MLOps, and Cost Controls
  - Description: Evaluate AI platforms and tooling with clear criteria for deployment speed, observability, governance, and ROI.

- `/topic/crypto/defi`
  - Title: DeFi Strategy Hub: Protocol Analysis, Yield Frameworks, and Risk Controls
  - Description: Navigate DeFi protocols with structured yield analysis, liquidity strategy, and risk management best practices.

- `/topic/crypto/wallets`
  - Title: Crypto Wallet Security: Self-Custody, Cold Storage, and Recovery Planning
  - Description: Build a wallet security posture with practical guidance on self-custody, multisig, recovery, and threat reduction.

- `/topic/crypto/trading`
  - Title: Crypto Trading Frameworks: Market Structure, Strategy, and Risk Management
  - Description: Improve trading decisions with market structure context, strategy design, and disciplined risk controls.

- `/topic/automation/workflows`
  - Title: Workflow Automation: Process Design, Trigger Logic, and ROI Measurement
  - Description: Design automation workflows that reduce manual work, improve quality, and deliver measurable business outcomes.

- `/topic/automation/infrastructure`
  - Title: Automation Infrastructure: Reliability, Observability, and Scale Patterns
  - Description: Architect resilient automation systems with proven patterns for monitoring, retries, security, and operational scale.

- `/topic/automation/tooling`
  - Title: Automation Tooling Comparison: Platform Selection and Implementation Strategy
  - Description: Compare automation platforms and integration stacks using practical selection criteria for speed, flexibility, and total cost.

## Anchor Text Policy (Pillar -> Sub-Pillar and Sub-Pillar -> Article)

- Use intent-forward anchors with primary keyword + outcome framing.
- Keep anchor length between 3 and 8 words.
- Do not use generic anchors like "click here" or "learn more".
- Prioritize one canonical anchor phrase per route to reduce internal cannibalization.
- Use article card anchors that include a clear action or comparison term (for example: "compare", "checklist", "framework", "template").

## Routing Notes for Engineering

- Keep slug values exactly as defined in DEC-280 route contract.
- Use sub-pillar display names from this document for H1 and nav labels.
- Metadata can be used directly for route-level title and description defaults.

