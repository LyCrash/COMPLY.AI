"""
BAD CODE EXAMPLE - RGPD Security Violations

This code demonstrates common RGPD security violations for testing purposes.
DO NOT use this in production!
"""

import sqlite3
import hashlib


class UserDatabase:
    """Insecure user database implementation with RGPD violations"""

    def __init__(self):
        # VIOLATION: Storing sensitive data in plaintext database
        self.conn = sqlite3.connect("users.db")
        self.cursor = self.conn.cursor()

        # VIOLATION: No encryption, no access controls
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                email TEXT,
                password TEXT,
                ssn TEXT,
                credit_card TEXT,
                medical_data TEXT,
                deleted INTEGER DEFAULT 0
            )
        """
        )

    def store_user(self, email, password, ssn, credit_card, medical_data):
        """
        VIOLATIONS:
        - Storing passwords without proper hashing (using weak MD5)
        - Storing SSN in plaintext
        - Storing credit card in plaintext (PCI DSS violation)
        - Storing medical data without encryption (HIPAA + RGPD violation)
        - No consent tracking
        """
        weak_hash = hashlib.md5(password.encode()).hexdigest()

        self.cursor.execute(
            """
            INSERT INTO users (email, password, ssn, credit_card, medical_data)
            VALUES (?, ?, ?, ?, ?)
        """,
            (email, weak_hash, ssn, credit_card, medical_data),
        )

        self.conn.commit()

        # VIOLATION: Logging sensitive data
        print(f"Stored user: {email}, SSN: {ssn}, CC: {credit_card}")

    def delete_user(self, user_id):
        """
        VIOLATION: Soft delete instead of actual deletion
        User has "right to be forgotten" but data still exists
        """
        self.cursor.execute("UPDATE users SET deleted = 1 WHERE id = ?", (user_id,))
        self.conn.commit()
        # Data is still in database!

    def share_data_with_partners(self):
        """
        VIOLATIONS:
        - Sharing data with third parties without consent
        - No legitimate interest or legal basis
        - No documentation of data transfers
        """
        users = self.cursor.execute("SELECT * FROM users WHERE deleted = 0").fetchall()

        # VIOLATION: Sending all user data to external API without encryption
        import requests

        for user in users:
            requests.post(
                "http://random-partner.com/api/users",
                json={"email": user[1], "ssn": user[3], "medical": user[5]},
            )

    def export_user_data(self, user_id):
        """
        VIOLATION: No data portability implementation
        """
        raise NotImplementedError("We don't support data export")


# VIOLATION: No audit logging of data access
# VIOLATION: No data retention policy implementation
# VIOLATION: No encryption in transit (HTTP instead of HTTPS)
# VIOLATION: No access controls or authentication
# VIOLATION: No breach notification system
