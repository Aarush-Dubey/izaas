import os
import json
import pandas as pd
from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_groq import ChatGroq
from langchain.agents.agent_types import AgentType

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
        
        # Data Cleaning: Flatten list columns (like 'tags') for SQL
        if 'tags' in df.columns:
            df['tags'] = df['tags'].apply(lambda x: ", ".join(x) if isinstance(x, list) else str(x))

        # Create Engine & Push to SQL
        engine = create_engine(self.db_uri)
        df.to_sql("transactions", engine, index=False, if_exists="replace")
        self.db = SQLDatabase(engine)

    def _init_agent(self):
        """Internal: Configures the LLM and SQL Agent."""
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is missing.")

        llm = ChatGroq(model_name=self.model_name, temperature=0, groq_api_key=api_key)

        self.agent = create_sql_agent(
            llm=llm,
            db=self.db,
            agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=False, # Set True for debugging logs
            handle_parsing_errors=True
        )

    def run(self, query: str) -> str:
        """
        The public API for the system.
        
        Args:
            query (str): The user's natural language question.
        Returns:
            str: The agent's analysis result.
        """
        if not self.agent:
            return "Error: Agent not initialized."

        # Pre-prompt injection to handle financial context (negative numbers)
        contextualized_query = (
            f"{query} "
            "(IMPORTANT Context: In the 'amount' column, negative values (e.g., -500) represent SPENDING/OUTFLOW. "
            "Positive values represent INCOME. When asked for 'spend' or 'cost', sum the absolute values of negative amounts.)"
        )
        
        try:
            response = self.agent.invoke(contextualized_query)
            return response['output']
        except Exception as e:
            return f"Analysis Failed: {str(e)}"

# Optional: Standalone test
if __name__ == "__main__":
    tool = FinancialAnalystTool(json_path="big_transactions.json")
    print(tool.run("How much did I spend on Uber?"))