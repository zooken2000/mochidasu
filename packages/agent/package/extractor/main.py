"""AgentCore Runtime entry point.

Runs at the root of the deployment package, where the managed runtime executes
it by file path. The agent is imported absolutely so its own relative imports
resolve.
"""

import uvicorn

from mochidasu_agent.extractor.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
