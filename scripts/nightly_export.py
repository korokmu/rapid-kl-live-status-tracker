import os
import csv
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. Load your "Secret Vault" (.env)
load_dotenv()

# 2. Get your Supabase keys from the vault
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    exit(1)

# 3. Initialize the Supabase "Master" connection
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def export_table(table_name, date_str):
    """Fetches all rows from a table and saves to a CSV file."""
    print(f"📦 Fetching data from: {table_name}...")
    try:
        response = supabase.table(table_name).select("*").execute()
        data = response.data
        
        if not data:
            print(f"ℹ️ No data to export for {table_name}.")
            return False

        filename = f"exports/{table_name}_{date_str}.csv"
        os.makedirs("exports", exist_ok=True)

        keys = data[0].keys()
        with open(filename, "w", newline="") as output_file:
            dict_writer = csv.DictWriter(output_file, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(data)
        
        print(f"✅ Successfully exported {len(data)} rows to {filename}")
        return True
    except Exception as e:
        print(f"❌ ERROR exporting {table_name}: {e}")
        return False

def clear_table(table_name):
    """Deletes all rows from a table."""
    print(f"🧹 Clearing table: {table_name}...")
    try:
        # Deleting with a filter that matches everything (id is not null)
        supabase.table(table_name).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"✅ {table_name} cleared.")
    except Exception as e:
        print(f"❌ ERROR clearing {table_name}: {e}")

def nightly_job():
    today_str = datetime.now().strftime("%Y-%m-%d")
    print(f"🚀 Starting nightly export job for {today_str}...")

    # 1. Export all tables
    tables_to_export = ["upvotes", "resolves", "comments", "reports"]
    for table in tables_to_export:
        export_table(table, today_str)

    # 2. Clear all tables (Order matters due to Foreign Keys!)
    # We clear children tables first, then the parent (reports)
    tables_to_clear = ["upvotes", "resolves", "comments", "reports"]
    for table in tables_to_clear:
        clear_table(table)

    print(f"🏁 Nightly job finished at {datetime.now()}")

if __name__ == "__main__":
    nightly_job()
