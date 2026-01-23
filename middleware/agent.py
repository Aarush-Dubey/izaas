import os
import json
import pandas as pd
from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_groq import ChatGroq
from langchain_core.tools import Tool
from vision_model import VisionModel

class FinancialAnalystTool:
    def __init__(self, json_path="data/transactions.json", model_name="llama3-70b-8192"):
        """
        Initializes the Financial Analyst Agent.
        
        Args:
            json_path (str): Path to the transaction JSON file.
            model_name (str): Groq model to use.
        """
        self.json_path = json_path
        self.model_name = model_name
        self.db_uri = "sqlite:///:memory:" # Use RAM for speed (or file path for persistence)
        self.agent = None
        
        # 1. Load Data immediately on init
        self._load_data_to_sql()
        
        # 2. Initialize the Agent
        self._init_agent()

    def _load_data_to_sql(self):
        """Internal: Loads JSON into in-memory SQLite DB."""
        if not os.path.exists(self.json_path):
            raise FileNotFoundError(f"Transaction file not found at: {self.json_path}")

        with open(self.json_path, 'r') as f:
            data = json.load(f)

        # Handle various JSON structures
        txns = data.get("transactions", data) if isinstance(data, dict) else data
        
        df = pd.DataFrame(txns)
        
        # Data Cleaning: Flatten list/dict columns for SQL
        for col in df.columns:
            if df[col].apply(lambda x: isinstance(x, (list, dict))).any():
                df[col] = df[col].apply(lambda x: json.dumps(x) if isinstance(x, (list, dict)) else str(x))

        # Create Engine & Push to SQL
        engine = create_engine(self.db_uri)
        df.to_sql("transactions", engine, index=False, if_exists="replace")
        self.db = SQLDatabase(engine)
        print(f"DEBUG: Loaded {len(df)} transactions into SQL database.")
        print(f"DEBUG: Tables found: {self.db.get_usable_table_names()}")
        print(f"DEBUG: Table Info: {self.db.get_table_info()}")

    def _init_agent(self):
        """Internal: Configures the LLM and SQL Agent."""
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is missing.")

        llm = ChatGroq(model_name=self.model_name, temperature=0, groq_api_key=api_key)

        # Initialize Vision Model
        self.vision_model = VisionModel()

        def vision_tool_func(file_path: str):
            """Analyzes an image or PDF at the given path."""
            # Define a fixed output path or temporary one
            output_json = f"{file_path}_analysis.json"
            # We can't easily pass a prompt dynamically with a single-arg tool unless we parse it.
            # For now, we'll use a generic prompt or rely on the agent to pass it if we change signature.
            # But the VisionModel.process_file takes a prompt. 
            # Let's simplify and just run the analysis.
            try:
                self.vision_model.process_file(file_path, output_json, prompt="Detailed analysis for financial context.")
                with open(output_json, 'r') as f:
                    return json.load(f)
            except Exception as e:
                return f"Vision processing failed: {str(e)}"

        vision_tool = Tool(
            name="vision_tool",
            func=vision_tool_func,
            description="Useful for analyzing images, receipts, or PDF documents. Input should be the absolute file path."
        )

        self.agent = create_sql_agent(
            llm=llm,
            db=self.db,
            extra_tools=[vision_tool],
            agent_type="openai-tools",
            verbose=True, # Set True for debugging logs
            handle_parsing_errors=True
        )

    def run(self, query: str, context: str = "") -> str:
        """
        The public API for the system.
        
        Args:
            query (str): The user's natural language question.
            context (str): Additional context (e.g., from vision model).
        Returns:
            str: The agent's analysis result.
        """
        if not self.agent:
            return "Error: Agent not initialized."

        # Pre-prompt injection to handle financial context and force tool usage
        contextualized_query = (
            "SYSTEM INSTRUCTION: If you require real data to answer confidently, request it via tools (sql_db_query). "
            "Never guess values. You have access to a 'transactions' table with columns: id, timestamp, merchant, amount, category, tags.\n"
            "Negative amounts are spending. Positive amounts are income.\n\n"
            "If User ask about his transaction history call this tool"
            f"User Query: {query}"
        )
        
        if context:
            contextualized_query += f"\n\nADDITIONAL DOCUMENT CONTEXT:\n{context}\n(Use this context if the user asks about the document)"
        
        try:
            response = self.agent.invoke(contextualized_query)
            return response['output']
        except Exception as e:
            return f"Analysis Failed: {str(e)}"

# Optional: Standalone test
if __name__ == "__main__":
    tool = FinancialAnalystTool(json_path="big_transactions.json")
    print(tool.run("How much did I spend on Uber?"))