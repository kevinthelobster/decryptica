#!/usr/bin/env python3
"""Run daily-article-v2.js 9 times to regenerate remaining bad articles"""
import subprocess
import sys
import re

SCRIPT = "/Users/kevinsimac/.openclaw/workspace/decryptica/scripts/daily-article-v2.js"
WSPACE = "/Users/kevinsimac/.openclaw/workspace/decryptica"

def get_word_count(output):
    match = re.search(r"Content generated: (\d+) words", output)
    if match:
        return int(match.group(1))
    return 0

def run_once(run_num):
    print(f"\n{'='*50}")
    print(f"Run {run_num} of 9")
    print('='*50)
    
    result = subprocess.run(
        ["node", SCRIPT],
        cwd=WSPACE,
        capture_output=True,
        text=True,
        timeout=180
    )
    
    output = result.stdout + result.stderr
    print(output[:500] if len(output) > 500 else output)
    
    wc = get_word_count(output)
    success = wc > 1000
    
    if not success:
        print(f"⚠️  Fallback used (or error) - will retry")
    
    return success, wc

def main():
    successes = 0
    total_wc = 0
    titles = []
    
    for i in range(1, 10):
        success, wc = run_once(i)
        if success:
            successes += 1
            total_wc += wc
    
    print(f"\n{'='*50}")
    print(f"DONE: {successes}/9 successful MiniMax generations")
    if successes > 0:
        print(f"Average word count: {total_wc // successes}")
    print('='*50)

if __name__ == "__main__":
    main()
