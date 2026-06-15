# AI Usage

I wanted to ensure this project was primarily my own work, so I kept AI usage minimal. I used traditional documentation and StackOverflow for most of the core logic.

### Tools Used
- **Stitch**: For generating initial UI layout ideas using Tailwind CSS.
- **Antigravity**: Used strictly for deployment debugging when things got stuck.

### Concrete AI Mistakes & Corrections

1. **Incorrect Database Port Suggestion**
   - *What happened*: During deployment, the AI suggested using port `6543` for the Prisma schema push over a Supabase connection pooler. 
   - *How I caught it*: The build completely hung and timed out on Render.
   - *How I fixed it*: I researched Supabase's direct connection requirements and manually changed the environment variable to use port `5432`, bypassing the pooler for schema migrations.

2. **File Path Hallucination in Multer**
   - *What happened*: An AI snippet for handling CSV uploads suggested saving files to `./uploads/`.
   - *How I caught it*: When I deployed to Render, the server threw an `ENOENT` error because git doesn't track empty folders, so the directory didn't exist in production.
   - *How I fixed it*: I rewrote the multer storage configuration to use Node's native `os.tmpdir()` which safely handles temporary files in serverless/cloud environments without requiring manual directory management.

3. **Incorrect JSON Payload via Curl**
   - *What happened*: I used the AI to help me test my API via a terminal command. It generated a `curl` command for Windows PowerShell that used double quotes for the JSON payload.
   - *How I caught it*: My Express backend crashed with `SyntaxError: Expected property name or '}' in JSON at position 1` because PowerShell stripped the quotes before passing it to curl.
   - *How I fixed it*: I realized it was a Windows shell escaping issue. I dropped the terminal AI testing and just tested the endpoint directly from my React frontend, which handled the object serialization perfectly.
