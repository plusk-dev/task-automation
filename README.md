Author Info: 
Yuvraj Motiramani

Mathematics and Computing

IIT Jammu

An intelligent automation platform that connects large language models to hundreds of third-party APIs through RAG-powered tool retrieval. This project enables LLMs to handle complex, multi-step workflows by intelligently selecting and executing the right API endpoints based on natural language queries.

## System Design & Architecture

### Tech Stack

**Backend:**
- FastAPI - High-performance web framework
- SQLAlchemy - Database ORM

**RAG & Generative AI:**
- DSPy - Programming framework for AI systems
- Qdrant - Vector database for embeddings
- FastEmbed - Embedding generation

**Frontend:**
- Next.js - React framework
- Shadcn UI - Component library

## How It Works

### RAG-Powered Tool Calling

Traditional tool calling approaches fail when dealing with hundreds of API endpoints. Modern APIs often have 100+ endpoints, but LLMs can only reliably handle 30-40 tools simultaneously. Our solution uses Retrieval-Augmented Generation (RAG) to intelligently select the most relevant endpoints before execution.

### Connecting a Platform

#### Method 1: OpenAPI Spec Available (e.g., Linear)

When a platform provides OpenAPI documentation:

1. **Ingestion**: We selectively ingest endpoints from the OpenAPI spec as JSON, capturing:
   - URLs and descriptions
   - Request/response schemas
   - Supported HTTP methods

2. **Intent Association**: Each endpoint gets an associated "intent" - a natural language description of when a user would call this endpoint
   - Example: "create a ticket" for ticket creation endpoints

3. **Vector Storage**: Intents are converted to vectors using hybrid embedding models and stored in Qdrant

4. **Embedding Strategy**: We use a combination of 3 dense and sparse embedding models for optimal retrieval accuracy

#### Method 2: No OpenAPI Spec Available

When OpenAPI documentation isn't available:

1. **Custom Wrapper**: We build a FastAPI wrapper around the platform's API
2. **Auto-Generated Spec**: FastAPI automatically generates OpenAPI documentation for our wrapper
3. **Standard Ingestion**: The generated spec follows the same ingestion process as Method 1

### Query Execution Pipeline

1. **Query Preprocessing**: 
   - Rephrase user queries to remove slang and improve retrieval quality
   - Normalize language for better vector matching

2. **Endpoint Retrieval**:
   - Use the processed query to retrieve top 3 most relevant API endpoints from Qdrant
   - Apply LLM-based filtering to select the optimal endpoint

3. **Request Execution**:
   - Generate and execute the appropriate API request
   - Use response data as context for next steps or final response generation

4. **Response Generation**:
   - Synthesize API responses into natural language
   - Determine if additional API calls are needed for complex workflows

## Design Choices & Differentiation

### Why RAG Over Traditional Tool Calling?

**Scalability**: Traditional tool calling hits reliability limits around 30-40 tools. RAG enables connection to hundreds of endpoints by retrieving only relevant tools.

**Cost Efficiency**: Instead of passing all available tools to the LLM context, RAG retrieves only the top-k most relevant endpoints, dramatically reducing token consumption.

**Reliability**: RAG-based selection is more reliable than asking LLMs to choose from hundreds of options simultaneously.

### Advantages Over MCP (Model Context Protocol)

**Token Efficiency**: MCP servers hosting hundreds of tools must pass all tools to the LLM context, causing massive token consumption. Our RAG approach reduces this by 10-100x.

**Loop Prevention**: MCPs frequently get stuck in infinite loops when dealing with complex tool selections. Our filtered approach prevents this issue.

**Cost Effectiveness**: Significantly lower operational costs due to reduced token usage and more efficient execution paths.

**Documented Issues with MCPs**:
- [Anything LLM Loop Issues](https://github.com/Mintplex-Labs/anything-llm/issues/4223)
- [Kilocode Loop Errors](https://www.reddit.com/r/kilocode/comments/1kwh8as/seeming_to_get_a_lot_of_loop_error_issues/)
- [Windsurf Sequential Thinking Stuck](https://www.reddit.com/r/windsurf/comments/1mbdlnm/sequential_thinking_mcp_stuck/)
- [Cursor Endless Loops](https://forum.cursor.com/t/endless-loop-of-mcp-use/87638)

## Social Impact

### Productivity Enhancement

According to ProcessMaker research, knowledge workers waste 1.5-4.6 hours per week on manual copy-paste and ticketing tasks. By automating these mundane activities, we enable:

- **Productivity Gains**: Redirect focus toward high-value, creative, and strategic work
- **Job Satisfaction**: Reduce repetitive tasks that lead to burnout
- **Organizational Growth**: Enable teams to focus on innovation rather than manual processes
- **Efficiency Improvements**: Streamline workflows across multiple platforms and tools

### Automation Benefits

- **Error Reduction**: Eliminate human errors in repetitive tasks
- **Consistency**: Ensure standardized processes across teams
- **Scalability**: Handle increasing workloads without proportional staff increases
- **Integration**: Seamlessly connect disparate tools and platforms

## Getting Started

### Prerequisites
- Python 3.8+
- Redis server (6.0+)
- Qdrant vector database (1.0+)

### Quick Setup

1. **Clone and Install**:
```bash
git clone <repository-url>
cd kramen-backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

2. **Configure Environment**:
```bash
cp env.example .env
# Edit .env with your API keys and database URLs
```

3. **Initialize Database**:
```bash
python -c "from models import Base, engine; Base.metadata.create_all(bind=engine)"
```

4. **Start Services**:
```bash
# Main application
uvicorn main:app --reload --port 5000

# Proxy servers (in separate terminal)
python -m proxies.run_servers --all
```

### Frontend Setup

The frontend is located in the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

## API Usage

### Query Execution
```bash
curl -X POST "http://localhost:5000/run/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Create a Linear issue for the bug I found",
    "user_context": {
      "integrations": ["linear"],
      "auth_data": {"api_key": "your_linear_key"}
    }
  }'
```

### Integration Management
```bash
# Upload OpenAPI spec
curl -X POST "http://localhost:5000/integrations/upload-openapi" \
  -H "Content-Type: application/json" \
  -d '{
    "integration_name": "linear",
    "openapi_spec": {...}
  }'
```
