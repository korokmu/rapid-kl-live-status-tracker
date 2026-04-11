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

# Masking for safety: show only first 5 and last 5 characters
def mask(s):
    if not s: return "MISSING"
    return f"{s[:5]}...{s[-5:]}"

print(f"🔗 URL: {SUPABASE_URL}")
print(f"🔑 Key loaded: {mask(SUPABASE_KEY)}")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    exit(1)

# 3. Initialize the Supabase "Master" connection
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def nightly_export():
    print(f"🚀 Starting nightly export at {datetime.now()}...")

    # 4. Fetch all reports from the database
    # We use 'sb' to grab everything from the 'reports' table
    try:
        response = supabase.table("reports").select("*").execute()
        reports = response.data
    except Exception as e:
        print(f"❌ ERROR fetching reports: {e}")
        return

    if not reports:
        print("ℹ️ No reports to export today.")
    else:
        # 5. Create a CSV file in the 'exports/' folder
        today_date = datetime.now().strftime("%Y-%m-%d")
        filename = f"exports/reports_{today_date}.csv"
        
        # Ensure the 'exports' folder exists
        os.makedirs("exports", exist_ok=True)

        keys = reports[0].keys()
        with open(filename, "w", newline="") as output_file:
            dict_writer = csv.DictWriter(output_file, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(reports)
        
        print(f"✅ Successfully exported {len(reports)} reports to {filename}")

    # 6. WIPE THE DATABASE (DELETE ALL REPORTS)
    # We delete everything so tomorrow starts with a "Smooth" status
    try:
        # Deleting with a filter that matches everything (id is not null)
        supabase.table("reports").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("🧹 Database wiped clean for tomorrow.")
    except Exception as e:
        print(f"❌ ERROR wiping database: {e}")

if __name__ == "__main__":
    nightly_export()
