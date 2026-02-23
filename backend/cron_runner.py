#!/usr/bin/env python3
"""
Cron Job Runner for Radio Check Backend

This script is designed to be run by external cron services (like Render, cron-job.org)
It handles path setup automatically regardless of the working directory.

Usage:
    python cron_runner.py [job_name]

Jobs:
    shift_reminders - Send shift reminder emails
    data_retention  - Clean up old data per GDPR compliance

Example Render Cron Command:
    cd backend && python cron_runner.py shift_reminders
"""

import os
import sys
import argparse
from pathlib import Path

# Ensure we're in the right directory
SCRIPT_DIR = Path(__file__).parent.absolute()
os.chdir(SCRIPT_DIR)

# Add backend to Python path
sys.path.insert(0, str(SCRIPT_DIR))

def run_shift_reminders():
    """Run the shift reminders script"""
    print("[CRON] Running shift reminders...")
    from scripts.shift_reminders import main
    import asyncio
    asyncio.run(main())
    print("[CRON] Shift reminders completed")

def run_data_retention():
    """Run the data retention/cleanup script"""
    print("[CRON] Running data retention cleanup...")
    from scripts.data_retention import main
    import asyncio
    asyncio.run(main())
    print("[CRON] Data retention completed")

def main():
    parser = argparse.ArgumentParser(description='Radio Check Backend Cron Runner')
    parser.add_argument('job', choices=['shift_reminders', 'data_retention'],
                        help='The cron job to run')
    args = parser.parse_args()
    
    jobs = {
        'shift_reminders': run_shift_reminders,
        'data_retention': run_data_retention,
    }
    
    try:
        jobs[args.job]()
        print(f"[CRON] Job '{args.job}' completed successfully")
        return 0
    except Exception as e:
        print(f"[CRON] Job '{args.job}' failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
