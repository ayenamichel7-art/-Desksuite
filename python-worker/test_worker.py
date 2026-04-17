import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as c:
        try:
            # Test simple health check
            print("--- Checking Health ---")
            r_health = await c.get('http://localhost:5000/health', timeout=10)
            print("Health Status:", r_health.status_code)
            
            # Test Audit Report (Watchdog)
            print("\n--- Triggering Audit Report (Watchdog) ---")
            headers = {"X-Internal-Token": "super-secret-internal-token"}
            r_report = await c.get('http://localhost:5000/system/daily-audit-report', headers=headers, timeout=120)
            print("Report API Status:", r_report.status_code)
            print("Report Response:", r_report.text)
            
        except Exception as e:
            print("Global Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
