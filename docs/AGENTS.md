# 🤖 WORKFORCE PULSE AI AGENTS

This workspace has specialized AI agents to accelerate development.

## Available Agents

All agents are configured in `.github/copilot/` directory:

- **Frontend Agent** - React, Next.js, TypeScript, Tailwind expert
- **Backend Agent** - Node.js, Express, MongoDB specialist  
- **Integration Agent** - External APIs & data scraping expert
- **Testing Agent** - Vitest, testing patterns, quality assurance
- **Documentation Agent** - Technical writing, API docs, code comments
- **DevOps Agent** - Vercel deployment, CI/CD, optimization

## How to Use

In GitHub Copilot Chat, invoke agents with `@`:

```
@Frontend Agent: Create a job filter component with sector selection

@Backend Agent: Add validation middleware for mission creation

@Integration Agent: Add LinkedIn as a job data source

@Testing Agent: Write unit tests for the job aggregation service

@Documentation Agent: Update API docs with the new filter endpoint

@DevOps Agent: Configure staging environment on Vercel
```

## Documentation

See [docs/getting-started/agents.md](docs/getting-started/agents.md) for complete guide including:
- When to use each agent
- Example prompts
- Agent collaboration workflows
- Best practices

## Agent Files

Agent configuration files are in `.github/copilot/`:
- `Frontend Agent.agent.md`
- `Backend Agent.agent.md`
- `Integration Agent.agent.md`
- `Testing Agent.agent.md`
- `Documentation Agent.agent.md`
- `DevOps Agent.agent.md`

These files define:
- Agent expertise and knowledge areas
- File scope and restrictions
- Code patterns and examples
- Response formats

## Customization

To modify agent behavior:
1. Edit the corresponding `.agent.md` file
2. Update code patterns and examples
3. Agents will use updated knowledge immediately

## Feedback

If agents give incorrect answers or could be improved:
1. Note what went wrong
2. Update the agent's `.agent.md` file with correct information
3. Share feedback with the team

---

**Quick Start**: Just start chatting with `@Frontend Agent` or `@Backend Agent` and see the magic! ✨
