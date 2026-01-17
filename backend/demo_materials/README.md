# Demo Materials

This folder contains intentionally bad examples for testing the COMPLY.AI scanner.

## Contents

### bad_privacy_policy.txt
A deliberately non-compliant privacy policy that violates multiple RGPD articles:
- No explicit consent mechanisms
- Unlimited data collection
- No user rights (access, deletion, portability)
- Indefinite data retention
- Unrestricted third-party sharing
- No DPO contact information

Use this to test the consent and lifecycle analysis agents.

### bad_code_example.py
Python code with intentional RGPD security violations:
- Plaintext storage of sensitive data (SSN, credit cards, medical records)
- Weak password hashing (MD5)
- Soft deletion instead of actual data erasure
- Unauthorized third-party data sharing
- No encryption in transit
- No audit logging
- Sensitive data in logs

Use this to test the security analysis agent.

## Usage

During hackathon demos:
1. Upload `bad_privacy_policy.txt` to the `/analyze` endpoint
2. Optionally point to a repo with `bad_code_example.py`
3. Show how COMPLY.AI identifies violations and provides recommendations
4. Compare with a compliant privacy policy to show the difference

## Important Note

**These examples are intentionally insecure and non-compliant. Never use these patterns in production code!**
